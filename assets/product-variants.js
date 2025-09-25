class ProductVariantManager {
  constructor() {
    this.product = null;
    this.currentVariant = null;
    this.init();
  }

  async init() {
    // Get product data from Shopify
    await this.loadProductData();
    
    // Handle URL variant parameter
    this.handleUrlVariant();
    
    // Setup variant change listeners
    this.setupVariantListeners();
  }

  async loadProductData() {
    try {
      const productHandle = window.location.pathname.split('/').pop();
      const response = await fetch(`/products/${productHandle}.js`);
      this.product = await response.json();
      console.log('Product data loaded:', this.product);
    } catch (error) {
      console.error('Error loading product data:', error);
    }
  }

  handleUrlVariant() {
    const urlParams = new URLSearchParams(window.location.search);
    const variantId = urlParams.get('variant');
    
    if (variantId && this.product) {
      const variant = this.product.variants.find(v => v.id.toString() === variantId);
      if (variant) {
        this.selectVariant(variant);
      }
    }
  }

  setupVariantListeners() {
    const variantSelect = document.querySelector('select[name="id"]');
    if (variantSelect) {
      variantSelect.addEventListener('change', (e) => {
        const variantId = e.target.value;
        const variant = this.product.variants.find(v => v.id.toString() === variantId);
        if (variant) {
          this.selectVariant(variant);
        }
      });
    }
  }

  selectVariant(variant) {
    this.currentVariant = variant;
    
    // Update price
    this.updatePrice(variant);
    
    // Update image
    this.updateImage(variant);
    
    // Update availability
    this.updateAvailability(variant);
    
    // Update URL without page reload
    this.updateUrl(variant);
  }

  updatePrice(variant) {
    const priceElement = document.querySelector('.product-price .price');
    const comparePriceElement = document.querySelector('.product-price .compare-price');
    const saleBadge = document.querySelector('.product-price .sale-badge');
    
    if (priceElement) {
      priceElement.textContent = this.formatMoney(variant.price);
    }
    
    if (variant.compare_at_price && variant.compare_at_price > variant.price) {
      if (comparePriceElement) {
        comparePriceElement.textContent = this.formatMoney(variant.compare_at_price);
        comparePriceElement.style.display = 'inline';
      }
      if (saleBadge) {
        saleBadge.style.display = 'inline';
      }
    } else {
      if (comparePriceElement) {
        comparePriceElement.style.display = 'none';
      }
      if (saleBadge) {
        saleBadge.style.display = 'none';
      }
    }
  }

  updateImage(variant) {
    const mainImage = document.getElementById('main-product-image');
    const thumbnails = document.querySelectorAll('.thumbnail-item');
    
    if (variant.featured_image && mainImage) {
      // Update main image to variant image
      const imageUrl = this.getImageUrl(variant.featured_image, 800);
      mainImage.src = imageUrl;
      mainImage.alt = variant.featured_image.alt || this.product.title;
      
      // Update active thumbnail
      thumbnails.forEach(thumb => {
        const thumbImageUrl = this.getImageUrl(variant.featured_image, 200);
        if (thumb.dataset.image === imageUrl) {
          thumb.classList.add('active');
        } else {
          thumb.classList.remove('active');
        }
      });
    }
  }

  updateAvailability(variant) {
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    
    if (addToCartBtn) {
      if (variant.available) {
        addToCartBtn.disabled = false;
        addToCartBtn.textContent = 'Add to Cart';
      } else {
        addToCartBtn.disabled = true;
        addToCartBtn.textContent = 'Sold Out';
      }
    }
  }

  updateUrl(variant) {
    const url = new URL(window.location);
    url.searchParams.set('variant', variant.id);
    window.history.replaceState({}, '', url);
  }

  formatMoney(cents) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  }

  getImageUrl(image, width) {
    if (typeof image === 'string') {
      return `${image}?width=${width}`;
    } else if (image.src) {
      return `${image.src}?width=${width}`;
    } else if (image.url) {
      return `${image.url}?width=${width}`;
    }
    return image;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ProductVariantManager();
});
