// Clean Normal Mapping Effect using WebGL
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
      this.setupWebGL();
      this.setupShaders();
      this.setupBuffers();
      this.setupTextures();
      this.setupEventListeners();
      this.render();
      this.isInitialized = true;
      console.log('Normal mapping effect initialized successfully');
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
    
    console.log('Canvas created with size:', this.canvas.width, 'x', this.canvas.height);
  }
  
  setupWebGL() {
    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    if (!this.gl) {
      throw new Error('WebGL not supported');
    }
    console.log('WebGL context created');
  }
  
  setupShaders() {
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
      
      varying vec2 v_texCoord;
      
      void main() {
        vec2 uv = v_texCoord;
        
        // Sample the poster texture
        vec4 posterColor = texture2D(u_posterTexture, uv);
        
        // Sample the normal map with tiling
        vec2 normalUV = uv * 2.0; // Tile the normal map 2x2 times
        vec3 normal = texture2D(u_normalTexture, normalUV).rgb * 2.0 - 1.0;
        normal = normalize(normal);
        
        // Lighting setup
        float lightHeight = 0.2;
        float viewHeight = 2.0;
        
        vec3 surfacePos = vec3(uv, 0.0);
        vec3 viewPos = vec3(0.5, 0.5, viewHeight);
        vec3 lightPos = vec3(u_mouse, lightHeight);
        
        vec3 viewDir = normalize(viewPos - surfacePos);
        vec3 lightDir = normalize(lightPos - surfacePos);
        
        // Calculate lighting
        float NdotL = max(dot(normal, lightDir), 0.0);
        float diffuse = NdotL;
        
        vec3 halfDir = normalize(viewDir + lightDir);
        float NdotH = max(dot(normal, halfDir), 0.0);
        float specular = pow(NdotH, 32.0) * NdotL * 0.5;
        
        // Add ambient lighting
        float ambient = 0.3;
        
        // Apply lighting to poster color
        vec3 result = posterColor.rgb * (diffuse + ambient) + specular;
        
        gl_FragColor = vec4(result, posterColor.a);
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
    
    console.log('Shaders created successfully');
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
    // Position buffer (full screen quad)
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1
    ]);
    
    this.positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
    
    // Texture coordinate buffer
    const texCoords = new Float32Array([
      0, 1,
      1, 1,
      0, 0,
      1, 0
    ]);
    
    this.texCoordBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, texCoords, this.gl.STATIC_DRAW);
    
    console.log('Buffers created successfully');
  }
  
  setupTextures() {
    console.log('Setting up textures...');
    console.log('Poster image:', this.posterImage);
    
    if (!this.posterImage) {
      throw new Error('Poster image is not defined');
    }
    
    if (!this.posterImage.complete) {
      throw new Error('Poster image is not loaded yet');
    }
    
    console.log('Poster image loaded:', this.posterImage.complete);
    console.log('Poster image dimensions:', this.posterImage.naturalWidth, 'x', this.posterImage.naturalHeight);
    
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
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
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
    
    this.container.addEventListener('mouseleave', () => {
      console.log('Mouse left - disabling effect');
      this.canvas.style.opacity = '0';
    });
    
    this.container.addEventListener('mousemove', (event) => {
      const rect = this.container.getBoundingClientRect();
      this.mouseX = (event.clientX - rect.left) / rect.width;
      this.mouseY = (event.clientY - rect.top) / rect.height;
      this.render();
    });
    
    window.addEventListener('resize', () => {
      const rect = this.container.getBoundingClientRect();
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    });
    
    console.log('Event listeners set up');
  }
  
  render() {
    if (!this.isInitialized) return;
    
    try {
      this.gl.useProgram(this.program);
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
      
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
      
      this.gl.uniform1i(posterTextureLocation, 0);
      this.gl.uniform1i(normalTextureLocation, 1);
      this.gl.uniform2f(resolutionLocation, this.canvas.width, this.canvas.height);
      this.gl.uniform2f(mouseLocation, this.mouseX, this.mouseY);
      
      // Bind textures
      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.posterTexture);
      
      this.gl.activeTexture(this.gl.TEXTURE1);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.normalTexture);
      
      // Draw
      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    } catch (error) {
      console.error('Error in render:', error);
    }
  }
}

// Initialize when DOM is loaded
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
  
  console.log('Found product image, initializing clean normal mapping effect...');
  console.log('Image src:', img.src);
  console.log('Image loaded:', img.complete);
  console.log('Image dimensions:', img.naturalWidth, 'x', img.naturalHeight);
  
  // Keep the original image visible as background
  img.style.position = 'absolute';
  img.style.top = '0';
  img.style.left = '0';
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.zIndex = '1';
  
  // Load normal map image
  console.log('Loading normal map image...');
  const normalImg = new Image();
  normalImg.crossOrigin = 'anonymous';
  
  normalImg.onload = function() {
    console.log('Normal map loaded, creating effect...');
    createEffect();
  };
  
  normalImg.onerror = function() {
    console.error('Failed to load normal map image');
    // Show original image if normal map fails to load
    img.style.display = 'block';
  };
  
  normalImg.src = window.normalMapUrl || 'paper-normal.jpg';
  
  function createEffect() {
    // Create the normal mapping effect with custom normal map
    try {
      console.log('Creating NormalMappingEffect...');
      window.normalMappingEffect = new NormalMappingEffect(productImageMain, img, normalImg);
      console.log('Normal mapping effect initialized successfully');
    } catch (error) {
      console.error('Failed to create normal mapping effect:', error);
      console.error('Error stack:', error.stack);
    }
  }
});
