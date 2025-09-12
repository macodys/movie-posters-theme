class CountrySelector {
  constructor() {
    this.countryButton = document.getElementById('countryButton');
    this.countryDropdown = document.getElementById('countryDropdown');
    this.countrySearch = document.getElementById('countrySearch');
    this.countryList = document.getElementById('countryList');
    this.selectedCountry = document.getElementById('selectedCountry');
    this.countrySelector = document.querySelector('.country-selector');
    
    this.countries = [
      { code: 'US', name: 'United States', flag: '🇺🇸' },
      { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
      { code: 'CA', name: 'Canada', flag: '🇨🇦' },
      { code: 'AU', name: 'Australia', flag: '🇦🇺' },
      { code: 'DE', name: 'Germany', flag: '🇩🇪' },
      { code: 'FR', name: 'France', flag: '🇫🇷' },
      { code: 'IT', name: 'Italy', flag: '🇮🇹' },
      { code: 'ES', name: 'Spain', flag: '🇪🇸' },
      { code: 'JP', name: 'Japan', flag: '🇯🇵' },
      { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
      { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
      { code: 'IN', name: 'India', flag: '🇮🇳' },
      { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
      { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
      { code: 'NO', name: 'Norway', flag: '🇳🇴' },
      { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
      { code: 'FI', name: 'Finland', flag: '🇫🇮' },
      { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
      { code: 'AT', name: 'Austria', flag: '🇦🇹' },
      { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
      { code: 'PL', name: 'Poland', flag: '🇵🇱' },
      { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
      { code: 'HU', name: 'Hungary', flag: '🇭🇺' },
      { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
      { code: 'GR', name: 'Greece', flag: '🇬🇷' },
      { code: 'RU', name: 'Russia', flag: '🇷🇺' },
      { code: 'CN', name: 'China', flag: '🇨🇳' },
      { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
      { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
      { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
      { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
      { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
      { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
      { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
      { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
      { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
      { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
      { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
      { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
      { code: 'CL', name: 'Chile', flag: '🇨🇱' },
      { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
      { code: 'PE', name: 'Peru', flag: '🇵🇪' },
      { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
      { code: 'UY', name: 'Uruguay', flag: '🇺🇾' },
      { code: 'PY', name: 'Paraguay', flag: '🇵🇾' },
      { code: 'BO', name: 'Bolivia', flag: '🇧🇴' },
      { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
      { code: 'GT', name: 'Guatemala', flag: '🇬🇹' },
      { code: 'CU', name: 'Cuba', flag: '🇨🇺' },
      { code: 'DO', name: 'Dominican Republic', flag: '🇩🇴' },
      { code: 'HT', name: 'Haiti', flag: '🇭🇹' },
      { code: 'JM', name: 'Jamaica', flag: '🇯🇲' },
      { code: 'TT', name: 'Trinidad and Tobago', flag: '🇹🇹' },
      { code: 'BB', name: 'Barbados', flag: '🇧🇧' },
      { code: 'BS', name: 'Bahamas', flag: '🇧🇸' },
      { code: 'BZ', name: 'Belize', flag: '🇧🇿' },
      { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
      { code: 'PA', name: 'Panama', flag: '🇵🇦' },
      { code: 'HN', name: 'Honduras', flag: '🇭🇳' },
      { code: 'NI', name: 'Nicaragua', flag: '🇳🇮' },
      { code: 'SV', name: 'El Salvador', flag: '🇸🇻' }
    ];
    
    this.currentCountry = this.getStoredCountry() || 'US';
    this.filteredCountries = [...this.countries];
    
    this.init();
  }
  
  init() {
    this.renderCountries();
    this.updateSelectedCountry();
    this.bindEvents();
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
        <span class="name">${country.name}</span>
      </div>
    `).join('');
  }
  
  selectCountry(countryCode) {
    this.currentCountry = countryCode;
    this.updateSelectedCountry();
    this.storeCountry(countryCode);
    this.closeDropdown();
    
    // Trigger custom event for other parts of the app
    document.dispatchEvent(new CustomEvent('countryChanged', {
      detail: { countryCode, country: this.countries.find(c => c.code === countryCode) }
    }));
  }
  
  updateSelectedCountry() {
    const country = this.countries.find(c => c.code === this.currentCountry);
    if (country) {
      this.selectedCountry.textContent = country.code;
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
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new CountrySelector();
});
