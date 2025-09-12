// Advanced Normal Mapping Effect using WebGL2
class NormalMappingEffect {
  constructor(container, posterImage, normalMapImage) {
    this.container = container;
    this.posterImage = posterImage;
    this.normalMapImage = normalMapImage;
    this.canvas = null;
    this.gl = null;
    this.program = null;
    this.mouseX = 0.5;
    this.mouseY = 0.5;
    this.isInitialized = false;
    
    // Lighting parameters
    this.normalIntensity = 0.8;
    this.specPower = 128;
    this.rimPower = 3.1;
    this.rimStrength = 0.9;
    this.lightZ = 0.64;
    this.lightRadius = 0.32;
    
    // Enhanced effect parameters
    this.saturation = 1.3;
    this.contrast = 1.0;
    this.exposure = 0.0;
    this.reflectionStrength = 2.0;
    this.hue = 0.0;
    
    this.init().catch(error => {
      console.error('Failed to initialize normal mapping effect:', error);
    });
  }
  
  async init() {
    try {
      this.createCanvas();
      this.setupWebGL();
      this.setupShaders();
      this.setupBuffers();
      await this.setupTextures();
      this.setupEventListeners();
      
      this.isInitialized = true;
      this.startRenderLoop();
    } catch (error) {
      console.error('Failed to initialize normal mapping effect:', error);
      throw error;
    }
  }
  
  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '2';
    this.canvas.style.opacity = '0';
    this.canvas.style.transition = 'opacity 0.3s ease';
    
    this.container.appendChild(this.canvas);
    
