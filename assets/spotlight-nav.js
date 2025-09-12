class SpotlightNavigation {
  constructor() {
    this.config = {
      theme: 'dark',
      spotlight: {
        speed: 0.25,
        deviation: 0.8,
        surface: 0.5,
        specular: 6,
        exponent: 65,
        light: 'hsla(234, 14%, 72%, 0.25)',
        x: 0,
        y: 54,
        z: 82,
        pointer: false,
      },
      ambience: {
        deviation: 0.8,
        surface: 0.5,
        specular: 25,
        exponent: 65,
        light: 'hsla(234, 14%, 72%, 0.25)',
        x: 120,
        y: -154,
        z: 160,
      },
    };

    this.nav = document.querySelector('.spotlight-nav');
    this.links = this.nav?.querySelectorAll('a');
    this.spotlightfeGaussianBlur = document.querySelector('#spotlight feGaussianBlur');
    this.spotlightfeSpecularLighting = document.querySelector('#spotlight feSpecularLighting');
    this.spotlightfePointLight = document.querySelector('#spotlight fePointLight');
    this.ambiencefeGaussianBlur = document.querySelector('#ambience feGaussianBlur');
    this.ambiencefeSpecularLighting = document.querySelector('#ambience feSpecularLighting');
    this.ambiencefePointLight = document.querySelector('#ambience fePointLight');
    this.configPanel = null;
    this.monitoring = false;

    if (this.nav && this.links) {
      this.init();
    }
  }

  init() {
    this.update();
    this.setupEventListeners();
    this.setupKonamiCode();
  }

  setupEventListeners() {
    this.nav.addEventListener('click', (event) => {
      if (event.target.tagName === 'A') {
        this.selectAnchor(event.target);
      }
    });

    // Listen for Konami code
    document.addEventListener('konamiCode', () => {
      this.toggleConfigPanel();
    });
  }

  setupKonamiCode() {
    let konamiCode = [];
    const konamiSequence = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'KeyB', 'KeyA'
    ];

    document.addEventListener('keydown', (e) => {
      konamiCode.push(e.code);
      if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
      }
      
      if (konamiCode.length === konamiSequence.length) {
        if (konamiCode.every((code, index) => code === konamiSequence[index])) {
          document.dispatchEvent(new CustomEvent('konamiCode'));
          konamiCode = [];
        }
      }
    });
  }

  syncLight({ x, y }) {
    const navBounds = this.nav.getBoundingClientRect();
    this.spotlightfePointLight.setAttribute('x', Math.floor(x - navBounds.x));
    this.spotlightfePointLight.setAttribute('y', Math.floor(y - navBounds.y));
  }

  update() {
    document.documentElement.dataset.theme = this.config.theme;
    
    // Set spotlight
    this.spotlightfeGaussianBlur.setAttribute('stdDeviation', this.config.spotlight.deviation);
    this.spotlightfeSpecularLighting.setAttribute('surfaceScale', this.config.spotlight.surface);
    this.spotlightfeSpecularLighting.setAttribute('specularConstant', this.config.spotlight.specular);
    this.spotlightfeSpecularLighting.setAttribute('specularExponent', this.config.spotlight.exponent);
    this.spotlightfeSpecularLighting.setAttribute('lighting-color', this.config.spotlight.light);
    
    // Set ambience
    this.ambiencefeGaussianBlur.setAttribute('stdDeviation', this.config.ambience.deviation);
    this.ambiencefeSpecularLighting.setAttribute('surfaceScale', this.config.ambience.surface);
    this.ambiencefeSpecularLighting.setAttribute('specularConstant', this.config.ambience.specular);
    this.ambiencefeSpecularLighting.setAttribute('specularExponent', this.config.ambience.exponent);
    this.ambiencefeSpecularLighting.setAttribute('lighting-color', this.config.ambience.light);
    
    const anchor = document.querySelector('[data-active="true"]');
    const navBounds = this.nav.getBoundingClientRect();
    const anchorBounds = anchor.getBoundingClientRect();

    this.spotlightfePointLight.setAttribute(
      'x',
      anchorBounds.left - navBounds.left + anchorBounds.width * 0.5 + this.config.spotlight.x
    );
    this.spotlightfePointLight.setAttribute('y', this.config.spotlight.y);
    this.spotlightfePointLight.setAttribute('z', this.config.spotlight.z);

    this.ambiencefePointLight.setAttribute('x', this.config.ambience.x);
    this.ambiencefePointLight.setAttribute('y', this.config.ambience.y);
    this.ambiencefePointLight.setAttribute('z', this.config.ambience.z);

    if (this.config.spotlight.pointer && !this.monitoring) {
      this.monitoring = true;
      this.nav.dataset.pointerLighting = true;
      window.addEventListener('pointermove', (e) => this.syncLight(e));
    } else if (!this.config.spotlight.pointer) {
      this.monitoring = false;
      this.nav.dataset.pointerLighting = false;
      window.removeEventListener('pointermove', (e) => this.syncLight(e));
    }
  }

  selectAnchor(anchor) {
    if (!this.config.spotlight.pointer) {
      const navBounds = this.nav.getBoundingClientRect();
      const anchorBounds = anchor.getBoundingClientRect();
      
      for (const link of this.links) {
        link.dataset.active = anchor === link;
      }
      
      // Animate spotlight position
      const targetX = anchorBounds.left - navBounds.left + anchorBounds.width * 0.5 + this.config.spotlight.x;
      
      this.spotlightfePointLight.style.transition = `x ${this.config.spotlight.speed}s ease-out`;
      this.spotlightfePointLight.setAttribute('x', targetX);
    }
  }

  toggleConfigPanel() {
    if (this.configPanel) {
      this.configPanel.remove();
      this.configPanel = null;
      return;
    }

    this.createConfigPanel();
  }

  createConfigPanel() {
    this.configPanel = document.createElement('div');
    this.configPanel.className = 'config-panel';
    this.configPanel.innerHTML = `
      <div class="config-header">
        <h3>🎮 Spotlight Navigation Config</h3>
        <button class="config-close" onclick="spotlightNav.toggleConfigPanel()">×</button>
      </div>
      <div class="config-content">
        <div class="config-section">
          <h4>Spotlight</h4>
          <div class="config-group">
            <label>Speed: <span id="speed-value">${this.config.spotlight.speed}s</span></label>
            <input type="range" id="speed" min="0.1" max="2" step="0.1" value="${this.config.spotlight.speed}">
          </div>
          <div class="config-group">
            <label>Deviation: <span id="deviation-value">${this.config.spotlight.deviation}</span></label>
            <input type="range" id="deviation" min="0" max="10" step="0.1" value="${this.config.spotlight.deviation}">
          </div>
          <div class="config-group">
            <label>Surface: <span id="surface-value">${this.config.spotlight.surface}</span></label>
            <input type="range" id="surface" min="0" max="50" step="0.1" value="${this.config.spotlight.surface}">
          </div>
          <div class="config-group">
            <label>Specular: <span id="specular-value">${this.config.spotlight.specular}</span></label>
            <input type="range" id="specular" min="0" max="25" step="0.1" value="${this.config.spotlight.specular}">
          </div>
          <div class="config-group">
            <label>Exponent: <span id="exponent-value">${this.config.spotlight.exponent}</span></label>
            <input type="range" id="exponent" min="0" max="200" step="1" value="${this.config.spotlight.exponent}">
          </div>
          <div class="config-group">
            <label>X Offset: <span id="x-value">${this.config.spotlight.x}</span></label>
            <input type="range" id="x-offset" min="-100" max="100" step="1" value="${this.config.spotlight.x}">
          </div>
          <div class="config-group">
            <label>Y Offset: <span id="y-value">${this.config.spotlight.y}</span></label>
            <input type="range" id="y-offset" min="-100" max="100" step="1" value="${this.config.spotlight.y}">
          </div>
          <div class="config-group">
            <label>Z Distance: <span id="z-value">${this.config.spotlight.z}</span></label>
            <input type="range" id="z-distance" min="0" max="500" step="1" value="${this.config.spotlight.z}">
          </div>
          <div class="config-group">
            <label>
              <input type="checkbox" id="pointer-mode" ${this.config.spotlight.pointer ? 'checked' : ''}>
              Follow Mouse
            </label>
          </div>
        </div>
        <div class="config-section">
          <h4>Ambience</h4>
          <div class="config-group">
            <label>Deviation: <span id="amb-deviation-value">${this.config.ambience.deviation}</span></label>
            <input type="range" id="amb-deviation" min="0" max="10" step="0.1" value="${this.config.ambience.deviation}">
          </div>
          <div class="config-group">
            <label>Surface: <span id="amb-surface-value">${this.config.ambience.surface}</span></label>
            <input type="range" id="amb-surface" min="0" max="50" step="0.1" value="${this.config.ambience.surface}">
          </div>
          <div class="config-group">
            <label>Specular: <span id="amb-specular-value">${this.config.ambience.specular}</span></label>
            <input type="range" id="amb-specular" min="0" max="25" step="0.1" value="${this.config.ambience.specular}">
          </div>
          <div class="config-group">
            <label>Exponent: <span id="amb-exponent-value">${this.config.ambience.exponent}</span></label>
            <input type="range" id="amb-exponent" min="0" max="200" step="1" value="${this.config.ambience.exponent}">
          </div>
        </div>
        <div class="config-actions">
          <button onclick="spotlightNav.resetConfig()">Reset</button>
          <button onclick="spotlightNav.copyConfig()">Copy Config</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.configPanel);
    this.setupConfigListeners();
  }

  setupConfigListeners() {
    const inputs = this.configPanel.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('input', (e) => {
        const id = e.target.id;
        const value = parseFloat(e.target.value);
        
        if (id.startsWith('amb-')) {
          const key = id.replace('amb-', '').replace('-value', '');
          this.config.ambience[key] = value;
          e.target.nextElementSibling.textContent = value;
        } else {
          const key = id.replace('-value', '').replace('-offset', '').replace('-distance', '');
          if (key === 'x') this.config.spotlight.x = value;
          else if (key === 'y') this.config.spotlight.y = value;
          else if (key === 'z') this.config.spotlight.z = value;
          else this.config.spotlight[key] = value;
          
          e.target.nextElementSibling.textContent = value;
        }
        
        this.update();
      });
    });

    const pointerMode = this.configPanel.querySelector('#pointer-mode');
    pointerMode.addEventListener('change', (e) => {
      this.config.spotlight.pointer = e.target.checked;
      this.update();
    });
  }

  resetConfig() {
    this.config = {
      theme: 'dark',
      spotlight: {
        speed: 0.25,
        deviation: 0.8,
        surface: 0.5,
        specular: 6,
        exponent: 65,
        light: 'hsla(234, 14%, 72%, 0.25)',
        x: 0,
        y: 54,
        z: 82,
        pointer: false,
      },
      ambience: {
        deviation: 0.8,
        surface: 0.5,
        specular: 25,
        exponent: 65,
        light: 'hsla(234, 14%, 72%, 0.25)',
        x: 120,
        y: -154,
        z: 160,
      },
    };
    this.update();
    this.toggleConfigPanel();
    this.toggleConfigPanel();
  }

  copyConfig() {
    navigator.clipboard.writeText(JSON.stringify(this.config, null, 2));
    alert('Config copied to clipboard!');
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.spotlightNav = new SpotlightNavigation();
});
