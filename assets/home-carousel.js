/**
 * Homepage Carousel Controller
 * Handles carousel navigation for trending and new collections
 */
class HomeCarouselController {
  constructor() {
    this.carousels = new Map();
    this.init();
  }

  init() {
    this.setupCarousels();
    this.setupEventListeners();
    this.updateButtonStates();
  }

  setupCarousels() {
    const carouselTracks = document.querySelectorAll('.carousel-track');
    
    carouselTracks.forEach(track => {
      const carouselId = track.dataset.carousel;
      if (carouselId) {
        this.carousels.set(carouselId, {
          track: track,
          container: track.closest('.carousel-container'),
          prevBtn: document.querySelector(`[data-carousel="${carouselId}"].prev`),
          nextBtn: document.querySelector(`[data-carousel="${carouselId}"].next`),
          scrollAmount: 300,
          isScrolling: false
        });
      }
    });
  }

  setupEventListeners() {
    // Carousel navigation buttons
    this.carousels.forEach((carousel, carouselId) => {
      if (carousel.prevBtn) {
        carousel.prevBtn.addEventListener('click', () => this.navigate(carouselId, 'prev'));
      }
      if (carousel.nextBtn) {
        carousel.nextBtn.addEventListener('click', () => this.navigate(carouselId, 'next'));
      }

      // Touch/swipe support
      let startX = 0;
      let startY = 0;
      let isDragging = false;

      carousel.track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isDragging = true;
      });

      carousel.track.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = startX - currentX;
        const diffY = startY - currentY;

        // Only handle horizontal swipes
        if (Math.abs(diffX) > Math.abs(diffY)) {
          e.preventDefault();
        }
      });

      carousel.track.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        
        const endX = e.changedTouches[0].clientX;
        const diffX = startX - endX;
        
        if (Math.abs(diffX) > 50) { // Minimum swipe distance
          if (diffX > 0) {
            this.navigate(carouselId, 'next');
          } else {
            this.navigate(carouselId, 'prev');
          }
        }
        
        isDragging = false;
      });

      // Mouse drag support
      let mouseStartX = 0;
      let isMouseDragging = false;

      carousel.track.addEventListener('mousedown', (e) => {
        mouseStartX = e.clientX;
        isMouseDragging = true;
        carousel.track.style.cursor = 'grabbing';
        e.preventDefault();
      });

      carousel.track.addEventListener('mousemove', (e) => {
        if (!isMouseDragging) return;
        e.preventDefault();
      });

      carousel.track.addEventListener('mouseup', (e) => {
        if (!isMouseDragging) return;
        
        const mouseEndX = e.clientX;
        const diffX = mouseStartX - mouseEndX;
        
        if (Math.abs(diffX) > 50) {
          if (diffX > 0) {
            this.navigate(carouselId, 'next');
          } else {
            this.navigate(carouselId, 'prev');
          }
        }
        
        isMouseDragging = false;
        carousel.track.style.cursor = 'grab';
      });

      carousel.track.addEventListener('mouseleave', () => {
        isMouseDragging = false;
        carousel.track.style.cursor = 'grab';
      });

      // Keyboard navigation
      carousel.track.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.navigate(carouselId, 'prev');
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.navigate(carouselId, 'next');
        }
      });

      // Make track focusable for keyboard navigation
      carousel.track.setAttribute('tabindex', '0');
      carousel.track.style.cursor = 'grab';
    });

    // Tab switching
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
    });

    // Resize handler
    window.addEventListener('resize', () => this.updateButtonStates());
  }

  navigate(carouselId, direction) {
    const carousel = this.carousels.get(carouselId);
    if (!carousel || carousel.isScrolling) return;

    carousel.isScrolling = true;
    
    const currentScroll = carousel.track.scrollLeft;
    const scrollAmount = carousel.scrollAmount;
    const targetScroll = direction === 'next' 
      ? currentScroll + scrollAmount 
      : currentScroll - scrollAmount;

    this.smoothScroll(carousel.track, targetScroll, () => {
      carousel.isScrolling = false;
      this.updateButtonStates();
    });
  }

  smoothScroll(element, target, callback) {
    const start = element.scrollLeft;
    const distance = target - start;
    const duration = 300;
    let startTime = null;

    const easeInOutCubic = (t) => {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    };

    const animate = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      
      element.scrollLeft = start + distance * easeInOutCubic(progress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else if (callback) {
        callback();
      }
    };

    requestAnimationFrame(animate);
  }

  updateButtonStates() {
    this.carousels.forEach((carousel, carouselId) => {
      if (!carousel.track) return;

      const { scrollLeft, scrollWidth, clientWidth } = carousel.track;
      const isAtStart = scrollLeft <= 0;
      const isAtEnd = scrollLeft >= scrollWidth - clientWidth - 1;

      if (carousel.prevBtn) {
        carousel.prevBtn.disabled = isAtStart;
      }
      if (carousel.nextBtn) {
        carousel.nextBtn.disabled = isAtEnd;
      }
    });
  }

  switchTab(tabName) {
    // Remove active class from all tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.remove('active');
    });

    // Add active class to clicked tab
    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeTab) {
      activeTab.classList.add('active');
    }

    // Here you could add logic to show/hide different content based on tab
    console.log(`Switched to ${tabName} tab`);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new HomeCarouselController();
});

// Export for potential external use
window.HomeCarouselController = HomeCarouselController;
