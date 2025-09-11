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

  // Enhanced poster card interactions
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
})();
