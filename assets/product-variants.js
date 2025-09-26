class ProductVariantManager {
  constructor() {
    this.product = null;
    this.currentVariant = null;
    this.lockedColor = null; // Tracks the currently displayed color
    this.lockedImageUrl = null; // Tracks the image URL for the locked color
    this.lockedImageAlt = null; // Tracks the alt text for the locked image
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
      console.log('Product variants:', this.product.variants);
      console.log('Product images:', this.product.images);
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
        console.log('URL variant found:', variant);
        this.selectVariant(variant);
        
        // Also update the option select to show the correct selection
        const optionSelects = document.querySelectorAll('.option-select');
        optionSelects.forEach(select => {
          if (select.value !== variantId) {
            select.value = variantId;
          }
        });
      } else {
        console.log('URL variant not found for ID:', variantId);
      }
    }
  }

  setupVariantListeners() {
    // Handle multiple option selects (Color, Size, etc.)
    const optionSelects = document.querySelectorAll('.option-select');
    console.log('Found option selects:', optionSelects.length);
    
    optionSelects.forEach((select, index) => {
      console.log(`Setting up listener for option select ${index}:`, select);
      select.addEventListener('change', (e) => {
        const variantId = e.target.value;
        console.log('Option select changed to variant ID:', variantId);
        
        // Find the variant by ID
        const variant = this.product.variants.find(v => v.id.toString() === variantId);
        if (variant) {
          console.log('Found variant for ID:', variant);
          this.selectVariant(variant);
        } else {
          console.log('Variant not found for ID:', variantId);
        }
      });
    });
    
    // Also handle the main variant select if it exists
    const variantSelect = document.querySelector('select[name="id"]');
    if (variantSelect && !Array.from(optionSelects).includes(variantSelect)) {
      console.log('Setting up variant listener for main select:', variantSelect);
      variantSelect.addEventListener('change', (e) => {
        const variantId = e.target.value;
        console.log('Main variant changed to ID:', variantId);
        const variant = this.product.variants.find(v => v.id.toString() === variantId);
        if (variant) {
          console.log('Found variant:', variant);
          this.selectVariant(variant);
        } else {
          console.log('Variant not found for ID:', variantId);
        }
      });
    }
  }


  selectVariant(variant) {
    console.log('Selecting variant:', variant);
    
    // Check if this is a color change before updating currentVariant
    const isColorChange = this.isColorChange(variant);
    
    // Update currentVariant
    this.currentVariant = variant;
    
    // Update price
    this.updatePrice(variant);
    
    // Update image only if it's a color change. If size change, enforce locked image.
    if (isColorChange) {
      this.updateImage(variant);
    } else {
      console.log('Size change detected - keeping current image');
      this.enforceLockedImage();
    }
    
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
    
    if (!mainImage) return;
    
    // Find the variant-specific image for color changes
    let variantImage = null;
    
    // Always prioritize finding the first variant of the same color for image consistency
    if (this.product.variants && variant.option1) {
      const color = variant.option1;
      const firstVariantOfColor = this.product.variants.find(v => v.option1 === color);
      if (firstVariantOfColor) {
        if (firstVariantOfColor.featured_image) {
          variantImage = firstVariantOfColor.featured_image;
        } else if (firstVariantOfColor.image_id && this.product.images) {
          variantImage = this.product.images.find(img => img.id === firstVariantOfColor.image_id);
        }
      }
    }
    
    // If no color-based image found, try the current variant's image
    if (!variantImage) {
      if (variant.featured_image) {
        // Direct featured image (rare in Shopify)
        variantImage = variant.featured_image;
      } else if (variant.image_id && this.product.images) {
        // Find image by variant's image_id
        variantImage = this.product.images.find(img => img.id === variant.image_id);
      }
    }
    
    // Fallback to product featured image if no variant image
    if (!variantImage) {
      variantImage = this.product.featured_image;
    }
    
    if (variantImage) {
      // Update main image to variant image
      const imageUrl = this.getImageUrl(variantImage, 800);
      mainImage.src = imageUrl;
      mainImage.alt = variantImage.alt || this.product.title;
      
      // Lock current color and image so size changes cannot override it
      this.lockedColor = variant.option1 || this.lockedColor;
      this.lockedImageUrl = imageUrl;
      this.lockedImageAlt = mainImage.alt;
      
      // Update active thumbnail
      thumbnails.forEach(thumb => {
        const thumbImageUrl = this.getImageUrl(variantImage, 200);
        if (thumb.dataset.image === imageUrl) {
          thumb.classList.add('active');
        } else {
          thumb.classList.remove('active');
        }
      });
      
      console.log('Updated image for color change:', variant.title, 'Color:', variant.option1, 'Size:', variant.option2, 'Image:', imageUrl);
    } else {
      console.log('No image found for variant:', variant.title, 'Color:', variant.option1, 'Size:', variant.option2);
    }
  }

  // When only size changes, force the image back to the locked color image
  enforceLockedImage() {
    const mainImage = document.getElementById('main-product-image');
    if (!mainImage) return;
    if (!this.lockedImageUrl) return;
    
    if (mainImage.src !== this.lockedImageUrl) {
      mainImage.src = this.lockedImageUrl;
      if (this.lockedImageAlt) {
        mainImage.alt = this.lockedImageAlt;
      }
      console.log('Re-applied locked image for size change:', this.lockedImageUrl);
    }
  }

  isColorChange(newVariant) {
    if (!this.currentVariant) return true; // First load
    
    // Check if the color (option1) has changed
    const currentColor = this.currentVariant.option1;
    const newColor = newVariant.option1;
    
    // Also check if size (option2) has changed
    const currentSize = this.currentVariant.option2;
    const newSize = newVariant.option2;
    
    const colorChanged = currentColor !== newColor;
    const sizeChanged = currentSize !== newSize;
    
    console.log('Change detection:', {
      currentColor,
      newColor,
      currentSize,
      newSize,
      colorChanged,
      sizeChanged,
      currentVariant: this.currentVariant.title,
      newVariant: newVariant.title,
      isColorChange: colorChanged
    });
    
    return colorChanged;
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
    } else if (image && typeof image === 'object') {
      // Handle Shopify image object
      if (image.src) {
        return `${image.src}?width=${width}`;
      } else if (image.url) {
        return `${image.url}?width=${width}`;
      } else if (image.original_src) {
        return `${image.original_src}?width=${width}`;
      }
    }
    return image;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ProductVariantManager();
});
