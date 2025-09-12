class ShoppingCart {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('cart') || '[]');
    this.cartButton = document.getElementById('cart-button');
    this.cartCount = document.getElementById('cart-count');
    this.cartDropdown = document.getElementById('cart-dropdown');
    this.cartClose = document.getElementById('cart-close');
    this.cartItems = document.getElementById('cart-items');
    this.cartFooter = document.getElementById('cart-footer');
    this.cartTotal = document.getElementById('cart-total');
    
    this.init();
  }

  init() {
    this.updateCartCount();
    this.renderCartItems();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Cart button toggle
    this.cartButton?.addEventListener('click', () => this.toggleCart());
    
    // Close cart
    this.cartClose?.addEventListener('click', () => this.closeCart());
    
    // Close cart when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.cartDropdown?.contains(e.target) && !this.cartButton?.contains(e.target)) {
        this.closeCart();
      }
    });

    // Listen for add to cart events
    document.addEventListener('addToCart', (e) => {
      this.addItem(e.detail);
    });
  }

  addItem(product) {
    const existingItem = this.items.find(item => 
      item.id === product.id && item.variant === product.variant
    );

    if (existingItem) {
      existingItem.quantity += product.quantity || 1;
    } else {
      this.items.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        variant: product.variant || 'Default',
        quantity: product.quantity || 1
      });
    }

    this.saveCart();
    this.updateCartCount();
    this.renderCartItems();
    this.showCart();
  }

  removeItem(index) {
    this.items.splice(index, 1);
    this.saveCart();
    this.updateCartCount();
    this.renderCartItems();
  }

  updateQuantity(index, newQuantity) {
    if (newQuantity <= 0) {
      this.removeItem(index);
    } else {
      this.items[index].quantity = newQuantity;
      this.saveCart();
      this.updateCartCount();
      this.renderCartItems();
    }
  }

  clearCart() {
    this.items = [];
    this.saveCart();
    this.updateCartCount();
    this.renderCartItems();
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.items));
  }

  updateCartCount() {
    const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
    this.cartCount.textContent = totalItems;
  }

  renderCartItems() {
    if (!this.cartItems) return;

    if (this.items.length === 0) {
      this.cartItems.innerHTML = `
        <div class="cart-empty">
          <p>Your cart is empty</p>
          <a href="/collections/all" class="btn-primary">Continue Shopping</a>
        </div>
      `;
      this.cartFooter.hidden = true;
      return;
    }

    this.cartItems.innerHTML = this.items.map((item, index) => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.title}" class="cart-item-image">
        <div class="cart-item-details">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-variant">${item.variant}</div>
          <div class="cart-item-price">$${item.price}</div>
        </div>
        <div class="cart-item-controls">
          <div class="quantity-controls">
            <button onclick="cart.updateQuantity(${index}, ${item.quantity - 1})" class="quantity-btn minus">-</button>
            <span class="quantity-display">${item.quantity}</span>
            <button onclick="cart.updateQuantity(${index}, ${item.quantity + 1})" class="quantity-btn plus">+</button>
          </div>
          <button onclick="cart.removeItem(${index})" class="cart-item-remove" title="Remove item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6"></polyline>
              <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `).join('');

    this.cartFooter.hidden = false;
    this.updateTotal();
  }

  updateTotal() {
    const total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.cartTotal.textContent = `$${total.toFixed(2)}`;
  }

  toggleCart() {
    this.cartDropdown.classList.toggle('open');
    document.body.classList.toggle('cart-open');
  }

  showCart() {
    this.cartDropdown.classList.add('open');
    document.body.classList.add('cart-open');
  }

  closeCart() {
    this.cartDropdown.classList.remove('open');
    document.body.classList.remove('cart-open');
  }

  getCartData() {
    return {
      items: this.items,
      total: this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      itemCount: this.items.reduce((sum, item) => sum + item.quantity, 0)
    };
  }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.cart = new ShoppingCart();
});

// Helper function to add items to cart from product pages
function addToCart(productData) {
  const event = new CustomEvent('addToCart', {
    detail: productData
  });
  document.dispatchEvent(event);
}
