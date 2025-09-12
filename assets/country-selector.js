class CountrySelector {
  constructor() {
    this.countryButton = document.getElementById('countryButton');
    this.countryDropdown = document.getElementById('countryDropdown');
    this.countrySearch = document.getElementById('countrySearch');
    this.countryList = document.getElementById('countryList');
    this.selectedCountry = document.getElementById('selectedCountry');
    this.selectedCurrency = document.getElementById('selectedCurrency');
    this.countrySelector = document.querySelector('.country-selector');
    
    // Countries with Shopify market mapping
    this.countries = [
      { code: 'US', name: 'United States', flag: '🇺🇸', market: 'us', currency: 'USD' },
      { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', market: 'gb', currency: 'GBP' },
      { code: 'CA', name: 'Canada', flag: '🇨🇦', market: 'ca', currency: 'CAD' },
      { code: 'AU', name: 'Australia', flag: '🇦🇺', market: 'au', currency: 'AUD' },
      { code: 'DE', name: 'Germany', flag: '🇩🇪', market: 'de', currency: 'EUR' },
      { code: 'FR', name: 'France', flag: '🇫🇷', market: 'fr', currency: 'EUR' },
      { code: 'IT', name: 'Italy', flag: '🇮🇹', market: 'it', currency: 'EUR' },
      { code: 'ES', name: 'Spain', flag: '🇪🇸', market: 'es', currency: 'EUR' },
      { code: 'JP', name: 'Japan', flag: '🇯🇵', market: 'jp', currency: 'JPY' },
      { code: 'BR', name: 'Brazil', flag: '🇧🇷', market: 'br', currency: 'BRL' },
      { code: 'MX', name: 'Mexico', flag: '🇲🇽', market: 'mx', currency: 'MXN' },
      { code: 'IN', name: 'India', flag: '🇮🇳', market: 'in', currency: 'INR' },
      { code: 'NL', name: 'Netherlands', flag: '🇳🇱', market: 'nl', currency: 'EUR' },
      { code: 'SE', name: 'Sweden', flag: '🇸🇪', market: 'se', currency: 'SEK' },
      { code: 'NO', name: 'Norway', flag: '🇳🇴', market: 'no', currency: 'NOK' },
      { code: 'DK', name: 'Denmark', flag: '🇩🇰', market: 'dk', currency: 'DKK' },
      { code: 'FI', name: 'Finland', flag: '🇫🇮', market: 'fi', currency: 'EUR' },
      { code: 'CH', name: 'Switzerland', flag: '🇨🇭', market: 'ch', currency: 'CHF' },
      { code: 'AT', name: 'Austria', flag: '🇦🇹', market: 'at', currency: 'EUR' },
      { code: 'BE', name: 'Belgium', flag: '🇧🇪', market: 'be', currency: 'EUR' },
      { code: 'PL', name: 'Poland', flag: '🇵🇱', market: 'pl', currency: 'PLN' },
      { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', market: 'cz', currency: 'CZK' },
      { code: 'HU', name: 'Hungary', flag: '🇭🇺', market: 'hu', currency: 'HUF' },
      { code: 'PT', name: 'Portugal', flag: '🇵🇹', market: 'pt', currency: 'EUR' },
      { code: 'GR', name: 'Greece', flag: '🇬🇷', market: 'gr', currency: 'EUR' },
      { code: 'RU', name: 'Russia', flag: '🇷🇺', market: 'ru', currency: 'RUB' },
      { code: 'CN', name: 'China', flag: '🇨🇳', market: 'cn', currency: 'CNY' },
      { code: 'KR', name: 'South Korea', flag: '🇰🇷', market: 'kr', currency: 'KRW' },
      { code: 'TH', name: 'Thailand', flag: '🇹🇭', market: 'th', currency: 'THB' },
      { code: 'SG', name: 'Singapore', flag: '🇸🇬', market: 'sg', currency: 'SGD' },
      { code: 'MY', name: 'Malaysia', flag: '🇲🇾', market: 'my', currency: 'MYR' },
      { code: 'ID', name: 'Indonesia', flag: '🇮🇩', market: 'id', currency: 'IDR' },
      { code: 'PH', name: 'Philippines', flag: '🇵🇭', market: 'ph', currency: 'PHP' },
      { code: 'VN', name: 'Vietnam', flag: '🇻🇳', market: 'vn', currency: 'VND' },
      { code: 'ZA', name: 'South Africa', flag: '🇿🇦', market: 'za', currency: 'ZAR' },
      { code: 'EG', name: 'Egypt', flag: '🇪🇬', market: 'eg', currency: 'EGP' },
      { code: 'NG', name: 'Nigeria', flag: '🇳🇬', market: 'ng', currency: 'NGN' },
      { code: 'KE', name: 'Kenya', flag: '🇰🇪', market: 'ke', currency: 'KES' },
      { code: 'AR', name: 'Argentina', flag: '🇦🇷', market: 'ar', currency: 'ARS' },
      { code: 'CL', name: 'Chile', flag: '🇨🇱', market: 'cl', currency: 'CLP' },
      { code: 'CO', name: 'Colombia', flag: '🇨🇴', market: 'co', currency: 'COP' },
      { code: 'PE', name: 'Peru', flag: '🇵🇪', market: 'pe', currency: 'PEN' },
      { code: 'VE', name: 'Venezuela', flag: '🇻🇪', market: 've', currency: 'VES' },
      { code: 'UY', name: 'Uruguay', flag: '🇺🇾', market: 'uy', currency: 'UYU' },
      { code: 'PY', name: 'Paraguay', flag: '🇵🇾', market: 'py', currency: 'PYG' },
      { code: 'BO', name: 'Bolivia', flag: '🇧🇴', market: 'bo', currency: 'BOB' },
      { code: 'EC', name: 'Ecuador', flag: '🇪🇨', market: 'ec', currency: 'USD' },
      { code: 'GT', name: 'Guatemala', flag: '🇬🇹', market: 'gt', currency: 'GTQ' },
      { code: 'CU', name: 'Cuba', flag: '🇨🇺', market: 'cu', currency: 'CUP' },
      { code: 'DO', name: 'Dominican Republic', flag: '🇩🇴', market: 'do', currency: 'DOP' },
      { code: 'HT', name: 'Haiti', flag: '🇭🇹', market: 'ht', currency: 'HTG' },
      { code: 'JM', name: 'Jamaica', flag: '🇯🇲', market: 'jm', currency: 'JMD' },
      { code: 'TT', name: 'Trinidad and Tobago', flag: '🇹🇹', market: 'tt', currency: 'TTD' },
      { code: 'BB', name: 'Barbados', flag: '🇧🇧', market: 'bb', currency: 'BBD' },
      { code: 'BS', name: 'Bahamas', flag: '🇧🇸', market: 'bs', currency: 'BSD' },
      { code: 'BZ', name: 'Belize', flag: '🇧🇿', market: 'bz', currency: 'BZD' },
      { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', market: 'cr', currency: 'CRC' },
      { code: 'PA', name: 'Panama', flag: '🇵🇦', market: 'pa', currency: 'PAB' },
      { code: 'HN', name: 'Honduras', flag: '🇭🇳', market: 'hn', currency: 'HNL' },
      { code: 'NI', name: 'Nicaragua', flag: '🇳🇮', market: 'ni', currency: 'NIO' },
      { code: 'SV', name: 'El Salvador', flag: '🇸🇻', market: 'sv', currency: 'USD' }
    ];
    
    this.currentCountry = this.getStoredCountry() || 'US';
    this.filteredCountries = [...this.countries];
    this.isDetecting = false;
    
    this.init();
  }
  
  init() {
    this.renderCountries();
    this.updateSelectedCountry();
    this.bindEvents();
    this.detectCountryFromIP();
  }
  
  async detectCountryFromIP() {
    // Skip if user has already manually selected a country
    if (this.getStoredCountry()) {
      return;
    }
    
    this.isDetecting = true;
    this.updateButtonState('Detecting...');
    
    try {
      // Try multiple IP geolocation services for better reliability
      const countryCode = await this.getCountryFromIP();
      
      if (countryCode && this.countries.find(c => c.code === countryCode)) {
        this.currentCountry = countryCode;
        this.updateSelectedCountry();
        this.storeCountry(countryCode);
        
        // Redirect to appropriate market if different from current
        this.redirectToMarket(countryCode);
      } else {
        // Fallback to US if detection fails
        this.currentCountry = 'US';
        this.updateSelectedCountry();
      }
    } catch (error) {
      console.warn('Country detection failed:', error);
      this.currentCountry = 'US';
      this.updateSelectedCountry();
    } finally {
      this.isDetecting = false;
      this.updateButtonState();
    }
  }
  
  async getCountryFromIP() {
    const services = [
      'https://ipapi.co/json/',
      'https://ip-api.com/json/',
      'https://api.country.is/'
    ];
    
    for (const service of services) {
      try {
        const response = await fetch(service, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          timeout: 5000
        });
        
        if (!response.ok) continue;
        
        const data = await response.json();
        
        // Handle different response formats
        if (data.country_code) {
          return data.country_code.toUpperCase();
        } else if (data.countryCode) {
          return data.countryCode.toUpperCase();
        } else if (data.country) {
          return data.country.toUpperCase();
        }
      } catch (error) {
        console.warn(`IP service ${service} failed:`, error);
        continue;
      }
    }
    
    throw new Error('All IP detection services failed');
  }
  
  updateButtonState(text = null) {
    if (text) {
      this.selectedCountry.textContent = text;
      this.countryButton.style.opacity = '0.7';
    } else {
      this.updateSelectedCountry();
      this.countryButton.style.opacity = '1';
    }
  }
  
  redirectToMarket(countryCode) {
    const country = this.countries.find(c => c.code === countryCode);
    if (!country || !country.market) return;
    
    const currentMarket = this.getCurrentMarket();
    if (currentMarket === country.market) return;
    
    // Check if we should redirect (only on first visit)
    const hasVisited = this.getStoredCountry();
    if (hasVisited) return;
    
    // Build market URL
    const currentUrl = new URL(window.location);
    const marketUrl = this.buildMarketUrl(country.market, currentUrl);
    
    if (marketUrl !== currentUrl.href) {
      // Show a brief notification before redirect
      this.showMarketNotification(country);
      
      setTimeout(() => {
        window.location.href = marketUrl;
      }, 2000);
    }
  }
  
  getCurrentMarket() {
    // Extract market from current URL or Shopify's market context
    const url = new URL(window.location);
    const pathParts = url.pathname.split('/').filter(part => part);
    
    // Check for market in URL path (e.g., /markets/us/...)
    if (pathParts[0] === 'markets' && pathParts[1]) {
      return pathParts[1];
    }
    
    // Check Shopify's market context if available
    if (window.Shopify && window.Shopify.locale) {
      return window.Shopify.locale.split('-')[1]?.toLowerCase();
    }
    
    return null;
  }
  
  buildMarketUrl(market, currentUrl) {
    // Build URL for the specific market
    const baseUrl = currentUrl.origin;
    const path = currentUrl.pathname;
    const search = currentUrl.search;
    
    // If already in a market URL, replace it
    if (path.includes('/markets/')) {
      const newPath = path.replace(/\/markets\/[^\/]+/, `/markets/${market}`);
      return `${baseUrl}${newPath}${search}`;
    }
    
    // Otherwise, prepend market to path
    return `${baseUrl}/markets/${market}${path}${search}`;
  }
  
  showMarketNotification(country) {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 212, 170, 0.95);
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
      z-index: 10000;
      font-size: 14px;
      font-weight: 500;
      max-width: 300px;
      animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">${country.flag}</span>
        <span>Redirecting to ${country.name} market...</span>
      </div>
    `;
    
    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove notification after 2 seconds
    setTimeout(() => {
      notification.remove();
      style.remove();
    }, 2000);
  }
  
  bindEvents() {
    // Toggle dropdown
    this.countryButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });
    
    // Search functionality
    this.countrySearch.addEventListener('input', (e) => {
      this.filterCountries(e.target.value);
    });
    
    // Country selection
    this.countryList.addEventListener('click', (e) => {
      const countryItem = e.target.closest('.country-item');
      if (countryItem) {
        const countryCode = countryItem.dataset.code;
        this.selectCountry(countryCode);
      }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.countrySelector.contains(e.target)) {
        this.closeDropdown();
      }
    });
    
    // Keyboard navigation
    this.countryButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleDropdown();
      }
    });
    
    this.countrySearch.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeDropdown();
      }
    });
  }
  
  toggleDropdown() {
    this.countrySelector.classList.toggle('active');
    if (this.countrySelector.classList.contains('active')) {
      this.countrySearch.focus();
    }
  }
  
  closeDropdown() {
    this.countrySelector.classList.remove('active');
    this.countrySearch.value = '';
    this.filterCountries('');
  }
  
  filterCountries(searchTerm) {
    const term = searchTerm.toLowerCase();
    this.filteredCountries = this.countries.filter(country => 
      country.name.toLowerCase().includes(term) || 
      country.code.toLowerCase().includes(term)
    );
    this.renderCountries();
  }
  
  renderCountries() {
    this.countryList.innerHTML = this.filteredCountries.map(country => `
      <div class="country-item ${country.code === this.currentCountry ? 'selected' : ''}" data-code="${country.code}">
        <span class="flag">${country.flag}</span>
        <div class="country-details">
          <span class="name">${country.name}</span>
          <span class="currency">${country.currency}</span>
        </div>
      </div>
    `).join('');
  }
  
  selectCountry(countryCode) {
    this.currentCountry = countryCode;
    this.updateSelectedCountry();
    this.storeCountry(countryCode);
    this.closeDropdown();
    
    // Redirect to appropriate market
    this.redirectToMarket(countryCode);
    
    // Trigger custom event for other parts of the app
    const country = this.countries.find(c => c.code === countryCode);
    document.dispatchEvent(new CustomEvent('countryChanged', {
      detail: { countryCode, country, market: country?.market, currency: country?.currency }
    }));
  }
  
  updateSelectedCountry() {
    const country = this.countries.find(c => c.code === this.currentCountry);
    if (country) {
      this.selectedCountry.textContent = country.code;
      if (this.selectedCurrency) {
        this.selectedCurrency.textContent = country.currency;
      }
    }
  }
  
  getStoredCountry() {
    try {
      return localStorage.getItem('selectedCountry');
    } catch (e) {
      return null;
    }
  }
  
  storeCountry(countryCode) {
    try {
      localStorage.setItem('selectedCountry', countryCode);
    } catch (e) {
      console.warn('Could not store country selection');
    }
  }
  
  getCurrentCountry() {
    return this.countries.find(c => c.code === this.currentCountry);
  }
  
  getCurrentMarket() {
    const country = this.getCurrentCountry();
    return country ? country.market : null;
  }
  
  getCurrentCurrency() {
    const country = this.getCurrentCountry();
    return country ? country.currency : 'USD';
  }
  
  // Method to check if a market is available
  isMarketAvailable(marketCode) {
    return this.countries.some(c => c.market === marketCode);
  }
  
  // Method to get all available markets
  getAvailableMarkets() {
    return this.countries
      .filter(c => c.market)
      .map(c => ({ code: c.market, name: c.name, country: c.code, currency: c.currency }));
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new CountrySelector();
});
