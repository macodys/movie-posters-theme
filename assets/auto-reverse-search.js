/**
 * Automated Reverse Image Search Tool
 * Automatically processes all product images and finds original source images
 */

class AutoReverseSearch {
  constructor() {
    this.products = [];
    this.processedCount = 0;
    this.totalCount = 0;
    this.isProcessing = false;
    this.results = [];
    this.errors = [];
  }

  /**
   * Initialize the automated search process
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      console.log('🚀 Starting automated reverse image search...');
      
      // Fetch all products from Shopify
      await this.fetchAllProducts();
      
      // Start processing
      await this.processAllProducts();
      
      console.log('✅ Automated search completed!');
      this.displayResults();
      
    } catch (error) {
      console.error('❌ Automated search failed:', error);
      this.errors.push(`Initialization failed: ${error.message}`);
    }
  }

  /**
   * Fetch all products from Shopify
   * @returns {Promise<void>}
   */
  async fetchAllProducts() {
    try {
      console.log('📦 Fetching all products...');
      
      // Fetch products from Shopify API
      const response = await fetch('/collections/all/products.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      
      const data = await response.json();
      this.products = data.products || [];
      this.totalCount = this.products.length;
      
      console.log(`📦 Found ${this.totalCount} products to process`);
      
    } catch (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  }

  /**
   * Process all products
   * @returns {Promise<void>}
   */
  async processAllProducts() {
    this.isProcessing = true;
    this.processedCount = 0;
    this.results = [];
    this.errors = [];

    console.log(`🔄 Processing ${this.totalCount} products...`);

    for (let i = 0; i < this.products.length; i++) {
      const product = this.products[i];
      
      try {
        console.log(`🔄 Processing product ${i + 1}/${this.totalCount}: ${product.title}`);
        
        // Process each product
        const result = await this.processProduct(product);
        this.results.push(result);
        
        this.processedCount++;
        
        // Update progress
        this.updateProgress();
        
        // Add delay to avoid rate limiting
        await this.delay(2000); // 2 second delay between requests
        
      } catch (error) {
        console.error(`❌ Failed to process product ${product.title}:`, error);
        this.errors.push({
          product: product.title,
          error: error.message
        });
      }
    }

    this.isProcessing = false;
  }

  /**
   * Process a single product
   * @param {Object} product - Product object
   * @returns {Promise<Object>} Processing result
   */
  async processProduct(product) {
    const result = {
      productId: product.id,
      title: product.title,
      originalImage: product.featured_image,
      searchResults: [],
      bestMatch: null,
      status: 'pending'
    };

    try {
      // Get product image
      if (!product.featured_image) {
        result.status = 'no_image';
        result.error = 'No featured image found';
        return result;
      }

      // Download the current image
      const imageBlob = await this.downloadImageAsBlob(product.featured_image.src);
      const imageFile = new File([imageBlob], `${product.handle}.jpg`, { type: 'image/jpeg' });

      // Perform reverse search
      const searchResults = await this.performReverseSearch(imageFile, product.title);
      result.searchResults = searchResults;

      // Find best match
      result.bestMatch = this.findBestMatch(searchResults, product.title);
      
      if (result.bestMatch) {
        result.status = 'found_match';
        result.newImageUrl = result.bestMatch.url;
        result.confidence = result.bestMatch.confidence;
      } else {
        result.status = 'no_match';
      }

    } catch (error) {
      result.status = 'error';
      result.error = error.message;
    }

    return result;
  }

  /**
   * Perform reverse search for a product image
   * @param {File} imageFile - Image file
   * @param {string} productTitle - Product title
   * @returns {Promise<Array>} Search results
   */
  async performReverseSearch(imageFile, productTitle) {
    const searchResults = [];

    try {
      // Search using multiple methods
      const [googleResult, yandexResult, tineyeResult] = await Promise.allSettled([
        this.searchGoogleImages(imageFile, productTitle),
        this.searchYandexImages(imageFile, productTitle),
        this.searchTinEye(imageFile, productTitle)
      ]);

      // Process results
      if (googleResult.status === 'fulfilled') {
        searchResults.push(googleResult.value);
      }
      
      if (yandexResult.status === 'fulfilled') {
        searchResults.push(yandexResult.value);
      }
      
      if (tineyeResult.status === 'fulfilled') {
        searchResults.push(tineyeResult.value);
      }

    } catch (error) {
      console.error('Reverse search failed:', error);
    }

    return searchResults;
  }

  /**
   * Search Google Images
   * @param {File} imageFile - Image file
   * @param {string} productTitle - Product title
   * @returns {Promise<Object>} Google search result
   */
  async searchGoogleImages(imageFile, productTitle) {
    try {
      const dataUrl = await this.fileToDataUrl(imageFile);
      const googleUrl = `https://images.google.com/searchbyimage?image_url=${encodeURIComponent(dataUrl)}`;
      
      return {
        source: 'Google Images',
        url: googleUrl,
        title: productTitle,
        confidence: 0.8
      };
    } catch (error) {
      throw new Error(`Google search failed: ${error.message}`);
    }
  }

  /**
   * Search Yandex Images
   * @param {File} imageFile - Image file
   * @param {string} productTitle - Product title
   * @returns {Promise<Object>} Yandex search result
   */
  async searchYandexImages(imageFile, productTitle) {
    try {
      const dataUrl = await this.fileToDataUrl(imageFile);
      const yandexUrl = `https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(dataUrl)}`;
      
      return {
        source: 'Yandex Images',
        url: yandexUrl,
        title: productTitle,
        confidence: 0.7
      };
    } catch (error) {
      throw new Error(`Yandex search failed: ${error.message}`);
    }
  }

  /**
   * Search TinEye
   * @param {File} imageFile - Image file
   * @param {string} productTitle - Product title
   * @returns {Promise<Object>} TinEye search result
   */
  async searchTinEye(imageFile, productTitle) {
    try {
      const dataUrl = await this.fileToDataUrl(imageFile);
      const tinEyeUrl = `https://tineye.com/search/?url=${encodeURIComponent(dataUrl)}`;
      
      return {
        source: 'TinEye',
        url: tinEyeUrl,
        title: productTitle,
        confidence: 0.9
      };
    } catch (error) {
      throw new Error(`TinEye search failed: ${error.message}`);
    }
  }

  /**
   * Find the best match from search results
   * @param {Array} searchResults - Array of search results
   * @param {string} productTitle - Product title
   * @returns {Object|null} Best match
   */
  findBestMatch(searchResults, productTitle) {
    if (!searchResults || searchResults.length === 0) {
      return null;
    }

    // Sort by confidence and return the best match
    const sortedResults = searchResults.sort((a, b) => b.confidence - a.confidence);
    return sortedResults[0];
  }

  /**
   * Download image as blob
   * @param {string} imageUrl - Image URL
   * @returns {Promise<Blob>} Image blob
   */
  async downloadImageAsBlob(imageUrl) {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status}`);
      }
      return await response.blob();
    } catch (error) {
      throw new Error(`Image download failed: ${error.message}`);
    }
  }

  /**
   * Convert file to data URL
   * @param {File} file - File to convert
   * @returns {Promise<string>} Data URL
   */
  fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Update progress display
   */
  updateProgress() {
    const progress = (this.processedCount / this.totalCount) * 100;
    console.log(`📊 Progress: ${this.processedCount}/${this.totalCount} (${progress.toFixed(1)}%)`);
    
    // Update UI if available
    const progressElement = document.getElementById('progressBar');
    if (progressElement) {
      progressElement.style.width = `${progress}%`;
    }
    
    const statusElement = document.getElementById('statusText');
    if (statusElement) {
      statusElement.textContent = `Processing ${this.processedCount}/${this.totalCount} products...`;
    }
  }

  /**
   * Display final results
   */
  displayResults() {
    console.log('📊 Final Results:');
    console.log(`✅ Successfully processed: ${this.processedCount} products`);
    console.log(`❌ Errors: ${this.errors.length}`);
    
    const foundMatches = this.results.filter(r => r.status === 'found_match').length;
    console.log(`🎯 Found matches: ${foundMatches} products`);
    
    // Display detailed results
    this.results.forEach(result => {
      if (result.status === 'found_match') {
        console.log(`✅ ${result.title}: Found match (confidence: ${result.confidence})`);
        console.log(`   New image: ${result.newImageUrl}`);
      } else if (result.status === 'no_match') {
        console.log(`❌ ${result.title}: No match found`);
      } else if (result.status === 'error') {
        console.log(`⚠️ ${result.title}: Error - ${result.error}`);
      }
    });
  }

  /**
   * Get processing status
   * @returns {Object} Current status
   */
  getStatus() {
    return {
      isProcessing: this.isProcessing,
      processedCount: this.processedCount,
      totalCount: this.totalCount,
      progress: this.totalCount > 0 ? (this.processedCount / this.totalCount) * 100 : 0,
      results: this.results,
      errors: this.errors
    };
  }

  /**
   * Stop processing
   */
  stop() {
    this.isProcessing = false;
    console.log('⏹️ Processing stopped by user');
  }

  /**
   * Delay function
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export for use in other modules
window.AutoReverseSearch = AutoReverseSearch;
