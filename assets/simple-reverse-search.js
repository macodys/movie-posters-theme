/**
 * Simple Reverse Image Search
 * Uses free APIs to find original images
 */

class SimpleReverseSearch {
  constructor() {
    this.apiKey = 'your-api-key-here'; // You can get free API keys
    this.searchEngines = [
      'google',
      'yandex', 
      'bing'
    ];
  }

  /**
   * Search for original image using multiple free methods
   */
  async searchImage(imageUrl) {
    try {
      console.log(`🔍 Searching for original: ${imageUrl}`);
      
      // Method 1: Use Google Custom Search API (free tier: 100 searches/day)
      const googleResults = await this.searchGoogleCustomSearch(imageUrl);
      if (googleResults.length > 0) {
        return this.selectBestResult(googleResults);
      }
      
      // Method 2: Use TinEye API (free tier: 500 searches/month)
      const tinEyeResults = await this.searchTinEye(imageUrl);
      if (tinEyeResults.length > 0) {
        return this.selectBestResult(tinEyeResults);
      }
      
      // Method 3: Use SerpAPI (free tier: 100 searches/month)
      const serpResults = await this.searchSerpAPI(imageUrl);
      if (serpResults.length > 0) {
        return this.selectBestResult(serpResults);
      }
      
      // Method 4: Fallback to direct image analysis
      return await this.analyzeImageDirectly(imageUrl);
      
    } catch (error) {
      console.error('❌ Search failed:', error);
      return null;
    }
  }

  /**
   * Google Custom Search API
   */
  async searchGoogleCustomSearch(imageUrl) {
    try {
      const response = await fetch(`https://www.googleapis.com/customsearch/v1?key=${this.apiKey}&cx=your-search-engine-id&searchType=image&imgUrl=${encodeURIComponent(imageUrl)}`);
      
      if (!response.ok) {
        throw new Error(`Google API failed: ${response.status}`);
      }
      
      const data = await response.json();
      const results = [];
      
      if (data.items) {
        data.items.forEach(item => {
          results.push({
            url: item.link,
            width: item.image.width || 800,
            height: item.image.height || 600,
            quality: this.calculateQuality(item),
            source: 'Google Custom Search',
            title: item.title
          });
        });
      }
      
      return results;
      
    } catch (error) {
      console.error('❌ Google Custom Search failed:', error);
      return [];
    }
  }

  /**
   * TinEye API
   */
  async searchTinEye(imageUrl) {
    try {
      const response = await fetch(`https://api.tineye.com/rest/search/?url=${encodeURIComponent(imageUrl)}&limit=10`, {
        headers: {
          'Authorization': `Basic ${btoa(`${this.apiKey}:`)}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`TinEye API failed: ${response.status}`);
      }
      
      const data = await response.json();
      const results = [];
      
      if (data.results) {
        data.results.forEach(result => {
          results.push({
            url: result.image_url,
            width: result.width || 800,
            height: result.height || 600,
            quality: 0.9, // TinEye results are usually high quality
            source: 'TinEye',
            title: result.title || ''
          });
        });
      }
      
      return results;
      
    } catch (error) {
      console.error('❌ TinEye API failed:', error);
      return [];
    }
  }

  /**
   * SerpAPI
   */
  async searchSerpAPI(imageUrl) {
    try {
      const response = await fetch(`https://serpapi.com/search.json?engine=google_reverse_image&image_url=${encodeURIComponent(imageUrl)}&api_key=${this.apiKey}`);
      
      if (!response.ok) {
        throw new Error(`SerpAPI failed: ${response.status}`);
      }
      
      const data = await response.json();
      const results = [];
      
      if (data.image_results) {
        data.image_results.forEach(result => {
          results.push({
            url: result.link,
            width: result.image.width || 800,
            height: result.image.height || 600,
            quality: this.calculateQuality(result),
            source: 'SerpAPI',
            title: result.title
          });
        });
      }
      
      return results;
      
    } catch (error) {
      console.error('❌ SerpAPI failed:', error);
      return [];
    }
  }

  /**
   * Direct image analysis (fallback method)
   */
  async analyzeImageDirectly(imageUrl) {
    try {
      // This is a simplified approach that tries to find higher resolution versions
      const baseUrl = imageUrl.split('?')[0]; // Remove query parameters
      const variations = this.generateImageVariations(baseUrl);
      
      for (const variation of variations) {
        const isValid = await this.validateImageUrl(variation);
        if (isValid) {
          return {
            url: variation,
            width: 1920,
            height: 2880,
            quality: 0.8,
            source: 'Direct Analysis',
            title: 'High Resolution Version'
          };
        }
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ Direct analysis failed:', error);
      return null;
    }
  }

  /**
   * Generate possible image variations
   */
  generateImageVariations(baseUrl) {
    const variations = [];
    
    // Common high-resolution suffixes
    const suffixes = [
      '_hq', '_hd', '_4k', '_uhd', '_large', '_big', '_original',
      '_1920x2880', '_2048x3072', '_2560x3840'
    ];
    
    // Common high-resolution prefixes
    const prefixes = [
      'hq_', 'hd_', '4k_', 'uhd_', 'large_', 'big_', 'original_'
    ];
    
    // Try different file extensions
    const extensions = ['.jpg', '.jpeg', '.png', '.webp'];
    
    // Generate variations
    suffixes.forEach(suffix => {
      extensions.forEach(ext => {
        variations.push(baseUrl.replace(/\.[^.]+$/, `${suffix}${ext}`));
      });
    });
    
    prefixes.forEach(prefix => {
      const fileName = baseUrl.split('/').pop();
      const newFileName = prefix + fileName;
      variations.push(baseUrl.replace(/[^/]+$/, newFileName));
    });
    
    return variations;
  }

  /**
   * Validate if image URL is accessible
   */
  async validateImageUrl(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Calculate image quality score
   */
  calculateQuality(item) {
    let quality = 0.5;
    
    // Size factor
    const width = item.image?.width || item.width || 800;
    const height = item.image?.height || item.height || 600;
    const totalPixels = width * height;
    
    if (totalPixels > 2000000) quality += 0.3;
    else if (totalPixels > 1000000) quality += 0.2;
    else if (totalPixels > 500000) quality += 0.1;
    
    // Title quality indicators
    const title = (item.title || '').toLowerCase();
    if (title.includes('high') || title.includes('hd') || title.includes('4k')) {
      quality += 0.2;
    }
    if (title.includes('poster') || title.includes('movie')) {
      quality += 0.1;
    }
    
    return Math.min(quality, 1.0);
  }

  /**
   * Select the best result from search results
   */
  selectBestResult(results) {
    if (!results || results.length === 0) return null;
    
    return results.reduce((best, current) => {
      const bestScore = this.calculateResultScore(best);
      const currentScore = this.calculateResultScore(current);
      return currentScore > bestScore ? current : best;
    });
  }

  /**
   * Calculate result score
   */
  calculateResultScore(result) {
    let score = 0;
    
    // Quality score
    score += (result.quality || 0.5) * 5;
    
    // Size score
    const totalPixels = (result.width || 800) * (result.height || 600);
    score += Math.min(totalPixels / 1000000, 10);
    
    // Source reliability
    const sourceScores = {
      'TinEye': 5,
      'Google Custom Search': 4,
      'SerpAPI': 3,
      'Direct Analysis': 2
    };
    score += sourceScores[result.source] || 1;
    
    return score;
  }
}

// Export for use
window.SimpleReverseSearch = SimpleReverseSearch;
