(function(){
  const mobileToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      mobileMenu.hidden = !isOpen;
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // Animated Search Box
  const searchBox = document.querySelector('.search-box');
  const searchInput = document.querySelector('.search-input');
  const searchIcon = document.querySelector('.search-icon');
  
  if (searchBox && searchInput && searchIcon) {
    // Click on search icon to activate
    searchIcon.addEventListener('click', () => {
      searchBox.classList.add('active');
      searchInput.focus();
    });

    // Click outside to deactivate
    document.addEventListener('click', (e) => {
      if (!searchBox.contains(e.target)) {
        searchBox.classList.remove('active');
        searchInput.blur();
        searchInput.value = '';
      }
    });

    // Handle search input
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
          // Redirect to search page with query
          window.location.href = `/search?q=${encodeURIComponent(query)}`;
        }
      }
    });

    // Handle escape key
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchBox.classList.remove('active');
        searchInput.blur();
        searchInput.value = '';
      }
    });
  }


  // Parallax background effect
  const hero = document.querySelector('.parallax-hero');
  if (hero && window.themeSettings?.enableParallax) {
    const bgUrl = hero.getAttribute('data-bg');
    if (bgUrl) {
      hero.style.setProperty('--hero-bg', `url('${bgUrl}')`);
      const before = document.createElement('style');
      before.innerHTML = `.parallax-hero::before{background-image: var(--hero-bg)}`;
      document.head.appendChild(before);
      // Set layered backgrounds
      const back = hero.querySelector('.layer-back');
      const mid = hero.querySelector('.layer-mid');
      if (back) back.style.backgroundImage = `var(--hero-bg)`;
      if (mid) mid.style.backgroundImage = `var(--hero-bg)`;
    }
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const back = hero.querySelector('.layer-back');
    const mid = hero.querySelector('.layer-mid');
    const content = hero.querySelector('.content');

    const handleScroll = () => {
      const rect = hero.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
      const yBack = (window.innerHeight - rect.top) * 0.10;   // slowest
      const yMid  = (window.innerHeight - rect.top) * 0.18;   // medium
      const yFg   = (window.innerHeight - rect.top) * 0.26;   // fastest
      const scale = 1 + Math.max(0, (rect.top * -1) / 2500);
      const opacity = Math.max(0.45, 0.95 - progress * 0.4);

      if (!prefersReducedMotion) {
        if (back) back.style.transform = `translate3d(0, ${yBack}px, 0) scale(${scale})`;
        if (mid)  mid.style.transform  = `translate3d(0, ${yMid}px, 0) scale(${scale})`;
        hero.style.setProperty('--before-transform', `translate3d(0, ${yFg}px, 0) scale(${scale})`);
        if (content) content.style.transform = `translate3d(0, ${Math.max(0, yFg * 0.25)}px, 0)`;
      }
      hero.style.setProperty('--opacity', String(opacity));
    };

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => { handleScroll(); ticking = false; });
        ticking = true;
      }
    }, { passive: true });

    // Mouse parallax for depth on desktop
    window.addEventListener('mousemove', (e) => {
      if (prefersReducedMotion) return;
      const rect = hero.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      const xBack = relX * -10, yBack = relY * -8;
      const xMid  = relX *  18, yMid  = relY *  12;
      const xFg   = relX * -26, yFg   = relY * -18;
      if (back) back.style.transform += ` translate(${xBack}px, ${yBack}px)`;
      if (mid)  mid.style.transform  += ` translate(${xMid}px, ${yMid}px)`;
      hero.style.setProperty('--before-transform', `translate3d(${xFg}px, ${yFg}px, 0)`);
    }, { passive: true });

    // Initialize once
    handleScroll();
  }

  // Reveal animation
  const reveals = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.15 });
  reveals.forEach((el) => io.observe(el));

  // Simple poster card interactions for collection page
  const posterCards = document.querySelectorAll('.poster-card');
  posterCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
      card.style.setProperty('--rotate-x', `${rotateX}deg`);
      card.style.setProperty('--rotate-y', `${rotateY}deg`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--mouse-x', '50%');
      card.style.setProperty('--mouse-y', '50%');
      card.style.setProperty('--rotate-x', '0deg');
      card.style.setProperty('--rotate-y', '0deg');
    });
  });

  // Hero button glow effects
  const heroButtons = document.querySelectorAll('.btn-primary');
  heroButtons.forEach(button => {
    button.addEventListener('mousemove', (e) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate glow intensity based on distance from center
      const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
      const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
      const intensity = 1 - (distance / maxDistance);
      
      // Set glow position and intensity
      button.style.setProperty('--glow-x', `${x}px`);
      button.style.setProperty('--glow-y', `${y}px`);
      button.style.setProperty('--glow-intensity', intensity);
      
      // Update the before pseudo-element glow
      const beforeEl = button;
      if (beforeEl) {
        beforeEl.style.setProperty('--glow-opacity', Math.max(0.3, intensity * 0.8));
        beforeEl.style.setProperty('--glow-scale', 1 + intensity * 0.2);
      }
    });

    button.addEventListener('mouseleave', () => {
      button.style.setProperty('--glow-x', '50%');
      button.style.setProperty('--glow-y', '50%');
      button.style.setProperty('--glow-intensity', '0');
      button.style.setProperty('--glow-opacity', '0');
      button.style.setProperty('--glow-scale', '1');
    });
  });

  // Dynamic background sphere interactions
  const spheres = document.querySelectorAll('.floating-sphere');
  spheres.forEach((sphere, index) => {
    // Add subtle mouse interaction to spheres
    document.addEventListener('mousemove', (e) => {
      const rect = sphere.getBoundingClientRect();
      const sphereCenterX = rect.left + rect.width / 2;
      const sphereCenterY = rect.top + rect.height / 2;
      const distance = Math.sqrt(
        Math.pow(e.clientX - sphereCenterX, 2) + 
        Math.pow(e.clientY - sphereCenterY, 2)
      );
      
      // Influence sphere movement based on mouse proximity
      if (distance < 200) {
        const influence = (200 - distance) / 200;
        const moveX = (e.clientX - sphereCenterX) * influence * 0.1;
        const moveY = (e.clientY - sphereCenterY) * influence * 0.1;
        
        sphere.style.setProperty('--mouse-influence-x', `${moveX}px`);
        sphere.style.setProperty('--mouse-influence-y', `${moveY}px`);
        sphere.style.setProperty('--mouse-influence-scale', 1 + influence * 0.1);
      } else {
        sphere.style.setProperty('--mouse-influence-x', '0px');
        sphere.style.setProperty('--mouse-influence-y', '0px');
        sphere.style.setProperty('--mouse-influence-scale', '1');
      }
    });
  });

  // Apply theme settings to CSS custom properties
  if (window.themeSettings) {
    const root = document.documentElement;
    root.style.setProperty('--button-width', `${window.themeSettings.buttonWidth}px`);
    root.style.setProperty('--button-height', `${window.themeSettings.buttonHeight}px`);
    root.style.setProperty('--button-font-size', `${window.themeSettings.buttonFontSize}px`);
    root.style.setProperty('--teal', window.themeSettings.colorTeal);
    root.style.setProperty('--purple', window.themeSettings.colorPurple);
    root.style.setProperty('--accent', window.themeSettings.colorAccent);
  }

  // Subcategory filtering for TV & Movies collection
  const subcategoryButtons = document.querySelectorAll('.subcategory-btn');
  const productCards = document.querySelectorAll('.product-card, .collection-item');
  
  subcategoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all subcategory buttons
      subcategoryButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      const subcategory = button.getAttribute('data-subcategory');
      console.log('Filtering by subcategory:', subcategory);
      
      // Filter products based on subcategory
      productCards.forEach(card => {
        const productTitle = card.querySelector('.product-title, .card-title, h3')?.textContent.toLowerCase() || '';
        const productTags = card.getAttribute('data-tags')?.toLowerCase() || '';
        const productType = card.getAttribute('data-type')?.toLowerCase() || '';
        
        let shouldShow = false;
        
        if (subcategory === 'marvel') {
          shouldShow = productTitle.includes('marvel') || productTags.includes('marvel') || 
                      productTitle.includes('avengers') || productTitle.includes('spider-man') ||
                      productTitle.includes('iron man') || productTitle.includes('thor') ||
                      productTitle.includes('captain america') || productTitle.includes('hulk');
        } else if (subcategory === 'dc') {
          shouldShow = productTitle.includes('dc') || productTags.includes('dc') || 
                      productTitle.includes('batman') || productTitle.includes('superman') ||
                      productTitle.includes('wonder woman') || productTitle.includes('flash') ||
                      productTitle.includes('aquaman') || productTitle.includes('justice league');
        } else if (subcategory === 'star-wars') {
          shouldShow = productTitle.includes('star wars') || productTags.includes('star-wars') || 
                      productTitle.includes('starwars') || productTitle.includes('jedi') ||
                      productTitle.includes('sith') || productTitle.includes('yoda') ||
                      productTitle.includes('darth vader') || productTitle.includes('luke skywalker');
        } else if (subcategory === 'anime') {
          shouldShow = productTitle.includes('anime') || productTags.includes('anime') || 
                      productTitle.includes('naruto') || productTitle.includes('dragon ball') ||
                      productTitle.includes('one piece') || productTitle.includes('attack on titan') ||
                      productTitle.includes('demon slayer') || productTitle.includes('my hero academia');
        }
        
        if (shouldShow) {
          card.style.display = 'block';
          card.classList.remove('hidden');
        } else {
          card.style.display = 'none';
          card.classList.add('hidden');
        }
      });
      
      // Update URL with subcategory parameter
      const url = new URL(window.location);
      if (subcategory) {
        url.searchParams.set('subcategory', subcategory);
      } else {
        url.searchParams.delete('subcategory');
      }
      window.history.pushState({}, '', url);
    });
  });
  
  // Handle subcategory from URL on page load
  const urlParams = new URLSearchParams(window.location.search);
  const subcategoryParam = urlParams.get('subcategory');
  if (subcategoryParam) {
    const matchingButton = document.querySelector(`[data-subcategory="${subcategoryParam}"]`);
    if (matchingButton) {
      matchingButton.click();
    }
  }

  // Carousel functionality
  class CarouselController {
    constructor() {
      this.carousels = new Map();
      this.init();
    }

    init() {
      // Initialize all carousels
      const carouselContainers = document.querySelectorAll('.carousel-container');
      carouselContainers.forEach(container => {
        const track = container.querySelector('.carousel-track');
        const prevBtn = document.querySelector(`[data-target="${container.id}"]`);
        const nextBtn = document.querySelector(`[data-target="${container.id}"]`);
        
        if (track) {
          this.carousels.set(container.id, {
            container,
            track,
            currentIndex: 0,
            itemWidth: 216, // 200px + 16px gap
            visibleItems: this.getVisibleItems(container),
            totalItems: track.children.length
          });
        }
      });

      // Add event listeners
      this.addEventListeners();
    }

    getVisibleItems(container) {
      const containerWidth = container.offsetWidth;
      return Math.floor(containerWidth / 216); // 200px card + 16px gap
    }

    addEventListeners() {
      // Carousel navigation buttons
      document.querySelectorAll('.carousel-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const target = e.target.closest('.carousel-btn').getAttribute('data-target');
          const direction = e.target.closest('.carousel-btn').classList.contains('prev') ? -1 : 1;
          this.navigate(target, direction);
        });
      });

      // Touch/swipe support
      document.querySelectorAll('.carousel-track').forEach(track => {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        track.addEventListener('touchstart', (e) => {
          startX = e.touches[0].clientX;
          isDragging = true;
        });

        track.addEventListener('touchmove', (e) => {
          if (!isDragging) return;
          currentX = e.touches[0].clientX;
        });

        track.addEventListener('touchend', (e) => {
          if (!isDragging) return;
          isDragging = false;
          
          const diffX = startX - currentX;
          const threshold = 50;
          
          if (Math.abs(diffX) > threshold) {
            const direction = diffX > 0 ? 1 : -1;
            const carouselId = track.closest('.carousel-container').id;
            this.navigate(carouselId, direction);
          }
        });
      });

      // Mouse drag support
      document.querySelectorAll('.carousel-track').forEach(track => {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        track.addEventListener('mousedown', (e) => {
          startX = e.clientX;
          isDragging = true;
          track.style.cursor = 'grabbing';
        });

        track.addEventListener('mousemove', (e) => {
          if (!isDragging) return;
          currentX = e.clientX;
        });

        track.addEventListener('mouseup', (e) => {
          if (!isDragging) return;
          isDragging = false;
          track.style.cursor = 'grab';
          
          const diffX = startX - currentX;
          const threshold = 50;
          
          if (Math.abs(diffX) > threshold) {
            const direction = diffX > 0 ? 1 : -1;
            const carouselId = track.closest('.carousel-container').id;
            this.navigate(carouselId, direction);
          }
        });

        track.addEventListener('mouseleave', () => {
          isDragging = false;
          track.style.cursor = 'grab';
        });
      });

      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          const activeCarousel = document.querySelector('.carousel-container:focus-within');
          if (activeCarousel) {
            e.preventDefault();
            const direction = e.key === 'ArrowLeft' ? -1 : 1;
            this.navigate(activeCarousel.id, direction);
          }
        }
      });
    }

    navigate(carouselId, direction) {
      const carousel = this.carousels.get(carouselId);
      if (!carousel) return;

      const maxIndex = Math.max(0, carousel.totalItems - carousel.visibleItems);
      const newIndex = Math.max(0, Math.min(maxIndex, carousel.currentIndex + direction));
      
      if (newIndex !== carousel.currentIndex) {
        carousel.currentIndex = newIndex;
        this.updateCarousel(carousel);
        this.updateButtons(carouselId);
      }
    }

    updateCarousel(carousel) {
      const translateX = -carousel.currentIndex * carousel.itemWidth;
      carousel.track.style.transform = `translateX(${translateX}px)`;
    }

    updateButtons(carouselId) {
      const carousel = this.carousels.get(carouselId);
      if (!carousel) return;

      const prevBtn = document.querySelector(`[data-target="${carouselId}"].prev`);
      const nextBtn = document.querySelector(`[data-target="${carouselId}"].next`);

      if (prevBtn) {
        prevBtn.disabled = carousel.currentIndex === 0;
      }
      if (nextBtn) {
        nextBtn.disabled = carousel.currentIndex >= carousel.totalItems - carousel.visibleItems;
      }
    }

    // Update carousel on window resize
    updateOnResize() {
      this.carousels.forEach((carousel, id) => {
        carousel.visibleItems = this.getVisibleItems(carousel.container);
        this.updateButtons(id);
      });
    }
  }

  // Initialize carousel when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new CarouselController();
    });
  } else {
    new CarouselController();
  }

  // Update carousel on window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const carouselController = window.carouselController;
      if (carouselController) {
        carouselController.updateOnResize();
      }
    }, 250);
  });
})();