    // Set canvas size to match container
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    
    // Create debug UI
    this.createDebugUI();
  }
  
  createDebugUI() {
    // Create debug panel
    this.debugPanel = document.createElement('div');
    this.debugPanel.style.cssText = `
      position: fixed;
      left: 12px;
      top: 12px;
      color: #eee;
      font: 12px/1.3 system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      background: rgba(0,0,0,0.8);
      padding: 15px;
      border-radius: 10px;
      z-index: 1000;
      min-width: 250px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.1);
      display: none;
      opacity: 0;
      transform: translateX(-20px);
      transition: all 0.3s ease;
    `;
    
    this.debugPanel.innerHTML = `
      <div style="margin-bottom: 15px; font-weight: bold; color: #fff;">🎛️ Normal Mapping Debug</div>
      
      <div style="margin-bottom: 12px;">
        <label style="display: block; margin-bottom: 4px;">Normal Intensity</label>
        <input type="range" id="debugNormalIntensity" min="0" max="3" step="0.1" value="${this.normalIntensity}" style="width: 100%;">
        <span id="normalIntensityValue" style="color: #ccc; font-size: 11px;">${this.normalIntensity}</span>
      </div>
      
      <div style="margin-bottom: 12px;">
        <label style="display: block; margin-bottom: 4px;">Specular Power</label>
        <input type="range" id="debugSpecPower" min="1" max="128" step="1" value="${this.specPower}" style="width: 100%;">
        <span id="specPowerValue" style="color: #ccc; font-size: 11px;">${this.specPower}</span>
      </div>
      
      <div style="margin-bottom: 12px;">
        <label style="display: block; margin-bottom: 4px;">Rim Power</label>
        <input type="range" id="debugRimPower" min="0" max="8" step="0.1" value="${this.rimPower}" style="width: 100%;">
        <span id="rimPowerValue" style="color: #ccc; font-size: 11px;">${this.rimPower}</span>
      </div>
      
      <div style="margin-bottom: 12px;">
        <label style="display: block; margin-bottom: 4px;">Rim Strength</label>
        <input type="range" id="debugRimStrength" min="0" max="2" step="0.01" value="${this.rimStrength}" style="width: 100%;">
        <span id="rimStrengthValue" style="color: #ccc; font-size: 11px;">${this.rimStrength}</span>
      </div>
      
      <div style="margin-bottom: 12px;">
        <label style="display: block; margin-bottom: 4px;">Light Height (Z)</label>
        <input type="range" id="debugLightZ" min="0.1" max="3" step="0.01" value="${this.lightZ}" style="width: 100%;">
        <span id="lightZValue" style="color: #ccc; font-size: 11px;">${this.lightZ}</span>
      </div>
      
      <div style="margin-bottom: 12px;">
        <label style="display: block; margin-bottom: 4px;">Light Radius</label>
        <input type="range" id="debugLightRadius" min="0.1" max="3" step="0.01" value="${this.lightRadius}" style="width: 100%;">
        <span id="lightRadiusValue" style="color: #ccc; font-size: 11px;">${this.lightRadius}</span>
      </div>
      
      <div style="margin-bottom: 12px;">
        <label style="display: block; margin-bottom: 4px;">Saturation</label>
        <input type="range" id="debugSaturation" min="0" max="3" step="0.1" value="${this.saturation}" style="width: 100%;">
        <span id="saturationValue" style="color: #ccc; font-size: 11px;">${this.saturation}</span>
      </div>
      
      <div style="margin-bottom: 12px;">
        <label style="display: block; margin-bottom: 4px;">Contrast</label>
        <input type="range" id="debugContrast" min="0.1" max="3" step="0.1" value="${this.contrast}" style="width: 100%;">
        <span id="contrastValue" style="color: #ccc; font-size: 11px;">${this.contrast}</span>
      </div>
      
      <div style="margin-bottom: 12px;">
        <label style="display: block; margin-bottom: 4px;">Exposure</label>
        <input type="range" id="debugExposure" min="-3" max="3" step="0.1" value="${this.exposure}" style="width: 100%;">
        <span id="exposureValue" style="color: #ccc; font-size: 11px;">${this.exposure}</span>
      </div>
      
      <div style="margin-bottom: 12px;">
        <label style="display: block; margin-bottom: 4px;">Reflection Strength</label>
        <input type="range" id="debugReflectionStrength" min="0" max="5" step="0.1" value="${this.reflectionStrength}" style="width: 100%;">
        <span id="reflectionStrengthValue" style="color: #ccc; font-size: 11px;">${this.reflectionStrength}</span>
      </div>
      
      <div style="margin-bottom: 12px;">
        <label style="display: block; margin-bottom: 4px;">Hue Shift</label>
        <input type="range" id="debugHue" min="-180" max="180" step="1" value="${this.hue}" style="width: 100%;">
        <span id="hueValue" style="color: #ccc; font-size: 11px;">${this.hue}°</span>
      </div>
      
      <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
        <div style="font-size: 11px; color: #999;">Move mouse to drag the light</div>
        <button id="copyValues" style="margin-top: 8px; padding: 6px 12px; background: #333; border: 1px solid #555; color: #fff; border-radius: 4px; cursor: pointer; font-size: 11px;">Copy Values</button>
      </div>
    `;
    
    document.body.appendChild(this.debugPanel);
    this.setupDebugEventListeners();
    this.setupKonamiCode();
    this.addKonamiStyles();
  }
  
  setupDebugEventListeners() {
    const normalIntensitySlider = document.getElementById('debugNormalIntensity');
    const specPowerSlider = document.getElementById('debugSpecPower');
    const rimPowerSlider = document.getElementById('debugRimPower');
    const rimStrengthSlider = document.getElementById('debugRimStrength');
    const lightZSlider = document.getElementById('debugLightZ');
    const lightRadiusSlider = document.getElementById('debugLightRadius');
    const saturationSlider = document.getElementById('debugSaturation');
    const contrastSlider = document.getElementById('debugContrast');
    const exposureSlider = document.getElementById('debugExposure');
    const reflectionStrengthSlider = document.getElementById('debugReflectionStrength');
    const hueSlider = document.getElementById('debugHue');
    const copyButton = document.getElementById('copyValues');
    
    const normalIntensityValue = document.getElementById('normalIntensityValue');
    const specPowerValue = document.getElementById('specPowerValue');
    const rimPowerValue = document.getElementById('rimPowerValue');
    const rimStrengthValue = document.getElementById('rimStrengthValue');
    const lightZValue = document.getElementById('lightZValue');
    const lightRadiusValue = document.getElementById('lightRadiusValue');
    const saturationValue = document.getElementById('saturationValue');
    const contrastValue = document.getElementById('contrastValue');
    const exposureValue = document.getElementById('exposureValue');
    const reflectionStrengthValue = document.getElementById('reflectionStrengthValue');
    const hueValue = document.getElementById('hueValue');
    
    normalIntensitySlider.addEventListener('input', (e) => {
      this.normalIntensity = parseFloat(e.target.value);
      normalIntensityValue.textContent = this.normalIntensity.toFixed(1);
    });
    
    specPowerSlider.addEventListener('input', (e) => {
      this.specPower = parseFloat(e.target.value);
      specPowerValue.textContent = this.specPower;
    });
    
    rimPowerSlider.addEventListener('input', (e) => {
      this.rimPower = parseFloat(e.target.value);
      rimPowerValue.textContent = this.rimPower.toFixed(1);
    });
    
    rimStrengthSlider.addEventListener('input', (e) => {
      this.rimStrength = parseFloat(e.target.value);
      rimStrengthValue.textContent = this.rimStrength.toFixed(2);
    });
    
    lightZSlider.addEventListener('input', (e) => {
      this.lightZ = parseFloat(e.target.value);
      lightZValue.textContent = this.lightZ.toFixed(2);
    });
    
    lightRadiusSlider.addEventListener('input', (e) => {
      this.lightRadius = parseFloat(e.target.value);
      lightRadiusValue.textContent = this.lightRadius.toFixed(2);
    });
    
    saturationSlider.addEventListener('input', (e) => {
      this.saturation = parseFloat(e.target.value);
      saturationValue.textContent = this.saturation.toFixed(1);
    });
    
    contrastSlider.addEventListener('input', (e) => {
      this.contrast = parseFloat(e.target.value);
      contrastValue.textContent = this.contrast.toFixed(1);
    });
    
    exposureSlider.addEventListener('input', (e) => {
      this.exposure = parseFloat(e.target.value);
      exposureValue.textContent = this.exposure.toFixed(1);
    });
    
    reflectionStrengthSlider.addEventListener('input', (e) => {
      this.reflectionStrength = parseFloat(e.target.value);
      reflectionStrengthValue.textContent = this.reflectionStrength.toFixed(1);
    });
    
    hueSlider.addEventListener('input', (e) => {
      this.hue = parseFloat(e.target.value);
      hueValue.textContent = this.hue + '°';
    });
    
    copyButton.addEventListener('click', () => {
      const values = {
        normalIntensity: this.normalIntensity,
        specPower: this.specPower,
        rimPower: this.rimPower,
        rimStrength: this.rimStrength,
        lightZ: this.lightZ,
        lightRadius: this.lightRadius,
        saturation: this.saturation,
        contrast: this.contrast,
        exposure: this.exposure,
        reflectionStrength: this.reflectionStrength,
        hue: this.hue
      };
      
      const valuesText = `this.normalIntensity = ${this.normalIntensity};
this.specPower = ${this.specPower};
this.rimPower = ${this.rimPower};
this.rimStrength = ${this.rimStrength};
this.lightZ = ${this.lightZ};
this.lightRadius = ${this.lightRadius};
this.saturation = ${this.saturation};
this.contrast = ${this.contrast};
this.exposure = ${this.exposure};
this.reflectionStrength = ${this.reflectionStrength};
this.hue = ${this.hue};`;
      
      navigator.clipboard.writeText(valuesText).then(() => {
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
          copyButton.textContent = 'Copy Values';
        }, 2000);
      });
    });
  }
  
  setupKonamiCode() {
    // Konami Code: ↑↑↓↓←→←→BA
    const konamiCode = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'KeyB', 'KeyA'
    ];
    
    let konamiIndex = 0;
    let isDebugVisible = false;
    
    const handleKeyPress = (event) => {
      if (event.code === konamiCode[konamiIndex]) {
        konamiIndex++;
        
        if (konamiIndex === konamiCode.length) {
          // Konami code completed!
          isDebugVisible = !isDebugVisible;
          
          if (isDebugVisible) {
            this.debugPanel.style.display = 'block';
            // Trigger animation
            setTimeout(() => {
              this.debugPanel.style.opacity = '1';
              this.debugPanel.style.transform = 'translateX(0)';
            }, 10);
            
            // Add a fun message
            const message = document.createElement('div');
            message.style.cssText = `
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              background: rgba(0,0,0,0.9);
              color: #00ff00;
              padding: 20px;
              border-radius: 10px;
              font-family: monospace;
              font-size: 18px;
              z-index: 1001;
              border: 2px solid #00ff00;
              animation: pulse 0.5s ease-in-out;
            `;
            message.textContent = '🎮 Debug Mode Activated! 🎮';
            document.body.appendChild(message);
            
            setTimeout(() => {
              message.remove();
            }, 2000);
            
          } else {
            this.debugPanel.style.opacity = '0';
            this.debugPanel.style.transform = 'translateX(-20px)';
            setTimeout(() => {
              this.debugPanel.style.display = 'none';
            }, 300);
          }
          
          konamiIndex = 0; // Reset for next time
        }
      } else {
        konamiIndex = 0; // Reset if wrong key
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
  }
  
  addKonamiStyles() {
    // Add CSS for the pulse animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
        50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
  
  setupWebGL() {
    this.gl = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    if (!this.gl) {
      throw new Error('WebGL not supported');
    }
  }
  
  setupShaders() {
    const vertexShaderSource = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = (a_position + 1.0) * 0.5;
      }
    `;
    
    const fragmentShaderSource = `
      precision highp float;
      
      uniform sampler2D u_posterTexture;
      uniform sampler2D u_normalTexture;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_time;
      uniform float u_normalIntensity;
      uniform float u_specPower;
      uniform float u_rimPower;
      uniform float u_rimStrength;
      uniform float u_lightZ;
      uniform float u_lightRadius;
      uniform float u_saturation;
      uniform float u_contrast;
      uniform float u_exposure;
      uniform float u_reflectionStrength;
      uniform float u_hue;
      
      varying vec2 v_texCoord;
      
      // Unpack a tangent-space normal from [0,1] texture, scale XY and renormalize
      vec3 unpackNormal(vec3 enc, float intensity) {
        vec3 n = enc * 2.0 - 1.0;      // to [-1,1]
        n.xy *= intensity;             // optional exaggeration
        n = normalize(n);
        return n;
      }
      
      // simple ACES-ish tonemap
      vec3 tonemapACES(vec3 x) {
        const float a = 2.51; const float b = 0.03; const float c = 2.43; const float d = 0.59; const float e = 0.14;
        return clamp((x*(a*x+b))/(x*(c*x+d)+e), 0.0, 1.0);
      }
      
      // Hue shift function
      vec3 hueShift(vec3 color, float hue) {
        if (hue == 0.0) return color;
        
        float angle = hue * 3.14159265 / 180.0;
        float cosAngle = cos(angle);
        float sinAngle = sin(angle);
        
        // Convert RGB to YUV
        float y = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
        float u = -0.147 * color.r - 0.289 * color.g + 0.436 * color.b;
        float v = 0.615 * color.r - 0.515 * color.g - 0.100 * color.b;
        
        // Rotate UV plane
        float newU = u * cosAngle - v * sinAngle;
        float newV = u * sinAngle + v * cosAngle;
        
        // Convert back to RGB
        return vec3(
          y + 1.140 * newV,
          y - 0.394 * newU - 0.581 * newV,
          y + 2.032 * newU
        );
      }
      
      void main() {
        vec2 uv = v_texCoord;
        
        // Sample textures
        vec3 albedo = texture2D(u_posterTexture, uv).rgb;
        vec3 nTan = unpackNormal(texture2D(u_normalTexture, uv).rgb, u_normalIntensity);
        
        // Identity TBN for a screen-aligned quad: T=(1,0,0), B=(0,1,0), N=(0,0,1)
        vec3 N = nTan;
        
        // Cursor-driven point light
        vec2 m = u_mouse; // [0,1]
        vec3 Lpos = vec3((m.x - 0.5) * 2.0, (0.5 - m.y) * 2.0, u_lightZ);
        
        vec3 P = vec3(uv * 2.0 - 1.0, 0.0);  // view-space plane z=0
        vec3 Ldir = Lpos - P;
        float dist = length(Ldir);
        vec3 L = Ldir / max(dist, 1e-5);
        vec3 V = vec3(0.0, 0.0, 1.0);     // camera forward for this quad
        vec3 H = normalize(L + V);
        
        float NdotL = max(dot(N, L), 0.0);
        
        // distance attenuation (inverse-square-ish with softening)
        float atten = 1.0 / (1.0 + pow(dist / max(u_lightRadius, 1e-3), 2.0));
        
        // Soft shadowing/occlusion-ish term from normal's facing (cheap)
        float ao = mix(0.6, 1.0, N.z * 0.5 + 0.5);
        
        // Enhanced single light with stronger reflections
        vec3 diffuse = albedo * NdotL * atten;
        float spec = pow(max(dot(N, H), 0.0), u_specPower) * atten * u_reflectionStrength;
        float rim = pow(1.0 - max(dot(N, V), 0.0), u_rimPower) * u_rimStrength * atten * u_reflectionStrength;
        
        // Stronger ambient for base brightness
        vec3 ambient = albedo * 0.15;
        
        // Enhanced light colors for more dramatic effect
        vec3 lightColor = hueShift(vec3(1.2, 1.1, 1.0), u_hue);
        vec3 specColor = hueShift(vec3(1.5, 1.3, 1.0), u_hue);
        
        // Full color modification with hue shift
        vec3 color = ambient
                   + diffuse * lightColor
                   + spec * specColor
                   + rim * (0.5 + 0.8 * albedo) * u_reflectionStrength;
        
        // Apply exposure (exponential brightness)
        color = color * pow(2.0, u_exposure);
        
        // Apply contrast (proper contrast implementation)
        color = (color - 0.5) * u_contrast + 0.5;
        
        // Apply saturation
        float luminance = dot(color, vec3(0.299, 0.587, 0.114));
        color = mix(vec3(luminance), color, u_saturation);
        
        // Apply hue shift to the final result
        color = hueShift(color, u_hue);
        
        // Vignette & subtle filmic curve
        vec2 q = uv - 0.5;
        float vig = smoothstep(0.8, 0.1, dot(q, q));
        color *= mix(0.6, 1.0, vig) * ao;
        
        // Enhanced tonemap for more dramatic effect
        color = tonemapACES(color * 1.2);
        color = pow(color, vec3(1.0/2.2));
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;
    
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    if (!vertexShader || !fragmentShader) {
      throw new Error('Failed to create shaders');
    }
    
    this.program = this.createProgram(vertexShader, fragmentShader);
    if (!this.program) {
      throw new Error('Failed to create shader program');
    }
  }
  
  createShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  }
  
  createProgram(vertexShader, fragmentShader) {
    const program = this.gl.createProgram();
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Program linking error:', this.gl.getProgramInfoLog(program));
      this.gl.deleteProgram(program);
      return null;
    }
    
    return program;
  }
  
  setupBuffers() {
    // Full-screen triangle (more efficient than quad)
    const positions = new Float32Array([
      -1, -1,
       3, -1,
      -1,  3
    ]);
    
    this.positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
  }
  
  async setupTextures() {
    if (!this.posterImage) {
      throw new Error('Poster image is not defined');
    }
    
    if (!this.posterImage.complete) {
      throw new Error('Poster image is not loaded yet');
    }
    
    // Create poster texture
    this.posterTexture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.posterTexture);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    
    // Load poster image
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.posterImage);
    this.gl.generateMipmap(this.gl.TEXTURE_2D);
    
    // Create normal map texture
    this.normalTexture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.normalTexture);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    
    // Try to load the actual normal map if available
    if (this.normalMapImage && this.normalMapImage.naturalWidth > 0 && this.normalMapImage.naturalHeight > 0) {
      try {
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.normalMapImage);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
      } catch (error) {
        console.error('Failed to load normal map texture:', error);
        this.createFallbackNormalMap();
      }
    } else {
      this.createFallbackNormalMap();
    }
  }
  
  createFallbackNormalMap() {
    const size = 64;
    const data = new Uint8Array(size * size * 4);
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const index = (y * size + x) * 4;
        
        // Create a simple test pattern
        const normalizedX = x / size;
        const normalizedY = y / size;
        const checkerX = Math.floor(normalizedX * 8);
        const checkerY = Math.floor(normalizedY * 8);
        const isChecker = (checkerX + checkerY) % 2;
        
        if (isChecker) {
          data[index] = 128; // R
          data[index + 1] = 128; // G
          data[index + 2] = 255; // B
          data[index + 3] = 255; // A
        } else {
          data[index] = 255; // R
          data[index + 1] = 128; // G
          data[index + 2] = 128; // B
          data[index + 3] = 255; // A
        }
      }
    }
    
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, size, size, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, data);
    this.gl.generateMipmap(this.gl.TEXTURE_2D);
  }
  
  startRenderLoop() {
    const render = () => {
      if (this.isInitialized) {
        this.render();
        requestAnimationFrame(render);
      }
    };
    render();
  }
  
  setupEventListeners() {
    this.container.addEventListener('mouseenter', () => {
      this.canvas.style.opacity = '1';
    });
    
    this.container.addEventListener('mouseleave', () => {
      this.canvas.style.opacity = '0';
    });
    
    this.container.addEventListener('mousemove', (event) => {
      const rect = this.container.getBoundingClientRect();
      this.mouseX = (event.clientX - rect.left) / rect.width;
      this.mouseY = (event.clientY - rect.top) / rect.height;
      this.render();
    });
    
    this.container.addEventListener('touchmove', (event) => {
      if (event.touches && event.touches.length) {
        const rect = this.container.getBoundingClientRect();
        const t = event.touches[0];
        this.mouseX = (t.clientX - rect.left) / rect.width;
        this.mouseY = (t.clientY - rect.top) / rect.height;
        this.render();
      }
    }, {passive: true});
    
    window.addEventListener('resize', () => {
      const rect = this.container.getBoundingClientRect();
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    });
  }
  
  render() {
    if (!this.isInitialized) return;
    
    try {
      this.gl.useProgram(this.program);
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
      
      // Set up attributes
      const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
      
      // Position attribute
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
      this.gl.enableVertexAttribArray(positionLocation);
      this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
      
      // Set uniforms
      const posterTextureLocation = this.gl.getUniformLocation(this.program, 'u_posterTexture');
      const normalTextureLocation = this.gl.getUniformLocation(this.program, 'u_normalTexture');
      const resolutionLocation = this.gl.getUniformLocation(this.program, 'u_resolution');
      const mouseLocation = this.gl.getUniformLocation(this.program, 'u_mouse');
      const timeLocation = this.gl.getUniformLocation(this.program, 'u_time');
      const normalIntensityLocation = this.gl.getUniformLocation(this.program, 'u_normalIntensity');
      const specPowerLocation = this.gl.getUniformLocation(this.program, 'u_specPower');
      const rimPowerLocation = this.gl.getUniformLocation(this.program, 'u_rimPower');
      const rimStrengthLocation = this.gl.getUniformLocation(this.program, 'u_rimStrength');
      const lightZLocation = this.gl.getUniformLocation(this.program, 'u_lightZ');
      const lightRadiusLocation = this.gl.getUniformLocation(this.program, 'u_lightRadius');
      const saturationLocation = this.gl.getUniformLocation(this.program, 'u_saturation');
      const contrastLocation = this.gl.getUniformLocation(this.program, 'u_contrast');
      const exposureLocation = this.gl.getUniformLocation(this.program, 'u_exposure');
      const reflectionStrengthLocation = this.gl.getUniformLocation(this.program, 'u_reflectionStrength');
      const hueLocation = this.gl.getUniformLocation(this.program, 'u_hue');
      
      this.gl.uniform1i(posterTextureLocation, 0);
      this.gl.uniform1i(normalTextureLocation, 1);
      this.gl.uniform2f(resolutionLocation, this.canvas.width, this.canvas.height);
      this.gl.uniform2f(mouseLocation, this.mouseX, this.mouseY);
      this.gl.uniform1f(timeLocation, Date.now() * 0.001);
      this.gl.uniform1f(normalIntensityLocation, this.normalIntensity);
      this.gl.uniform1f(specPowerLocation, this.specPower);
      this.gl.uniform1f(rimPowerLocation, this.rimPower);
      this.gl.uniform1f(rimStrengthLocation, this.rimStrength);
      this.gl.uniform1f(lightZLocation, this.lightZ);
      this.gl.uniform1f(lightRadiusLocation, this.lightRadius);
      this.gl.uniform1f(saturationLocation, this.saturation);
      this.gl.uniform1f(contrastLocation, this.contrast);
      this.gl.uniform1f(exposureLocation, this.exposure);
      this.gl.uniform1f(reflectionStrengthLocation, this.reflectionStrength);
      this.gl.uniform1f(hueLocation, this.hue);
      
      // Bind textures
      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.posterTexture);
      
      this.gl.activeTexture(this.gl.TEXTURE1);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.normalTexture);
      
      // Draw full-screen triangle
      this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
    } catch (error) {
      console.error('Error in render:', error);
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const productImageMain = document.querySelector('.product-image-main');
  if (!productImageMain) return;
  
  const img = productImageMain.querySelector('img');
  if (!img) return;
  
  // Keep the original image visible as background
  img.style.position = 'absolute';
  img.style.top = '0';
  img.style.left = '0';
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.zIndex = '1';
  
  // Load custom normal map image
  const normalImg = new Image();
  normalImg.crossOrigin = 'anonymous';
  
  normalImg.onload = function() {
    createEffect();
  };
  
  normalImg.onerror = function() {
    img.style.display = 'block';
  };
  
  normalImg.src = window.normalMapUrl || 'Poster_NRML.png';
  
  function createEffect() {
    try {
      if (!img.complete || !normalImg.complete) {
        return;
      }
      
      window.normalMappingEffect = new NormalMappingEffect(productImageMain, img, normalImg);
    } catch (error) {
      console.error('Failed to create normal mapping effect:', error);
      img.style.display = 'block';
    }
  }
});