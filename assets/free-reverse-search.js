/**
 * Free Reverse Image Search Tool
 * Uses web scraping and free APIs to find original source images
 */

class FreeReverseSearch {
  constructor() {
    this.searchResults = new Map();
    this.isProcessing = false;
  }

  /**
   * Perform reverse image search using free methods
   * @param {File} imageFile - The image file to search
   * @param {string} productTitle - Product title for context
   * @returns {Promise<Object>} Search results
   */
  async searchImage(imageFile, productTitle = '') {
    if (this.isProcessing) {
      throw new Error('Another search is already in progress');
    }

    this.isProcessing = true;
    const results = {
      google: null,
      yandex: null,
      bestMatch: null,
      error: null
    };

    try {
      // Convert image to base64 for API calls
      const base64Image = await this.fileToBase64(imageFile);
      
      // Search using multiple free services
      const [googleResult, yandexResult] = await Promise.allSettled([
        this.searchGoogleImages(imageFile, productTitle),
        this.searchYandexImages(imageFile, productTitle)
      ]);

      // Process results
      if (googleResult.status === 'fulfilled') {
        results.google = googleResult.value;
      }
      
      if (yandexResult.status === 'fulfilled') {
        results.yandex = yandexResult.value;
      }

      // Find best match
      results.bestMatch = this.findBestMatch(results.google, results.yandex, productTitle);

    } catch (error) {
      results.error = error.message;
      console.error('Reverse image search error:', error);
    } finally {
      this.isProcessing = false;
    }

    return results;
  }

  /**
   * Search Google Images using reverse image search
   * @param {File} imageFile - Image file
   * @param {string} productTitle - Product title for context
   * @returns {Promise<Object>} Google search results
   */
  async searchGoogleImages(imageFile, productTitle) {
    try {
      // Create a data URL for the image
      const dataUrl = await this.fileToDataUrl(imageFile);
      
      // Create a temporary image element
      const img = document.createElement('img');
      img.src = dataUrl;
      
      // Wait for image to load
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      // Create Google reverse search URL
      const googleUrl = `https://images.google.com/searchbyimage?image_url=${encodeURIComponent(dataUrl)}`;
      
      return {
        url: googleUrl,
        method: 'manual',
        instructions: 'Click the link to perform Google reverse image search',
        title: 'Google Reverse Search',
        source: 'Google Images'
      };
    } catch (error) {
      throw new Error(`Google search setup failed: ${error.message}`);
    }
  }

  /**
   * Search Yandex Images (free alternative)
   * @param {File} imageFile - Image file
   * @param {string} productTitle - Product title for context
   * @returns {Promise<Object>} Yandex search results
   */
  async searchYandexImages(imageFile, productTitle) {
    try {
      // Create a data URL for the image
      const dataUrl = await this.fileToDataUrl(imageFile);
      
      // Create Yandex reverse search URL
      const yandexUrl = `https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(dataUrl)}`;
      
      return {
        url: yandexUrl,
        method: 'manual',
        instructions: 'Click the link to perform Yandex reverse image search',
        title: 'Yandex Reverse Search',
        source: 'Yandex Images'
      };
    } catch (error) {
      throw new Error(`Yandex search setup failed: ${error.message}`);
    }
  }

  /**
   * Search using TinEye (free tier)
   * @param {File} imageFile - Image file
   * @param {string} productTitle - Product title for context
   * @returns {Promise<Object>} TinEye search results
   */
  async searchTinEye(imageFile, productTitle) {
    try {
      // Create a data URL for the image
      const dataUrl = await this.fileToDataUrl(imageFile);
      
      // Create TinEye reverse search URL
      const tinEyeUrl = `https://tineye.com/search/?url=${encodeURIComponent(dataUrl)}`;
      
      return {
        url: tinEyeUrl,
        method: 'manual',
        instructions: 'Click the link to perform TinEye reverse image search',
        title: 'TinEye Reverse Search',
        source: 'TinEye'
      };
    } catch (error) {
      throw new Error(`TinEye search setup failed: ${error.message}`);
    }
  }

  /**
   * Search using Bing Visual Search (free tier)
   * @param {File} imageFile - Image file
   * @param {string} productTitle - Product title for context
   * @returns {Promise<Object>} Bing search results
   */
  async searchBingVisual(imageFile, productTitle) {
    try {
      // Create a data URL for the image
      const dataUrl = await this.fileToDataUrl(imageFile);
      
      // Create Bing Visual Search URL
      const bingUrl = `https://www.bing.com/images/search?view=detailv2&iss=sbi&form=SBIVSP&sbisrc=UrlPaste&q=imgurl:${encodeURIComponent(dataUrl)}`;
      
      return {
        url: bingUrl,
        method: 'manual',
        instructions: 'Click the link to perform Bing Visual Search',
        title: 'Bing Visual Search',
        source: 'Bing'
      };
    } catch (error) {
      throw new Error(`Bing search setup failed: ${error.message}`);
    }
  }

  /**
   * Find the best match from multiple search results
   * @param {Object} googleResults - Google search results
   * @param {Object} yandexResults - Yandex search results
   * @param {string} productTitle - Product title for context
   * @returns {Object} Best match
   */
  findBestMatch(googleResults, yandexResults, productTitle) {
    const candidates = [];

    // Add Google results
    if (googleResults) {
      candidates.push(googleResults);
    }

    // Add Yandex results
    if (yandexResults) {
      candidates.push(yandexResults);
    }

    // For manual search methods, return the first available result
    return candidates[0] || null;
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
   * Convert file to base64
   * @param {File} file - File to convert
   * @returns {Promise<string>} Base64 string
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Download image from URL
   * @param {string} url - Image URL
   * @param {string} filename - Filename for download
   * @returns {Promise<void>}
   */
  async downloadImage(url, filename) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      throw new Error(`Download failed: ${error.message}`);
    }
  }

  /**
   * Get all available search methods
   * @returns {Array} Available search methods
   */
  getAvailableMethods() {
    return [
      {
        name: 'Google Images',
        description: 'Most comprehensive reverse image search',
        method: 'google'
      },
      {
        name: 'Yandex Images',
        description: 'Good alternative with different results',
        method: 'yandex'
      },
      {
        name: 'TinEye',
        description: 'Professional reverse image search',
        method: 'tineye'
      },
      {
        name: 'Bing Visual Search',
        description: 'Microsoft\'s visual search',
        method: 'bing'
      }
    ];
  }

  /**
   * Perform search with specific method
   * @param {File} imageFile - Image file
   * @param {string} method - Search method
   * @param {string} productTitle - Product title for context
   * @returns {Promise<Object>} Search results
   */
  async searchWithMethod(imageFile, method, productTitle = '') {
    switch (method) {
      case 'google':
        return await this.searchGoogleImages(imageFile, productTitle);
      case 'yandex':
        return await this.searchYandexImages(imageFile, productTitle);
      case 'tineye':
        return await this.searchTinEye(imageFile, productTitle);
      case 'bing':
        return await this.searchBingVisual(imageFile, productTitle);
      default:
        throw new Error(`Unknown search method: ${method}`);
    }
  }

  /**
   * Get search results for a product
   * @param {string} productId - Product ID
   * @returns {Object} Cached results
   */
  getCachedResults(productId) {
    return this.searchResults.get(productId) || null;
  }

  /**
   * Cache search results
   * @param {string} productId - Product ID
   * @param {Object} results - Search results
   */
  cacheResults(productId, results) {
    this.searchResults.set(productId, results);
  }
}

// Export for use in other modules
window.FreeReverseSearch = FreeReverseSearch;
