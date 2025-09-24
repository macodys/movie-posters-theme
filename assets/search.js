class SearchController {
  constructor() {
    this.searchButton = document.getElementById('searchButton');
    this.searchOverlay = null;
    this.searchInput = null;
    this.isSearchOpen = false;
    
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
    
    // Focus the input after a short delay
    setTimeout(() => {
      if (this.searchInput) {
        this.searchInput.focus();
      }
    }, 50);
  }

  closeSearch() {
    this.isSearchOpen = false;
    if (this.searchOverlay) {
      this.searchOverlay.remove();
      this.searchOverlay = null;
    }
  }

  createSearchOverlay() {
    // Create overlay
    this.searchOverlay = document.createElement('div');
    this.searchOverlay.className = 'search-overlay';
    this.searchOverlay.innerHTML = `
      <div class="search-modal">
        <div class="search-header">
          <div class="search-input-wrapper">
            <div class="search-input-container">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input type="text" placeholder="Search posters..." class="search-input" id="searchInput">
            </div>
            <button class="search-close" id="searchClose">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <div class="search-results" id="searchResults">
          <div class="search-placeholder">
            <p>Start typing to search for posters...</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.searchOverlay);
    
    // Get elements
    this.searchInput = document.getElementById('searchInput');
    const searchClose = document.getElementById('searchClose');
    const searchResults = document.getElementById('searchResults');

    // Force text visibility with inline styles
    if (this.searchInput) {
      this.searchInput.style.color = '#ffffff';
      this.searchInput.style.opacity = '1';
      this.searchInput.style.visibility = 'visible';
      this.searchInput.style.display = 'block';
      this.searchInput.style.background = 'none';
      this.searchInput.style.border = 'none';
      this.searchInput.style.outline = 'none';
    }

    // Add event listeners
    searchClose.addEventListener('click', () => this.closeSearch());
    this.searchOverlay.addEventListener('click', (e) => {
      if (e.target === this.searchOverlay) {
        this.closeSearch();
      }
    });

    // Search functionality
    this.searchInput.addEventListener('input', (e) => {
      // Ensure text stays visible
      e.target.style.color = '#ffffff';
      e.target.style.opacity = '1';
      this.performSearch(e.target.value);
    });

    // Handle search submission
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.submitSearch(e.target.value);
      }
    });

    // Additional event to ensure text visibility
    this.searchInput.addEventListener('keyup', (e) => {
      e.target.style.color = '#ffffff';
      e.target.style.opacity = '1';
    });
  }

  async performSearch(query) {
    if (query.length < 2) {
      this.showPlaceholder();
      return;
    }

    try {
      // Show loading state
      this.showLoading();

      // Search products
      const response = await fetch('/collections/all/products.json');
      const data = await response.json();
      
      const results = data.products.filter(product => 
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );

      this.displayResults(results, query);
    } catch (error) {
      console.error('Search error:', error);
      this.showError();
    }
  }

  showPlaceholder() {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = `
      <div class="search-placeholder">
        <p>Start typing to search for posters...</p>
      </div>
    `;
  }

  showLoading() {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = `
      <div class="search-loading">
        <div class="loading-spinner"></div>
        <p>Searching...</p>
      </div>
    `;
  }

  showError() {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = `
      <div class="search-error">
        <p>Sorry, there was an error searching. Please try again.</p>
      </div>
    `;
  }

  displayResults(products, query) {
    const searchResults = document.getElementById('searchResults');
    
    if (products.length === 0) {
      searchResults.innerHTML = `
        <div class="search-no-results">
          <p>No results found for "${query}"</p>
          <p>Try different keywords or browse our collections</p>
        </div>
      `;
      return;
    }

    const resultsHTML = products.map(product => `
      <div class="search-result-item">
        <a href="${product.url}" class="search-result-link">
          <div class="search-result-image">
            ${product.featured_image ? 
              `<img src="${product.featured_image}" alt="${product.title}" loading="lazy">` :
              `<div class="search-result-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21,15 16,10 5,21"/>
                </svg>
              </div>`
            }
          </div>
          <div class="search-result-info">
            <h3 class="search-result-title">${product.title}</h3>
            <div class="search-result-price">
              ${product.variants[0] ? 
                `<span class="price">$${(product.variants[0].price / 100).toFixed(2)}</span>` :
                '<span class="price">Price unavailable</span>'
              }
            </div>
          </div>
        </a>
      </div>
    `).join('');

    searchResults.innerHTML = `
      <div class="search-results-header">
        <h3>Search Results for "${query}" (${products.length})</h3>
      </div>
      <div class="search-results-list">
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
  new SearchController();
});
