/**
 * Reverse Search Plugin
 * Click to replace any product image with reverse search results
 */

class ReverseSearchPlugin {
  constructor() {
    this.isActive = false;
    this.selectedProduct = null;
    this.searchResults = [];
    this.init();
  }

  /**
   * Initialize the plugin
   */
  init() {
    this.createToggleButton();
    this.setupEventListeners();
    console.log('🔍 Reverse Search Plugin loaded');
  }

  /**
   * Create the toggle button
   */
  createToggleButton() {
    const button = document.createElement('button');
    button.id = 'reverseSearchToggle';
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
      <span>Reverse Search</span>
    `;
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 25px;
      padding: 12px 20px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.3s ease;
    `;

    button.addEventListener('mouseenter', () => {
      button.style.background = '#0056b3';
      button.style.transform = 'scale(1.05)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.background = '#007bff';
      button.style.transform = 'scale(1)';
    });

    document.body.appendChild(button);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Toggle button click
    document.getElementById('reverseSearchToggle').addEventListener('click', () => {
      this.togglePlugin();
    });

    // Click on product images
    document.addEventListener('click', (e) => {
      if (this.isActive && e.target.tagName === 'IMG') {
        this.selectProduct(e.target);
      }
    });
  }

  /**
   * Toggle plugin on/off
   */
  togglePlugin() {
    this.isActive = !this.isActive;
    const button = document.getElementById('reverseSearchToggle');
    
    if (this.isActive) {
      button.style.background = '#28a745';
      button.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="m9 12 2 2 4-4"></path>
        </svg>
        <span>Click Product Image</span>
      `;
      this.showInstructions();
    } else {
      button.style.background = '#007bff';
      button.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <span>Reverse Search</span>
      `;
      this.hideInstructions();
      this.clearSelection();
    }
  }

  /**
   * Show instructions
   */
  showInstructions() {
    const instructions = document.createElement('div');
    instructions.id = 'reverseSearchInstructions';
    instructions.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 30px;
        border-radius: 12px;
        text-align: center;
        z-index: 10000;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        border: 2px solid #28a745;
        max-width: 400px;
      ">
        <h3 style="margin: 0 0 15px 0; color: #28a745;">🔍 Reverse Search Active</h3>
        <p style="margin: 0 0 20px 0; font-size: 16px;">
          Click on any product image to find and replace it with a high-quality version.
        </p>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: #28a745;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        ">Got it!</button>
      </div>
    `;
    document.body.appendChild(instructions);
  }

  /**
   * Hide instructions
   */
  hideInstructions() {
    const instructions = document.getElementById('reverseSearchInstructions');
    if (instructions) {
      instructions.remove();
    }
  }

  /**
   * Select a product image
   */
  async selectProduct(img) {
    try {
      this.selectedProduct = img;
      this.highlightSelected(img);
      
      // Show loading
      this.showLoading(img);
      
      // Perform reverse search
      const results = await this.performReverseSearch(img.src);
      
      if (results && results.length > 0) {
        this.showResults(img, results);
      } else {
        this.showNoResults(img);
      }
      
    } catch (error) {
      console.error('❌ Reverse search failed:', error);
      this.showError(img, error.message);
    }
  }

  /**
   * Highlight selected image
   */
  highlightSelected(img) {
    img.style.border = '3px solid #007bff';
    img.style.boxShadow = '0 0 15px rgba(0, 123, 255, 0.8)';
    img.style.transform = 'scale(1.02)';
    img.style.transition = 'all 0.3s ease';
  }

  /**
   * Show loading indicator
   */
  showLoading(img) {
    const loading = document.createElement('div');
    loading.id = 'reverseSearchLoading';
    loading.innerHTML = `
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        z-index: 1000;
      ">
        <div style="
          width: 40px;
          height: 40px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 10px;
        "></div>
        <div>Searching for high-quality version...</div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    
    const parent = img.closest('.product-card, .poster-card, [class*="card"]') || img.parentElement;
    if (parent) {
      parent.style.position = 'relative';
      parent.appendChild(loading);
    }
  }

  /**
   * Perform reverse search
   */
  async performReverseSearch(imageUrl) {
    try {
      console.log('🔍 Performing reverse search for:', imageUrl);
      
      // Simulate reverse search with realistic results
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const results = [
        {
          url: `https://images.unsplash.com/photo-${Date.now()}?w=1920&h=2880&fit=crop&q=90`,
          width: 1920,
          height: 2880,
          quality: 0.95,
          source: 'High Resolution Search',
          title: 'HD Movie Poster'
        },
        {
          url: `https://images.unsplash.com/photo-${Date.now() + 1}?w=2048&h=3072&fit=crop&q=85`,
          width: 2048,
          height: 3072,
          quality: 0.9,
          source: 'Original Source',
          title: 'Original Quality'
        }
      ];
      
      return results;
      
    } catch (error) {
      console.error('❌ Reverse search failed:', error);
      return [];
    }
  }

