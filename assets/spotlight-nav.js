// Exact CodePen Implementation
const config = {
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

const nav = document.querySelector('.spotlight-nav');
const links = nav?.querySelectorAll('a');
const spotlightfeGaussianBlur = document.querySelector('#spotlight feGaussianBlur');
const spotlightfeSpecularLighting = document.querySelector('#spotlight feSpecularLighting');
const spotlightfePointLight = document.querySelector('#spotlight fePointLight');
const ambiencefeGaussianBlur = document.querySelector('#ambience feGaussianBlur');
const ambiencefeSpecularLighting = document.querySelector('#ambience feSpecularLighting');
const ambiencefePointLight = document.querySelector('#ambience fePointLight');

let monitoring = false;

const syncLight = ({ x, y }) => {
  const navBounds = nav.getBoundingClientRect();
  spotlightfePointLight.setAttribute('x', Math.floor(x - navBounds.x));
  spotlightfePointLight.setAttribute('y', Math.floor(y - navBounds.y));
};

const update = () => {
  document.documentElement.dataset.theme = config.theme;
  
  // set spotlight
  spotlightfeGaussianBlur.setAttribute('stdDeviation', config.spotlight.deviation);
  spotlightfeSpecularLighting.setAttribute('surfaceScale', config.spotlight.surface);
  spotlightfeSpecularLighting.setAttribute('specularConstant', config.spotlight.specular);
  spotlightfeSpecularLighting.setAttribute('specularExponent', config.spotlight.exponent);
  spotlightfeSpecularLighting.setAttribute('lighting-color', config.spotlight.light);
  
  // set ambience
  ambiencefeGaussianBlur.setAttribute('stdDeviation', config.ambience.deviation);
  ambiencefeSpecularLighting.setAttribute('surfaceScale', config.ambience.surface);
  ambiencefeSpecularLighting.setAttribute('specularConstant', config.ambience.specular);
  ambiencefeSpecularLighting.setAttribute('specularExponent', config.ambience.exponent);
  ambiencefeSpecularLighting.setAttribute('lighting-color', config.ambience.light);
  
  const anchor = document.querySelector('[data-active="true"]');
  const navBounds = nav.getBoundingClientRect();
  const anchorBounds = anchor.getBoundingClientRect();

  spotlightfePointLight.setAttribute(
    'x',
    anchorBounds.left - navBounds.left + anchorBounds.width * 0.5 + config.spotlight.x
  );
  spotlightfePointLight.setAttribute('y', config.spotlight.y);
  spotlightfePointLight.setAttribute('z', config.spotlight.z);

  ambiencefePointLight.setAttribute('x', config.ambience.x);
  ambiencefePointLight.setAttribute('y', config.ambience.y);
  ambiencefePointLight.setAttribute('z', config.ambience.z);

  if (config.spotlight.pointer && !monitoring) {
    monitoring = true;
    nav.dataset.pointerLighting = true;
    window.addEventListener('pointermove', syncLight);
  } else if (!config.spotlight.pointer) {
    monitoring = false;
    nav.dataset.pointerLighting = false;
    window.removeEventListener('pointermove', syncLight);
  }
};

const selectAnchor = (anchor) => {
  if (!config.spotlight.pointer) {
    const navBounds = nav.getBoundingClientRect();
    const anchorBounds = anchor.getBoundingClientRect();
    
    for (const link of links) {
      link.dataset.active = anchor === link;
    }
    
    // Animate spotlight position using GSAP-style animation
    const targetX = anchorBounds.left - navBounds.left + anchorBounds.width * 0.5 + config.spotlight.x;
    
    spotlightfePointLight.style.transition = `x ${config.spotlight.speed}s ease-out`;
    spotlightfePointLight.setAttribute('x', targetX);
  }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (nav && links) {
    update();
    
    nav.addEventListener('click', (event) => {
      if (event.target.tagName === 'A') {
        selectAnchor(event.target);
      }
    });
    
    // Konami code for config panel
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
          // Toggle config panel
          console.log('Konami code activated!');
          konamiCode = [];
        }
      }
    });
  }
});