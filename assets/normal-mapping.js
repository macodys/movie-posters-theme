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
    
    this.init();
  }
  
  init() {
    try {
      this.createCanvas();
      if (this.setupWebGL()) {
        this.createShaders();
        this.setupBuffers();
        this.setupTextures();
        this.setupEventListeners();
        this.render();
        this.isInitialized = true;
        console.log('Normal mapping effect initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize normal mapping effect:', error);
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
    
    this.container.style.position = 'relative';
    this.container.appendChild(this.canvas);
  }
  
  setupWebGL() {
    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    if (!this.gl) {
      console.error('WebGL not supported');
      return false;
    }
    
    // Set canvas size
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    
    // Enable blending
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    
    return true;
  }
  
  createShaders() {
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
        
        // Calculate light direction from mouse position
        vec2 lightPos = u_mouse;
        vec2 lightDir = lightPos - uv;
        float lightDist = length(lightDir);
        lightDir = normalize(lightDir);
        
        // Convert 2D light direction to 3D
        vec3 light3D = normalize(vec3(lightDir, 0.3));
        
        // Calculate diffuse lighting
        float diffuse = max(dot(normal, light3D), 0.0);
        
        // Add some ambient lighting
        float ambient = 0.3;
        
        // Calculate final lighting
        float lighting = ambient + diffuse * 0.7;
        
        // Apply lighting to poster color
        vec3 finalColor = posterColor.rgb * lighting;
        
        // Add some rim lighting for depth
        float rim = 1.0 - max(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0);
        rim = pow(rim, 2.0);
        finalColor += rim * 0.2;
        
        gl_FragColor = vec4(finalColor, posterColor.a);
      }
    `;
    
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    this.program = this.createProgram(vertexShader, fragmentShader);
    this.gl.useProgram(this.program);
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
    // Create poster texture
    this.posterTexture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.posterTexture);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    
    // Load poster image
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.posterImage);
    
    // Create normal map texture
    this.normalTexture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.normalTexture);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    
    // Load normal map image
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.normalMapImage);
  }
  
  setupEventListeners() {
    this.container.addEventListener('mousemove', (e) => {
      const rect = this.container.getBoundingClientRect();
      this.mouseX = (e.clientX - rect.left) / rect.width;
      this.mouseY = (e.clientY - rect.top) / rect.height;
      this.render();
    });
    
    this.container.addEventListener('mouseleave', () => {
      this.mouseX = 0.5;
      this.mouseY = 0.5;
      this.render();
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
  
  // Load normal map image
  const normalImg = new Image();
  normalImg.crossOrigin = 'anonymous';
  
  normalImg.onload = function() {
    console.log('Normal map loaded, initializing effect...');
    
    // Hide the original image
    img.style.display = 'none';
    
    // Create the normal mapping effect
    try {
      window.normalMappingEffect = new NormalMappingEffect(productImageMain, img, normalImg);
    } catch (error) {
      console.error('Failed to create normal mapping effect:', error);
      // Show original image if effect fails
      img.style.display = 'block';
    }
  };
  
  normalImg.onerror = function() {
    console.error('Failed to load normal map image');
    // Show original image if normal map fails to load
    img.style.display = 'block';
  };
  
  normalImg.src = 'poster-normal.png';
});