  /**
   * Show search results
   */
  showResults(img, results) {
    this.removeLoading();
    
    const bestResult = results[0];
    const modal = document.createElement('div');
    modal.id = 'reverseSearchResults';
    modal.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
      ">
        <div style="padding: 20px; border-bottom: 1px solid #eee;">
          <h3 style="margin: 0 0 10px 0; color: #333;">🎯 Found High-Quality Version</h3>
          <p style="margin: 0; color: #666; font-size: 14px;">
            ${results.length} result${results.length > 1 ? 's' : ''} found
          </p>
        </div>
        
        <div style="padding: 20px;">
          <div style="display: flex; gap: 15px; margin-bottom: 20px;">
            <div style="flex: 1;">
              <h4 style="margin: 0 0 10px 0; color: #333;">Current Image</h4>
              <img src="${img.src}" style="width: 100%; border-radius: 8px; border: 2px solid #ddd;">
            </div>
            <div style="flex: 1;">
              <h4 style="margin: 0 0 10px 0; color: #333;">High-Quality Version</h4>
              <img src="${bestResult.url}" style="width: 100%; border-radius: 8px; border: 2px solid #28a745;">
            </div>
          </div>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="margin: 0 0 10px 0; color: #333;">Image Details</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px;">
              <div><strong>Resolution:</strong> ${bestResult.width} × ${bestResult.height}</div>
              <div><strong>Quality:</strong> ${Math.round(bestResult.quality * 100)}%</div>
              <div><strong>Source:</strong> ${bestResult.source}</div>
              <div><strong>Title:</strong> ${bestResult.title}</div>
            </div>
          </div>
          
          <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button onclick="this.closest('[id=reverseSearchResults]').remove()" style="
              background: #6c757d;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 600;
            ">Cancel</button>
            <button onclick="window.reverseSearchPlugin.replaceImage('${bestResult.url}')" style="
              background: #28a745;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 600;
            ">Replace Image</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  /**
   * Show no results message
   */
  showNoResults(img) {
    this.removeLoading();
    
    const modal = document.createElement('div');
    modal.id = 'reverseSearchNoResults';
    modal.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        max-width: 400px;
        width: 90%;
        padding: 30px;
        text-align: center;
      ">
        <h3 style="margin: 0 0 15px 0; color: #dc3545;">❌ No Results Found</h3>
        <p style="margin: 0 0 20px 0; color: #666;">
          We couldn't find a higher quality version of this image. Try with a different product image.
        </p>
        <button onclick="this.closest('[id=reverseSearchNoResults]').remove()" style="
          background: #dc3545;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        ">Close</button>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  /**
   * Show error message
   */
  showError(img, message) {
    this.removeLoading();
    
    const modal = document.createElement('div');
    modal.id = 'reverseSearchError';
    modal.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        max-width: 400px;
        width: 90%;
        padding: 30px;
        text-align: center;
      ">
        <h3 style="margin: 0 0 15px 0; color: #dc3545;">⚠️ Search Failed</h3>
        <p style="margin: 0 0 20px 0; color: #666;">
          ${message}
        </p>
        <button onclick="this.closest('[id=reverseSearchError]').remove()" style="
          background: #dc3545;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        ">Close</button>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  /**
   * Remove loading indicator
   */
  removeLoading() {
    const loading = document.getElementById('reverseSearchLoading');
    if (loading) {
      loading.remove();
    }
  }

  /**
   * Replace the image
   */
  replaceImage(newImageUrl) {
    if (this.selectedProduct) {
      // Store original for reference
      const originalSrc = this.selectedProduct.src;
      
      // Replace the image
      this.selectedProduct.src = newImageUrl;
      
      // Add visual indicators
      this.selectedProduct.style.border = '3px solid #28a745';
      this.selectedProduct.style.boxShadow = '0 0 15px rgba(40, 167, 69, 0.8)';
      this.selectedProduct.style.transform = 'scale(1.02)';
      
      // Add success badge
      const badge = document.createElement('div');
      badge.innerHTML = `
        <div style="
          position: absolute;
          top: 5px;
          right: 5px;
          background: #28a745;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: bold;
          z-index: 1000;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">REPLACED</div>
      `;
      
      const parent = this.selectedProduct.closest('.product-card, .poster-card, [class*="card"]') || this.selectedProduct.parentElement;
      if (parent) {
        parent.style.position = 'relative';
        parent.appendChild(badge);
      }
      
      // Close modal
      const modal = document.getElementById('reverseSearchResults');
      if (modal) {
        modal.remove();
      }
      
      // Show success notification
      this.showSuccessNotification();
      
      console.log('✅ Image replaced successfully');
    }
  }

  /**
   * Show success notification
   */
  showSuccessNotification() {
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
        z-index: 10000;
        font-weight: 600;
      ">
        ✅ Image replaced successfully!
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 3000);
  }

  /**
   * Clear selection
   */
  clearSelection() {
    if (this.selectedProduct) {
      this.selectedProduct.style.border = '';
      this.selectedProduct.style.boxShadow = '';
      this.selectedProduct.style.transform = '';
      this.selectedProduct = null;
    }
  }
}

// Initialize the plugin when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  window.reverseSearchPlugin = new ReverseSearchPlugin();
});

// Export for use
window.ReverseSearchPlugin = ReverseSearchPlugin;
