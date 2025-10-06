/**
 * Reverse Image Search Tool
 * Finds original source images for products using free reverse image search services
 */

class ReverseImageSearch {
  constructor() {
    this.searchResults = new Map();
    this.isProcessing = false;
  }

  /**
   * Perform reverse image search using multiple free services
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
      bing: null,
      bestMatch: null,
      error: null
    };

    try {
      // Convert image to base64 for API calls
      const base64Image = await this.fileToBase64(imageFile);
      
      // Search using multiple services in parallel
      const [googleResult, bingResult] = await Promise.allSettled([
        this.searchGoogleImages(base64Image, productTitle),
        this.searchBingVisual(base64Image, productTitle)
      ]);

      // Process results
      if (googleResult.status === 'fulfilled') {
        results.google = googleResult.value;
      }
      
      if (bingResult.status === 'fulfilled') {
        results.bing = bingResult.value;
      }

      // Find best match
      results.bestMatch = this.findBestMatch(results.google, results.bing, productTitle);

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
   * @param {string} base64Image - Base64 encoded image
   * @param {string} productTitle - Product title for context
   * @returns {Promise<Object>} Google search results
   */
  async searchGoogleImages(base64Image, productTitle) {
    try {
      // Create a temporary image element for Google search
      const img = new Image();
      img.src = `data:image/jpeg;base64,${base64Image}`;
      
      // Open Google Images in new tab with reverse search
      const googleUrl = `https://images.google.com/searchbyimage?image_url=${encodeURIComponent(img.src)}`;
      
      // For automated search, we'll use a different approach
      // This is a simplified version - in production, you'd use a proper API
      return {
        url: googleUrl,
        method: 'manual',
        instructions: 'Click the link to perform Google reverse image search'
      };
    } catch (error) {
      throw new Error(`Google search failed: ${error.message}`);
    }
  }

  /**
   * Search Bing Visual Search (free tier)
   * @param {string} base64Image - Base64 encoded image
   * @param {string} productTitle - Product title for context
   * @returns {Promise<Object>} Bing search results
   */
  async searchBingVisual(base64Image, productTitle) {
    try {
      // Bing Visual Search API (free tier)
      const response = await fetch('https://api.bing.microsoft.com/v7.0/images/visualsearch', {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': 'YOUR_BING_API_KEY', // You'll need to get this
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: {
            data: base64Image
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Bing API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseBingResults(data, productTitle);
    } catch (error) {
      throw new Error(`Bing search failed: ${error.message}`);
    }
  }

  /**
   * Parse Bing Visual Search results
   * @param {Object} data - Bing API response
   * @param {string} productTitle - Product title for context
   * @returns {Object} Parsed results
   */
  parseBingResults(data, productTitle) {
    const results = {
      matches: [],
      similarImages: [],
      webPages: []
    };

    if (data.tags && data.tags.length > 0) {
      data.tags.forEach(tag => {
        if (tag.actions) {
          tag.actions.forEach(action => {
            if (action.actionType === 'VisualSearch') {
              results.similarImages = action.data.value || [];
            }
          });
        }
      });
    }

    return results;
  }

  /**
   * Find the best match from multiple search results
   * @param {Object} googleResults - Google search results
   * @param {Object} bingResults - Bing search results
   * @param {string} productTitle - Product title for context
   * @returns {Object} Best match
   */
  findBestMatch(googleResults, bingResults, productTitle) {
    const candidates = [];

    // Add Google results
    if (googleResults && googleResults.matches) {
      candidates.push(...googleResults.matches);
    }

    // Add Bing results
    if (bingResults && bingResults.similarImages) {
      candidates.push(...bingResults.similarImages);
    }

    // Score and rank candidates
    const scoredCandidates = candidates.map(candidate => ({
      ...candidate,
      score: this.calculateMatchScore(candidate, productTitle)
    }));

    // Sort by score and return best match
    scoredCandidates.sort((a, b) => b.score - a.score);
    return scoredCandidates[0] || null;
  }

  /**
   * Calculate match score for a candidate
   * @param {Object} candidate - Search result candidate
   * @param {string} productTitle - Product title for context
   * @returns {number} Match score
   */
  calculateMatchScore(candidate, productTitle) {
    let score = 0;

    // Check if title matches
    if (candidate.title && productTitle) {
      const titleMatch = this.calculateStringSimilarity(
        candidate.title.toLowerCase(),
        productTitle.toLowerCase()
      );
      score += titleMatch * 0.4;
    }

    // Check image quality (resolution)
    if (candidate.width && candidate.height) {
      const resolution = candidate.width * candidate.height;
      if (resolution > 1000000) score += 0.3; // High resolution
      else if (resolution > 500000) score += 0.2; // Medium resolution
      else score += 0.1; // Low resolution
    }

    // Check if it's from a reliable source
    if (candidate.hostPageUrl) {
      const reliableSources = ['imdb.com', 'tmdb.org', 'themoviedb.org', 'movieposterdb.com'];
      const isReliable = reliableSources.some(source => 
        candidate.hostPageUrl.includes(source)
      );
      if (isReliable) score += 0.3;
    }

    return Math.min(score, 1); // Cap at 1
  }

  /**
   * Calculate string similarity using Levenshtein distance
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Similarity score (0-1)
   */
  calculateStringSimilarity(str1, str2) {
    const matrix = [];
    const len1 = str1.length;
    const len2 = str2.length;

    for (let i = 0; i <= len2; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= len1; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len2; i++) {
      for (let j = 1; j <= len1; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    const distance = matrix[len2][len1];
    const maxLength = Math.max(len1, len2);
    return maxLength === 0 ? 1 : (maxLength - distance) / maxLength;
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
window.ReverseImageSearch = ReverseImageSearch;
