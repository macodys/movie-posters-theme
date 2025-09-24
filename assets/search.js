class ModernSearchController {
  constructor() {
    this.searchButton = document.getElementById('searchButton');
    this.searchOverlay = null;
    this.searchInput = null;
    this.isSearchOpen = false;
    this.searchResults = null;
    this.animationDuration = 300;
    
    this.init();
  }

  init() {
    if (this.searchButton) {
      this.searchButton.addEventListener('click', () => this.toggleSearch());
    }
    
    // Close search on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isSearchOpen) {
        this.closeSearch();
      }
    });
  }

  toggleSearch() {
    if (this.isSearchOpen) {
      this.closeSearch();
    } else {
      this.openSearch();
    }
  }

  openSearch() {
    this.isSearchOpen = true;
    this.createSearchOverlay();
    this.animateIn();
  }

  closeSearch() {
    this.animateOut(() => {
      this.isSearchOpen = false;
      if (this.searchOverlay) {
        this.searchOverlay.remove();
        this.searchOverlay = null;
      }
    });
  }

  animateIn() {
    if (!this.searchOverlay) return;
    
    // Initial state
    this.searchOverlay.style.opacity = '0';
    this.searchOverlay.style.transform = 'scale(0.8) translateY(-50px)';
    
    // Animate in
    requestAnimationFrame(() => {
      this.searchOverlay.style.transition = `all ${this.animationDuration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
      this.searchOverlay.style.opacity = '1';
      this.searchOverlay.style.transform = 'scale(1) translateY(0)';
      
      // Focus input after animation
      setTimeout(() => {
        if (this.searchInput) {
          this.searchInput.focus();
        }
      }, this.animationDuration / 2);
    });
  }

  animateOut(callback) {
    if (!this.searchOverlay) {
      callback();
      return;
    }
    
    this.searchOverlay.style.transition = `all ${this.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    this.searchOverlay.style.opacity = '0';
    this.searchOverlay.style.transform = 'scale(0.8) translateY(-50px)';
    
    setTimeout(callback, this.animationDuration);
  }

  createSearchOverlay() {
    // Create overlay
    this.searchOverlay = document.createElement('div');
    this.searchOverlay.className = 'modern-search-overlay';
    this.searchOverlay.innerHTML = `
      <div class="modern-search-modal">
        <div class="search-header">
          <div class="search-input-wrapper">
            <div class="search-input-container">
              <input type="text" placeholder="Search for amazing posters..." class="modern-search-input" id="searchInput">
              <div class="search-underline"></div>
            </div>
            <button class="modern-search-close" id="searchClose">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <div class="modern-search-results" id="searchResults">
          <div class="search-placeholder">
            <div class="placeholder-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <h3>Discover Amazing Posters</h3>
            <p>Start typing to search through our collection of premium movie posters</p>
            <div class="search-suggestions">
              <span class="suggestion-tag">Marvel</span>
              <span class="suggestion-tag">DC</span>
              <span class="suggestion-tag">Star Wars</span>
              <span class="suggestion-tag">Anime</span>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.searchOverlay);
    
    // Get elements
    this.searchInput = document.getElementById('searchInput');
    const searchClose = document.getElementById('searchClose');
    this.searchResults = document.getElementById('searchResults');

    // Add event listeners
    searchClose.addEventListener('click', () => this.closeSearch());
    this.searchOverlay.addEventListener('click', (e) => {
      if (e.target === this.searchOverlay) {
        this.closeSearch();
      }
    });

    // Search functionality with animations
    this.searchInput.addEventListener('input', (e) => {
      this.handleSearchInput(e.target.value);
    });

    // Handle search submission
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.submitSearch(e.target.value);
      }
    });

    // Add suggestion tag click handlers
    this.addSuggestionHandlers();
  }

  handleSearchInput(query) {
    // Animate input underline
    this.animateInputUnderline(query.length > 0);
    
    if (query.length < 2) {
      this.showPlaceholder();
      return;
    }

    // Debounce search
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.performSearch(query);
    }, 300);
  }

  animateInputUnderline(active) {
    const underline = this.searchOverlay?.querySelector('.search-underline');
    if (underline) {
      underline.style.transform = active ? 'scaleX(1)' : 'scaleX(0)';
    }
  }

  addSuggestionHandlers() {
    const suggestionTags = this.searchOverlay?.querySelectorAll('.suggestion-tag');
    suggestionTags?.forEach(tag => {
      tag.addEventListener('click', () => {
        this.searchInput.value = tag.textContent;
        this.searchInput.focus();
        this.handleSearchInput(tag.textContent);
      });
    });
  }

  async performSearch(query) {
    try {
      // Show loading state with animation
      this.showLoading();

      console.log('Starting search for:', query); // Debug log

      // Search products from Shopify with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('/collections/all/products.json', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Shopify API Response:', data); // Debug log
      
      // Check if data has products array
      if (!data || !data.products || !Array.isArray(data.products)) {
        console.error('Invalid API response structure:', data);
        this.showError();
        return;
      }
      
      console.log('Found', data.products.length, 'total products'); // Debug log
      
      // Enhanced search with multiple criteria
      const results = data.products.filter(product => {
        if (!product || !product.title) return false;
        
        const searchTerm = query.toLowerCase();
        const title = product.title.toLowerCase();
        const tags = product.tags ? product.tags.map(tag => tag.toLowerCase()) : [];
        const vendor = (product.vendor || '').toLowerCase();
        const productType = (product.product_type || '').toLowerCase();
        
        return title.includes(searchTerm) ||
               tags.some(tag => tag.includes(searchTerm)) ||
               vendor.includes(searchTerm) ||
               productType.includes(searchTerm);
      });

      console.log('Filtered results:', results.length); // Debug log

      // Sort results by relevance (title matches first, then tags)
      results.sort((a, b) => {
        const aTitle = a.title.toLowerCase().includes(query.toLowerCase());
        const bTitle = b.title.toLowerCase().includes(query.toLowerCase());
        if (aTitle && !bTitle) return -1;
        if (!aTitle && bTitle) return 1;
        return 0;
      });

      console.log('Search Results:', results); // Debug log

      // Animate results in
      setTimeout(() => {
        this.displayResults(results, query);
      }, 200);
    } catch (error) {
      console.error('Search error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        query: query,
        name: error.name
      });
      
      // Handle specific error types
      if (error.name === 'AbortError') {
        console.error('Search timed out after 10 seconds');
        this.showError('Search timed out. Please try again.');
      } else if (error.message.includes('HTTP error')) {
        console.error('HTTP error occurred');
        this.showError('Unable to connect to the store. Please check your connection.');
      } else {
        this.showError();
      }
    }
  }

  showPlaceholder() {
    this.searchResults.innerHTML = `
      <div class="search-placeholder">
        <div class="placeholder-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <h3>Discover Amazing Posters</h3>
        <p>Start typing to search through our collection of premium movie posters</p>
        <div class="search-suggestions">
          <span class="suggestion-tag">Marvel</span>
          <span class="suggestion-tag">DC</span>
          <span class="suggestion-tag">Star Wars</span>
          <span class="suggestion-tag">Anime</span>
        </div>
      </div>
    `;
    this.addSuggestionHandlers();
  }

  showLoading() {
    this.searchResults.innerHTML = `
      <div class="search-loading">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
        </div>
        <h3>Searching...</h3>
        <p>Finding the perfect posters for you</p>
      </div>
    `;
  }

  showError(customMessage = null) {
    const message = customMessage || "We couldn't complete your search. Please try again.";
    this.searchResults.innerHTML = `
      <div class="search-error">
        <div class="error-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h3>Oops! Something went wrong</h3>
        <p>${message}</p>
        <button class="retry-button" onclick="location.reload()">Try Again</button>
      </div>
    `;
  }

  displayResults(products, query) {
    if (products.length === 0) {
      this.searchResults.innerHTML = `
        <div class="search-no-results">
          <div class="no-results-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
              <line x1="8" y1="8" x2="16" y2="16"/>
            </svg>
          </div>
          <h3>No results found</h3>
          <p>We couldn't find any posters matching "${query}"</p>
          <p>Try different keywords or browse our collections</p>
        </div>
      `;
      return;
    }

    const resultsHTML = products.map((product, index) => {
      console.log('Product data:', product); // Debug log
      console.log('Product price info:', {
        title: product.title,
        price: product.price,
        variants: product.variants,
        variantPrice: product.variants?.[0]?.price,
        variantComparePrice: product.variants?.[0]?.compare_at_price
      }); // Debug price info
      
      // Get the best available image - handle different Shopify image formats
      let productImage = null;
      if (product.featured_image) {
        productImage = product.featured_image;
      } else if (product.images && product.images.length > 0) {
        productImage = product.images[0];
      } else if (product.image) {
        productImage = product.image;
      }
      
      // Get price information - handle different variant structures
      let variant = null;
      let price = '0.00';
      let comparePrice = null;
      
      if (product.variants && product.variants.length > 0) {
        variant = product.variants[0];
        // Check if price is already in dollars (less than 100) or in cents (100 or more)
        const rawPrice = variant.price;
        if (rawPrice && rawPrice < 100) {
          // Price is already in dollars
          price = rawPrice.toFixed(2);
        } else if (rawPrice) {
          // Price is in cents, convert to dollars
          price = (rawPrice / 100).toFixed(2);
        }
        
        const rawComparePrice = variant.compare_at_price;
        if (rawComparePrice) {
          if (rawComparePrice < 100) {
            comparePrice = rawComparePrice.toFixed(2);
          } else {
            comparePrice = (rawComparePrice / 100).toFixed(2);
          }
        }
      } else if (product.price) {
        const rawPrice = product.price;
        if (rawPrice < 100) {
          price = rawPrice.toFixed(2);
        } else {
          price = (rawPrice / 100).toFixed(2);
        }
        
        const rawComparePrice = product.compare_at_price;
        if (rawComparePrice) {
          if (rawComparePrice < 100) {
            comparePrice = rawComparePrice.toFixed(2);
          } else {
            comparePrice = (rawComparePrice / 100).toFixed(2);
          }
        }
      }
      
      // Build proper product URL
      let productUrl = '/products/';
      if (product.handle) {
        productUrl += product.handle;
      } else if (product.id) {
        productUrl += product.id;
      } else {
        productUrl += 'product'; // Fallback
      }
      
      // Format image URL with proper size
      let imageUrl = null;
      if (productImage) {
        // Handle different image URL formats
        if (typeof productImage === 'string') {
          imageUrl = productImage;
        } else if (productImage.src) {
          imageUrl = productImage.src;
        } else if (productImage.url) {
          imageUrl = productImage.url;
        }
        
        // Add Shopify image transformation if it's a Shopify image
        if (imageUrl && imageUrl.includes('cdn.shopify.com')) {
          imageUrl = `${imageUrl}?width=300&height=450&crop=center`;
        }
      }

      return `
        <div class="modern-search-result-item" style="animation-delay: ${index * 0.1}s">
          <a href="${productUrl}" class="modern-search-result-link">
            <div class="result-image-container">
              ${imageUrl ? 
                `<img src="${imageUrl}" alt="${product.title || 'Product'}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` :
                ''
              }
              <div class="result-placeholder" style="display: ${imageUrl ? 'none' : 'flex'}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21,15 16,10 5,21"/>
                </svg>
              </div>
              <div class="result-overlay">
                <div class="result-badge">View Product</div>
              </div>
              ${comparePrice && parseFloat(comparePrice) > parseFloat(price) ? 
                `<div class="sale-badge">Sale</div>` : ''
              }
            </div>
            <div class="result-info">
              <h3 class="result-title">${product.title || 'Untitled Product'}</h3>
              <div class="result-price">
                ${comparePrice && parseFloat(comparePrice) > parseFloat(price) ? 
                  `<span class="price-compare">$${comparePrice}</span>` : ''
                }
                <span class="price">$${price}</span>
              </div>
              ${product.vendor ? 
                `<div class="result-vendor">${product.vendor}</div>` : ''
              }
            </div>
          </a>
        </div>
      `;
    }).join('');

    this.searchResults.innerHTML = `
      <div class="results-header">
        <h3>Found ${products.length} product${products.length !== 1 ? 's' : ''} for "${query}"</h3>
      </div>
      <div class="results-grid">
        ${resultsHTML}
      </div>
    `;
  }

  submitSearch(query) {
    if (query.trim()) {
      // Redirect to search results page or collection
      window.location.href = `/collections/all?q=${encodeURIComponent(query)}`;
    }
  }
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ModernSearchController();
});
