class CountrySelector {
  constructor() {
    this.countryButton = document.getElementById('countryButton');
    this.countryDropdown = document.getElementById('countryDropdown');
    this.countrySearch = document.getElementById('countrySearch');
    this.countryList = document.getElementById('countryList');
    this.selectedCountry = document.getElementById('selectedCountry');
    this.selectedCurrency = document.getElementById('selectedCurrency');
    this.countrySelector = document.querySelector('.country-selector');
    
    // Countries with Shopify market mapping and regions
    this.countries = [
      { code: 'US', name: 'United States', flag: '🇺🇸', market: 'us', currency: 'USD', region: 'north-america' },
      { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', market: 'gb', currency: 'GBP', region: 'europe' },
      { code: 'CA', name: 'Canada', flag: '🇨🇦', market: 'ca', currency: 'CAD', region: 'north-america' },
      { code: 'AU', name: 'Australia', flag: '🇦🇺', market: 'au', currency: 'AUD', region: 'oceania' },
      { code: 'DE', name: 'Germany', flag: '🇩🇪', market: 'de', currency: 'EUR', region: 'europe' },
      { code: 'FR', name: 'France', flag: '🇫🇷', market: 'fr', currency: 'EUR', region: 'europe' },
      { code: 'IT', name: 'Italy', flag: '🇮🇹', market: 'it', currency: 'EUR', region: 'europe' },
      { code: 'ES', name: 'Spain', flag: '🇪🇸', market: 'es', currency: 'EUR', region: 'europe' },
      { code: 'JP', name: 'Japan', flag: '🇯🇵', market: 'jp', currency: 'JPY', region: 'asia' },
      { code: 'BR', name: 'Brazil', flag: '🇧🇷', market: 'br', currency: 'BRL', region: 'south-america' },
      { code: 'MX', name: 'Mexico', flag: '🇲🇽', market: 'mx', currency: 'MXN', region: 'north-america' },
      { code: 'IN', name: 'India', flag: '🇮🇳', market: 'in', currency: 'INR', region: 'asia' },
      { code: 'NL', name: 'Netherlands', flag: '🇳🇱', market: 'nl', currency: 'EUR', region: 'europe' },
      { code: 'SE', name: 'Sweden', flag: '🇸🇪', market: 'se', currency: 'SEK', region: 'europe' },
      { code: 'NO', name: 'Norway', flag: '🇳🇴', market: 'no', currency: 'NOK', region: 'europe' },
      { code: 'DK', name: 'Denmark', flag: '🇩🇰', market: 'dk', currency: 'DKK', region: 'europe' },
      { code: 'FI', name: 'Finland', flag: '🇫🇮', market: 'fi', currency: 'EUR', region: 'europe' },
      { code: 'CH', name: 'Switzerland', flag: '🇨🇭', market: 'ch', currency: 'CHF', region: 'europe' },
      { code: 'AT', name: 'Austria', flag: '🇦🇹', market: 'at', currency: 'EUR', region: 'europe' },
      { code: 'BE', name: 'Belgium', flag: '🇧🇪', market: 'be', currency: 'EUR', region: 'europe' },
      { code: 'PL', name: 'Poland', flag: '🇵🇱', market: 'pl', currency: 'PLN', region: 'europe' },
      { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', market: 'cz', currency: 'CZK', region: 'europe' },
      { code: 'HU', name: 'Hungary', flag: '🇭🇺', market: 'hu', currency: 'HUF', region: 'europe' },
      { code: 'PT', name: 'Portugal', flag: '🇵🇹', market: 'pt', currency: 'EUR', region: 'europe' },
      { code: 'GR', name: 'Greece', flag: '🇬🇷', market: 'gr', currency: 'EUR', region: 'europe' },
      { code: 'RU', name: 'Russia', flag: '🇷🇺', market: 'ru', currency: 'RUB', region: 'europe' },
      { code: 'CN', name: 'China', flag: '🇨🇳', market: 'cn', currency: 'CNY', region: 'asia' },
      { code: 'KR', name: 'South Korea', flag: '🇰🇷', market: 'kr', currency: 'KRW', region: 'asia' },
      { code: 'TH', name: 'Thailand', flag: '🇹🇭', market: 'th', currency: 'THB', region: 'asia' },
      { code: 'SG', name: 'Singapore', flag: '🇸🇬', market: 'sg', currency: 'SGD', region: 'asia' },
      { code: 'MY', name: 'Malaysia', flag: '🇲🇾', market: 'my', currency: 'MYR', region: 'asia' },
      { code: 'ID', name: 'Indonesia', flag: '🇮🇩', market: 'id', currency: 'IDR', region: 'asia' },
      { code: 'PH', name: 'Philippines', flag: '🇵🇭', market: 'ph', currency: 'PHP', region: 'asia' },
      { code: 'VN', name: 'Vietnam', flag: '🇻🇳', market: 'vn', currency: 'VND', region: 'asia' },
      { code: 'ZA', name: 'South Africa', flag: '🇿🇦', market: 'za', currency: 'ZAR', region: 'africa' },
      { code: 'EG', name: 'Egypt', flag: '🇪🇬', market: 'eg', currency: 'EGP', region: 'africa' },
      { code: 'NG', name: 'Nigeria', flag: '🇳🇬', market: 'ng', currency: 'NGN', region: 'africa' },
      { code: 'KE', name: 'Kenya', flag: '🇰🇪', market: 'ke', currency: 'KES', region: 'africa' },
      { code: 'AR', name: 'Argentina', flag: '🇦🇷', market: 'ar', currency: 'ARS', region: 'south-america' },
      { code: 'CL', name: 'Chile', flag: '🇨🇱', market: 'cl', currency: 'CLP', region: 'south-america' },
      { code: 'CO', name: 'Colombia', flag: '🇨🇴', market: 'co', currency: 'COP', region: 'south-america' },
      { code: 'PE', name: 'Peru', flag: '🇵🇪', market: 'pe', currency: 'PEN', region: 'south-america' },
      { code: 'VE', name: 'Venezuela', flag: '🇻🇪', market: 've', currency: 'VES', region: 'south-america' },
      { code: 'UY', name: 'Uruguay', flag: '🇺🇾', market: 'uy', currency: 'UYU', region: 'south-america' },
      { code: 'PY', name: 'Paraguay', flag: '🇵🇾', market: 'py', currency: 'PYG', region: 'south-america' },
      { code: 'BO', name: 'Bolivia', flag: '🇧🇴', market: 'bo', currency: 'BOB', region: 'south-america' },
      { code: 'EC', name: 'Ecuador', flag: '🇪🇨', market: 'ec', currency: 'USD', region: 'south-america' },
      { code: 'GT', name: 'Guatemala', flag: '🇬🇹', market: 'gt', currency: 'GTQ', region: 'central-america' },
      { code: 'CU', name: 'Cuba', flag: '🇨🇺', market: 'cu', currency: 'CUP', region: 'caribbean' },
      { code: 'DO', name: 'Dominican Republic', flag: '🇩🇴', market: 'do', currency: 'DOP', region: 'caribbean' },
      { code: 'HT', name: 'Haiti', flag: '🇭🇹', market: 'ht', currency: 'HTG', region: 'caribbean' },
      { code: 'JM', name: 'Jamaica', flag: '🇯🇲', market: 'jm', currency: 'JMD', region: 'caribbean' },
      { code: 'TT', name: 'Trinidad and Tobago', flag: '🇹🇹', market: 'tt', currency: 'TTD', region: 'caribbean' },
      { code: 'BB', name: 'Barbados', flag: '🇧🇧', market: 'bb', currency: 'BBD', region: 'caribbean' },
      { code: 'BS', name: 'Bahamas', flag: '🇧🇸', market: 'bs', currency: 'BSD', region: 'caribbean' },
      { code: 'BZ', name: 'Belize', flag: '🇧🇿', market: 'bz', currency: 'BZD', region: 'central-america' },
      { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', market: 'cr', currency: 'CRC', region: 'central-america' },
      { code: 'PA', name: 'Panama', flag: '🇵🇦', market: 'pa', currency: 'PAB', region: 'central-america' },
      { code: 'HN', name: 'Honduras', flag: '🇭🇳', market: 'hn', currency: 'HNL', region: 'central-america' },
      { code: 'NI', name: 'Nicaragua', flag: '🇳🇮', market: 'ni', currency: 'NIO', region: 'central-america' },
      { code: 'SV', name: 'El Salvador', flag: '🇸🇻', market: 'sv', currency: 'USD', region: 'central-america' }
    ];
    
    // Market catalog configuration - based on your actual Shopify catalog settings
    this.marketCatalogConfig = {
      'us': { hasProducts: true, productCount: 21 },
      'gb': { hasProducts: true, productCount: 1 },
      'ca': { hasProducts: true, productCount: 0 },
      'au': { hasProducts: true, productCount: 0 },
      'de': { hasProducts: true, productCount: 0 },
      'fr': { hasProducts: true, productCount: 0 },
      'it': { hasProducts: true, productCount: 0 },
      'es': { hasProducts: true, productCount: 0 },
      'jp': { hasProducts: true, productCount: 0 },
      'br': { hasProducts: true, productCount: 0 },
      'mx': { hasProducts: true, productCount: 0 },
      'in': { hasProducts: true, productCount: 0 },
      'nl': { hasProducts: true, productCount: 0 },
      'se': { hasProducts: true, productCount: 0 },
      'no': { hasProducts: true, productCount: 0 },
      'dk': { hasProducts: true, productCount: 0 },
      'fi': { hasProducts: true, productCount: 0 },
      'ch': { hasProducts: true, productCount: 0 },
      'at': { hasProducts: true, productCount: 0 },
      'be': { hasProducts: true, productCount: 0 },
      'pl': { hasProducts: true, productCount: 0 },
      'cz': { hasProducts: true, productCount: 0 },
      'hu': { hasProducts: true, productCount: 0 },
      'pt': { hasProducts: true, productCount: 0 },
      'gr': { hasProducts: true, productCount: 0 },
      'ru': { hasProducts: true, productCount: 0 },
      'cn': { hasProducts: true, productCount: 0 },
      'kr': { hasProducts: true, productCount: 0 },
      'th': { hasProducts: true, productCount: 0 },
      'sg': { hasProducts: true, productCount: 0 },
      'my': { hasProducts: true, productCount: 0 },
      'id': { hasProducts: true, productCount: 0 },
      'ph': { hasProducts: true, productCount: 0 },
      'vn': { hasProducts: true, productCount: 0 },
      'za': { hasProducts: true, productCount: 0 },
      'eg': { hasProducts: true, productCount: 0 },
      'ng': { hasProducts: true, productCount: 0 },
      'ke': { hasProducts: true, productCount: 0 },
      'ar': { hasProducts: true, productCount: 0 },
      'cl': { hasProducts: true, productCount: 0 },
      'co': { hasProducts: true, productCount: 0 },
      'pe': { hasProducts: true, productCount: 0 },
      've': { hasProducts: true, productCount: 0 },
      'uy': { hasProducts: true, productCount: 0 },
      'py': { hasProducts: true, productCount: 0 },
      'bo': { hasProducts: true, productCount: 0 },
      'ec': { hasProducts: true, productCount: 0 },
      'gt': { hasProducts: true, productCount: 0 },
      'cu': { hasProducts: true, productCount: 0 },
      'do': { hasProducts: true, productCount: 0 },
      'ht': { hasProducts: true, productCount: 0 },
      'jm': { hasProducts: true, productCount: 0 },
      'tt': { hasProducts: true, productCount: 0 },
      'bb': { hasProducts: true, productCount: 0 },
      'bs': { hasProducts: true, productCount: 0 },
      'bz': { hasProducts: true, productCount: 0 },
      'cr': { hasProducts: true, productCount: 0 },
      'pa': { hasProducts: true, productCount: 0 },
      'hn': { hasProducts: true, productCount: 0 },
      'ni': { hasProducts: true, productCount: 0 },
      'sv': { hasProducts: true, productCount: 0 }
    };
    
    this.currentCountry = this.getStoredCountry() || 'US';
    this.filteredCountries = [...this.countries];
    this.isDetecting = false;
    
    this.init();
  }
  
  async fetchMarketAwareProducts() {
    try {
      const currentUrl = new URL(window.location.href);
      // Strip /markets/<code> prefix because Shopify view routing does not support it
      const path = currentUrl.pathname.replace(/^\/markets\/[^/]+/, '');
      const collectionMatch = path.match(/^\/collections\/([^\/]+)/);
      
      const candidates = [];
      
      // 1) Collection-specific view (rooted, without /markets prefix)
      if (collectionMatch) {
        candidates.push(`/collections/${collectionMatch[1]}?view=market-products-json`);
      }
      
      // 2) Section endpoint on collection (works even if no view is installed)
      if (collectionMatch) {
        candidates.push(`/collections/${collectionMatch[1]}?section_id=market-products-json`);
      }
      
      // 3) All collection via section endpoint
      candidates.push(`/collections/all?section_id=market-products-json`);
      
      // 4) Index via section endpoint
      candidates.push(`/?section_id=market-products-json`);
      
      for (const endpoint of candidates) {
        try {
          const res = await fetch(endpoint, { 
            headers: { 'Accept': 'application/json' },
            credentials: 'same-origin'
          });
          if (!res.ok) continue;
          const text = await res.text();
          const data = JSON.parse(text);
          if (data && Array.isArray(data.products)) {
            console.log(`Market JSON success from ${endpoint} with ${data.products.length} products`);
            return data;
          }
        } catch (e) {
          continue;
        }
      }
      return null;
    } catch (e) {
      console.warn('fetchMarketAwareProducts failed:', e);
      return null;
    }
  }

  init() {
    this.renderCountries();
    this.updateSelectedCountry();
    this.bindEvents();
    this.detectCountryFromIP();
    
    // Apply region filtering on page load
    this.applyStoredRegionFilter();
  }
  
  applyStoredRegionFilter() {
    const storedMarket = localStorage.getItem('selectedMarket') || localStorage.getItem('selectedRegion');
    const storedCountry = this.getStoredCountry();
    
    // Apply stored country pricing
    if (storedCountry) {
      this.updatePricingForCountry(storedCountry);
    }
    
    // Load product markets from your existing catalog (this will handle filtering)
    this.loadProductRegionsFromCatalog();
  }
  
  async loadProductRegionsFromCatalog() {
    try {
      // Get current market from URL or stored preference
      const currentMarket = this.getCurrentMarket();
      console.log('Current market:', currentMarket);
      
      if (!currentMarket) return;
      
      // Do not rely on hardcoded market configuration; use server-rendered data exclusively
      
      // First, try server-rendered market-aware JSON views (respects Markets/Catalogs)
      console.log(`Trying server-rendered market JSON for market: ${currentMarket}`);
      const marketJsonData = await this.fetchMarketAwareProducts();
      if (marketJsonData && Array.isArray(marketJsonData.products)) {
        const visibleProductHandles = new Set(marketJsonData.products.map(p => p.handle));
        if (visibleProductHandles.size > 0) {
          console.log(`Server-rendered market JSON returned ${visibleProductHandles.size} products`);
          this.applyProductFiltering(visibleProductHandles, currentMarket);
          return;
        } else if (marketConfig && marketConfig.productCount === 0) {
          console.log('Server-rendered JSON returned 0 products; hiding all');
          this.hideAllProducts();
          return;
        }
      }

      // If market JSON is unavailable, fail closed to avoid showing wrong-market products
      console.warn('Market JSON unavailable; hiding products to avoid wrong-market display');
      this.hideAllProducts();
      
    } catch (error) {
      console.warn('Could not load product regions from catalog:', error);
      // On error, hide all products to be safe
      this.hideAllProducts();
    }
  }
  
  useConfigurationBasedFiltering(currentMarket, catalogData, marketConfig) {
    console.log(`Using configuration-based filtering for market: ${currentMarket}`);
    
    let visibleProductHandles;
    
    if (currentMarket.toLowerCase() === 'gb') {
      // For UK market, we know it should have 1 product
      // We'll need to identify which product is assigned to UK
      // For now, let's show all products but limit to the configured count
      console.log(`UK market: showing first ${marketConfig.productCount} products`);
      visibleProductHandles = new Set(catalogData.products.slice(0, marketConfig.productCount).map(product => product.handle));
    } else if (currentMarket.toLowerCase() === 'us') {
      // For US market, show all products (or limit to configured count)
      console.log(`US market: showing all ${catalogData.products.length} products`);
      visibleProductHandles = new Set(catalogData.products.map(product => product.handle));
    } else {
      // For other markets, use the configured count
      const maxProducts = marketConfig?.productCount || 0;
      if (maxProducts > 0) {
        console.log(`Market ${currentMarket}: showing first ${maxProducts} products`);
        visibleProductHandles = new Set(catalogData.products.slice(0, maxProducts).map(product => product.handle));
      } else {
        console.log(`Market ${currentMarket}: no products configured`);
        this.hideAllProducts();
        return;
      }
    }
    
    // Apply the filtering
    this.applyProductFiltering(visibleProductHandles, currentMarket);
  }
  
  applyProductFiltering(visibleProductHandles, currentMarket) {
    // Find all possible product card selectors
    const productCardSelectors = [
      '.product-card',
      '.poster-card', 
      '[data-product-region]',
      '.product-item',
      '.collection-item',
      '.grid-item',
      'article',
      '.card'
    ];
    
    let allProductCards = [];
    productCardSelectors.forEach(selector => {
      const cards = document.querySelectorAll(selector);
      allProductCards = allProductCards.concat(Array.from(cards));
    });
    
    // Remove duplicates
    allProductCards = [...new Set(allProductCards)];
    
    console.log(`Found ${allProductCards.length} total product cards on page`);
    
    let visibleCount = 0;
    let hiddenCount = 0;
    
    allProductCards.forEach(card => {
      const productHandle = this.getProductHandleFromCard(card);
      const isVisible = productHandle ? visibleProductHandles.has(productHandle) : false;
      
      card.dataset.productRegion = currentMarket; // Set market for filtering
      
      if (isVisible) {
        card.style.display = 'block';
        card.classList.remove('region-hidden');
        visibleCount++;
      } else {
        card.style.display = 'none';
        card.classList.add('region-hidden');
        hiddenCount++;
      }
    });
    
    console.log(`Market ${currentMarket}: ${visibleCount} visible, ${hiddenCount} hidden products`);
  }

  hideAllProducts() {
    console.log('Hiding all products - no products found for this market');
    
    const productCardSelectors = [
      '.product-card',
      '.poster-card', 
      '[data-product-region]',
      '.product-item',
      '.collection-item',
      '.grid-item',
      'article',
      '.card'
    ];
    
    let allProductCards = [];
    productCardSelectors.forEach(selector => {
      const cards = document.querySelectorAll(selector);
      allProductCards = allProductCards.concat(Array.from(cards));
    });
    
    allProductCards = [...new Set(allProductCards)];
    
    allProductCards.forEach(card => {
      card.style.display = 'none';
      card.classList.add('region-hidden');
    });
    
    console.log(`Hidden ${allProductCards.length} product cards`);
  }
  
  getProductHandleFromCard(card) {
    // Try to get product handle from various attributes
    const href = card.querySelector('a')?.href;
    if (href) {
      const match = href.match(/\/products\/([^\/\?]+)/);
      if (match) return match[1];
    }
    
    // Try data attributes
    if (card.dataset.productHandle) return card.dataset.productHandle;
    if (card.dataset.handle) return card.dataset.handle;
    
    // Try to find product handle in nested elements
    const productLink = card.querySelector('a[href*="/products/"]');
    if (productLink) {
      const match = productLink.href.match(/\/products\/([^\/\?]+)/);
      if (match) return match[1];
    }
    
    // Try to get from any link in the card
    const allLinks = card.querySelectorAll('a');
    for (const link of allLinks) {
      const match = link.href.match(/\/products\/([^\/\?]+)/);
      if (match) return match[1];
    }
    
    return null;
  }

  getProductRegionFromCatalog(product) {
    // Check for region in product tags
    if (product.tags) {
      const regionTags = product.tags.filter(tag => 
        ['north-america', 'europe', 'asia', 'south-america', 'africa', 'oceania', 'global', 'all'].includes(tag.toLowerCase())
      );
      if (regionTags.length > 0) {
        return regionTags[0].toLowerCase();
      }
    }
    
    // Check for region in product metafields
    if (product.metafields) {
      const regionMetafield = product.metafields.find(field => 
        field.namespace === 'custom' && field.key === 'region'
      );
      if (regionMetafield) {
        return regionMetafield.value.toLowerCase();
      }
    }
    
    // Check for region in product type
    if (product.product_type) {
      const regionTypes = ['north-america', 'europe', 'asia', 'south-america', 'africa', 'oceania'];
      const matchingType = regionTypes.find(type => 
        product.product_type.toLowerCase().includes(type)
      );
      if (matchingType) {
        return matchingType;
      }
    }
    
    return null;
  }
  
  updateProductCardRegion(productHandle, region) {
    // Find product cards by handle and update their region data
    const productCards = document.querySelectorAll(`[data-product-handle="${productHandle}"]`);
    productCards.forEach(card => {
      card.dataset.productRegion = region;
    });
    
    // Also check for cards with product URLs containing the handle
    const allCards = document.querySelectorAll('.product-card, .poster-card');
    allCards.forEach(card => {
      const link = card.querySelector('a[href*="/products/"]');
      if (link && link.href.includes(productHandle)) {
        card.dataset.productRegion = region;
      }
    });
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
          credentials: 'same-origin',
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
    
    const currentMarket = this.getMarketFromUrlPath() || this.getCurrentMarket();
    if (currentMarket === country.market) return;
    
    // Check if we should redirect (only on first visit)
    const hasVisited = this.getStoredCountry();
    if (hasVisited) return;
    
    // Build market URL
    const currentUrl = new URL(window.location);
    const marketUrl = this.buildMarketUrl(country.market, currentUrl);
    
    if (marketUrl !== currentUrl.href) {
      // Redirect immediately to avoid mixing products from the previous market
      window.location.replace(marketUrl);
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

  // Extract market code from /markets/<code>/... path if present
  getMarketFromUrlPath() {
    try {
      const path = window.location.pathname;
      const m = path.match(/\/markets\/([^\/]+)/);
      return m ? m[1].toLowerCase() : null;
    } catch { return null; }
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
    
    // Filter products by region
    this.filterProductsByRegion(countryCode);
    
    // Update pricing and currency
    this.updatePricingForCountry(countryCode);
    
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
  
  updatePricingForCountry(countryCode) {
    const country = this.countries.find(c => c.code === countryCode);
    if (!country) return;
    
    console.log('Updating pricing for country:', countryCode, 'Currency:', country.currency);
    
    // Update currency symbols and formatting
    this.updateCurrencyDisplay(country.currency);
    
    // Update product prices if they exist
    this.updateProductPrices(country.currency);
    
    // Update cart pricing
    this.updateCartPricing(country.currency);
  }
  
  updateCurrencyDisplay(currency) {
    // Update currency display in header
    if (this.selectedCurrency) {
      this.selectedCurrency.textContent = currency;
    }
    
    // Update currency symbols throughout the page
    const currencyElements = document.querySelectorAll('.currency-symbol, .price-currency');
    currencyElements.forEach(element => {
      element.textContent = this.getCurrencySymbol(currency);
    });
  }
  
  getCurrencySymbol(currency) {
    const symbols = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'CAD': 'C$',
      'AUD': 'A$',
      'JPY': '¥',
      'BRL': 'R$',
      'MXN': '$',
      'INR': '₹',
      'SEK': 'kr',
      'NOK': 'kr',
      'DKK': 'kr',
      'CHF': 'CHF',
      'PLN': 'zł',
      'CZK': 'Kč',
      'HUF': 'Ft',
      'RUB': '₽',
      'CNY': '¥',
      'KRW': '₩',
      'THB': '฿',
      'SGD': 'S$',
      'MYR': 'RM',
      'IDR': 'Rp',
      'PHP': '₱',
      'VND': '₫',
      'ZAR': 'R',
      'EGP': 'E£',
      'NGN': '₦',
      'KES': 'KSh',
      'ARS': '$',
      'CLP': '$',
      'COP': '$',
      'PEN': 'S/',
      'VES': 'Bs',
      'UYU': '$U',
      'PYG': '₲',
      'BOB': 'Bs',
      'GTQ': 'Q',
      'CUP': '$',
      'DOP': 'RD$',
      'HTG': 'G',
      'JMD': 'J$',
      'TTD': 'TT$',
      'BBD': 'Bds$',
      'BSD': 'B$',
      'BZD': 'BZ$',
      'CRC': '₡',
      'PAB': 'B/.',
      'HNL': 'L',
      'NIO': 'C$',
      'USD': '$'
    };
    
    return symbols[currency] || currency;
  }
  
  updateProductPrices(currency) {
    // This would typically fetch updated prices from your backend
    // For now, we'll just update the currency display
    const priceElements = document.querySelectorAll('.price, .product-price, .money');
    priceElements.forEach(element => {
      // Add currency symbol if not present
      if (!element.textContent.includes(this.getCurrencySymbol(currency))) {
        const price = element.textContent.replace(/[^\d.,]/g, '');
        element.textContent = this.getCurrencySymbol(currency) + price;
      }
    });
  }
  
  updateCartPricing(currency) {
    // Update cart total display
    const cartTotal = document.getElementById('cart-total');
    if (cartTotal) {
      const total = cartTotal.textContent.replace(/[^\d.,]/g, '');
      cartTotal.textContent = this.getCurrencySymbol(currency) + total;
    }
  }
  
  // Filter products by market
  filterProductsByRegion(countryCode) {
    const country = this.countries.find(c => c.code === countryCode);
    if (!country) return;
    
    // Use the market directly from the country data
    const market = country.market || countryCode;
    console.log(`Filtering products for country: ${countryCode}, market: ${market}`);
    
    // Store the selected market
    localStorage.setItem('selectedMarket', market);
    localStorage.setItem('selectedRegion', market); // Keep for compatibility
    
    // Add market filter to all product requests
    this.addRegionFilter(market);
    
    // Update collection URLs with market parameter
    this.updateCollectionUrls(market);
    
    // Load and filter products from the specific market's catalog
    this.loadProductRegionsFromCatalog();
    
    // Show market notification
    this.showRegionNotification(country);
  }
  
  // This method is no longer needed since we use markets directly
  // getRegionForCountry() removed - using markets from country data instead
  
  addRegionFilter(market) {
    // Store current market for future requests
    localStorage.setItem('selectedMarket', market);
    localStorage.setItem('selectedRegion', market); // Keep for compatibility
    
    // Update all forms to include market parameter
    const forms = document.querySelectorAll('form[action*="/collections/"]');
    forms.forEach(form => {
      this.addHiddenInput(form, 'market', market);
      this.addHiddenInput(form, 'region', market); // Keep for compatibility
    });
  }
  
  updateCollectionUrls(market) {
    // Update navigation links to include market parameter
    const navLinks = document.querySelectorAll('.nav-button[href*="/collections/"]');
    navLinks.forEach(link => {
      const url = new URL(link.href);
      url.searchParams.set('market', market);
      url.searchParams.set('region', market); // Keep for compatibility
      link.href = url.toString();
    });
    
    // Update collection links in product cards
    const productLinks = document.querySelectorAll('a[href*="/collections/"]');
    productLinks.forEach(link => {
      const url = new URL(link.href);
      url.searchParams.set('market', market);
      url.searchParams.set('region', market); // Keep for compatibility
      link.href = url.toString();
    });
  }
  
  filterExistingProducts(market) {
    console.log('Filtering products for market:', market);
    
    // Filter product cards based on market
    const productCards = document.querySelectorAll('.product-card, .poster-card, [data-product-region]');
    console.log('Found product cards:', productCards.length);
    
    let visibleCount = 0;
    let hiddenCount = 0;
    
    productCards.forEach(card => {
      const productMarket = card.dataset.productRegion; // Using same attribute for market
      const isVisible = this.isProductVisibleInRegion(productMarket, market);
      
      console.log(`Product market: "${productMarket}", Selected market: "${market}", Visible: ${isVisible}`);
      
      if (isVisible) {
        card.style.display = 'block';
        card.classList.remove('region-hidden');
        visibleCount++;
      } else {
        card.style.display = 'none';
        card.classList.add('region-hidden');
        hiddenCount++;
      }
    });
    
    console.log(`Filtered: ${visibleCount} visible, ${hiddenCount} hidden`);
    
    // Update collection counts
    this.updateCollectionCounts();
  }
  
  isProductVisibleInRegion(productMarket, selectedMarket) {
    // If no product market is set, show globally
    if (!productMarket || productMarket === '') return true;
    
    // If product is marked as global, show everywhere
    if (productMarket === 'global' || productMarket === 'all') return true;
    
    // Check if product market matches selected market exactly
    if (productMarket === selectedMarket) return true;
    
    // Check if product market is a comma-separated list of markets
    if (productMarket.includes(',')) {
      const markets = productMarket.split(',').map(m => m.trim().toLowerCase());
      return markets.includes(selectedMarket.toLowerCase());
    }
    
    // Check if product market contains the selected market (for partial matches)
    if (productMarket.toLowerCase().includes(selectedMarket.toLowerCase())) return true;
    
    // If product has a specific market and it doesn't match, hide it
    return false;
  }
  
  updateCollectionCounts() {
    const visibleProducts = document.querySelectorAll('.product-card:not(.region-hidden), .poster-card:not(.region-hidden)');
    const countElements = document.querySelectorAll('.collection-count, .product-count');
    
    countElements.forEach(element => {
      element.textContent = visibleProducts.length;
    });
  }
  
  addHiddenInput(form, name, value) {
    // Check if input already exists
    let existingInput = form.querySelector(`input[name="${name}"]`);
    if (existingInput) {
      existingInput.value = value;
    } else {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    }
  }
  
  showRegionNotification(country) {
    // Create region filter notification
    const notification = document.createElement('div');
    notification.className = 'region-notification';
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: rgba(0, 212, 170, 0.95);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
      z-index: 10000;
      font-size: 13px;
      font-weight: 500;
      max-width: 280px;
      animation: slideInRight 0.3s ease-out;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 16px;">${country.flag}</span>
        <span>Showing products for ${country.name}</span>
      </div>
    `;
    
    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.remove();
      style.remove();
    }, 3000);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new CountrySelector();
});
