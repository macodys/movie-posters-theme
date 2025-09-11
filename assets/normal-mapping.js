// Normal Mapping Effect using WebGL
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
    
    console.log('Creating NormalMappingEffect with container:', container);
    console.log('Poster image:', posterImage);
    console.log('Normal map image:', normalMapImage);
    
    this.init();
  }
  
  init() {
    try {
      console.log('Initializing normal mapping effect...');
      this.createCanvas();
      if (this.setupWebGL()) {
        this.createShaders();
        this.setupBuffers();
        this.setupTextures();
        this.setupEventListeners();
        this.render();
        this.isInitialized = true;
        console.log('Normal mapping effect initialized successfully');
      } else {
        console.error('WebGL setup failed');
      }
    } catch (error) {
      console.error('Failed to initialize normal mapping effect:', error);
    }
  }
  
  createCanvas() {
    console.log('Creating canvas...');
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '3';
    this.canvas.style.opacity = '0';
    this.canvas.style.transition = 'opacity 0.3s ease';
    
    this.container.style.position = 'relative';
    this.container.appendChild(this.canvas);
    console.log('Canvas created and appended to container');
  }
  
  setupWebGL() {
    console.log('Setting up WebGL...');
    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    if (!this.gl) {
      console.error('WebGL not supported');
      return false;
    }
    
    console.log('WebGL context created successfully');
    
    // Set canvas size
    const rect = this.container.getBoundingClientRect();
    console.log('Container rect:', rect);
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    
    console.log('Canvas size set to:', this.canvas.width, 'x', this.canvas.height);
    
    // Enable blending
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    
    return true;
  }
  
  createShaders() {
    console.log('Creating shaders...');
    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      
      varying vec2 v_texCoord;
      
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `;
    
    const fragmentShaderSource = `
      precision mediump float;
      
      uniform sampler2D u_posterTexture;
      uniform sampler2D u_normalTexture;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_time;
      
      varying vec2 v_texCoord;
      
      void main() {
        vec2 uv = v_texCoord;
        
        // Sample the poster texture
        vec4 posterColor = texture2D(u_posterTexture, uv);
        
        // Sample the normal map
        vec3 normal = texture2D(u_normalTexture, uv).rgb * 2.0 - 1.0;
        
        // Calculate distance from mouse position
        vec2 lightPos = u_mouse;
        float lightDist = distance(uv, lightPos);
        
        // Create a soft radial light around the mouse
        float lightIntensity = 1.0 - smoothstep(0.0, 0.6, lightDist);
        lightIntensity = pow(lightIntensity, 1.2);
        
        // Create a true radial light - illuminate from all directions
        // Use multiple light directions to eliminate shadows
        vec3 light1 = normalize(vec3(1.0, 0.0, 0.1));
        vec3 light2 = normalize(vec3(-1.0, 0.0, 0.1));
        vec3 light3 = normalize(vec3(0.0, 1.0, 0.1));
        vec3 light4 = normalize(vec3(0.0, -1.0, 0.1));
        vec3 light5 = normalize(vec3(0.7, 0.7, 0.1));
        vec3 light6 = normalize(vec3(-0.7, 0.7, 0.1));
        vec3 light7 = normalize(vec3(0.7, -0.7, 0.1));
        vec3 light8 = normalize(vec3(-0.7, -0.7, 0.1));
        
        // Calculate diffuse lighting from all directions
        float diffuse1 = max(dot(normal, light1), 0.0);
        float diffuse2 = max(dot(normal, light2), 0.0);
        float diffuse3 = max(dot(normal, light3), 0.0);
        float diffuse4 = max(dot(normal, light4), 0.0);
        float diffuse5 = max(dot(normal, light5), 0.0);
        float diffuse6 = max(dot(normal, light6), 0.0);
        float diffuse7 = max(dot(normal, light7), 0.0);
        float diffuse8 = max(dot(normal, light8), 0.0);
        
        // Average all diffuse values for even lighting
        float diffuse = (diffuse1 + diffuse2 + diffuse3 + diffuse4 + 
                        diffuse5 + diffuse6 + diffuse7 + diffuse8) / 8.0;
        
        // Add ambient lighting
        float ambient = 0.4;
        
        // Calculate final lighting with radial intensity and stronger shadows
        float lighting = ambient + (diffuse * lightIntensity * 0.8);
        
        // Apply lighting to poster color
        vec3 finalColor = posterColor.rgb * lighting;
        
        // Add much stronger rim lighting for depth and shadows
        float rim = 1.0 - max(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0);
        rim = pow(rim, 1.2);
        finalColor += rim * 0.6 * lightIntensity;
        
        // Add strong shadow effect based on normal map
        float shadow = 1.0 - (length(normal) * 0.5 + 0.5);
        shadow = pow(shadow, 2.0);
        finalColor *= (1.0 - shadow * 0.4 * lightIntensity);
        
        // Add a soft glow around the mouse area
        float glow = 1.0 - smoothstep(0.0, 0.5, lightDist);
        glow = pow(glow, 2.0);
        finalColor += glow * 0.2;
        
        gl_FragColor = vec4(finalColor, posterColor.a);
      }
    `;
    
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    if (!vertexShader || !fragmentShader) {
      console.error('Failed to create shaders');
      return;
    }
    
    this.program = this.createProgram(vertexShader, fragmentShader);
    if (!this.program) {
      console.error('Failed to create program');
      return;
    }
    
    this.gl.useProgram(this.program);
    console.log('Shaders created and program linked successfully');
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
    // Create a full-screen quad
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ]);
    
    const texCoords = new Float32Array([
      0, 1,
      1, 1,
      0, 0,
      1, 0,
    ]);
    
    // Position buffer
    this.positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
    
    // Texture coordinate buffer
    this.texCoordBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, texCoords, this.gl.STATIC_DRAW);
  }
  
  setupTextures() {
    console.log('Setting up textures...');
    console.log('Poster image dimensions:', this.posterImage.width, 'x', this.posterImage.height);
    console.log('Normal map image dimensions:', this.normalMapImage.width, 'x', this.normalMapImage.height);
    
    // Create poster texture
    this.posterTexture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.posterTexture);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    
    // Load poster image
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.posterImage);
    console.log('Poster texture loaded');
    
    // Create normal map texture
    this.normalTexture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.normalTexture);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    
    // Load normal map image
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.normalMapImage);
    console.log('Normal map texture loaded');
  }
  
  setupEventListeners() {
    this.container.addEventListener('mouseenter', () => {
      console.log('Mouse entered - enabling effect');
      this.canvas.style.opacity = '1';
    });
    
    this.container.addEventListener('mousemove', (e) => {
      const rect = this.container.getBoundingClientRect();
      this.mouseX = (e.clientX - rect.left) / rect.width;
      this.mouseY = (e.clientY - rect.top) / rect.height;
      this.render();
    });
    
    this.container.addEventListener('mouseleave', () => {
      console.log('Mouse left - disabling effect');
      this.mouseX = 0.5;
      this.mouseY = 0.5;
      this.canvas.style.opacity = '0';
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
      const rect = this.container.getBoundingClientRect();
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      this.render();
    });
  }
  
  render() {
    if (!this.gl || !this.program || !this.isInitialized) {
      console.log('WebGL not ready for rendering');
      return;
    }
    
    try {
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
      this.gl.useProgram(this.program);
    } catch (error) {
      console.error('Error in render setup:', error);
      return;
    }
    
    // Set up attributes
    const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
    const texCoordLocation = this.gl.getAttribLocation(this.program, 'a_texCoord');
    
    // Position attribute
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
    
    // Texture coordinate attribute
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.enableVertexAttribArray(texCoordLocation);
    this.gl.vertexAttribPointer(texCoordLocation, 2, this.gl.FLOAT, false, 0, 0);
    
    // Set uniforms
    const posterTextureLocation = this.gl.getUniformLocation(this.program, 'u_posterTexture');
    const normalTextureLocation = this.gl.getUniformLocation(this.program, 'u_normalTexture');
    const resolutionLocation = this.gl.getUniformLocation(this.program, 'u_resolution');
    const mouseLocation = this.gl.getUniformLocation(this.program, 'u_mouse');
    const timeLocation = this.gl.getUniformLocation(this.program, 'u_time');
    
    this.gl.uniform1i(posterTextureLocation, 0);
    this.gl.uniform1i(normalTextureLocation, 1);
    this.gl.uniform2f(resolutionLocation, this.canvas.width, this.canvas.height);
    this.gl.uniform2f(mouseLocation, this.mouseX, this.mouseY);
    this.gl.uniform1f(timeLocation, Date.now() * 0.001);
    
    // Bind textures
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.posterTexture);
    this.gl.activeTexture(this.gl.TEXTURE1);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.normalTexture);
    
    // Draw
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }
  
  destroy() {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

// Initialize normal mapping effect when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, looking for product image...');
  
  const productImageMain = document.querySelector('.product-image-main');
  if (!productImageMain) {
    console.log('Product image container not found');
    return;
  }
  
  const img = productImageMain.querySelector('img');
  if (!img) {
    console.log('Product image not found');
    return;
  }
  
  console.log('Found product image, loading normal map...');
  console.log('Normal map URL:', window.normalMapUrl || 'poster-normal.png');
  
  // Load normal map image
  const normalImg = new Image();
  normalImg.crossOrigin = 'anonymous';
  
  normalImg.onload = function() {
    console.log('Normal map loaded, initializing effect...');
    
    // Keep the original image visible as background
    img.style.position = 'absolute';
    img.style.top = '0';
    img.style.left = '0';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.zIndex = '1';
    
    // Create the normal mapping effect
    try {
      window.normalMappingEffect = new NormalMappingEffect(productImageMain, img, normalImg);
    } catch (error) {
      console.error('Failed to create normal mapping effect:', error);
    }
  };
  
  normalImg.onerror = function() {
    console.error('Failed to load normal map image');
    // Show original image if normal map fails to load
    img.style.display = 'block';
  };
  
  normalImg.src = window.normalMapUrl || 'poster-normal.png';
});
