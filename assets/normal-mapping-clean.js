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
    this.debugMode = false;
    this.normalMapMode = 0;
    
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
  }
  
  setupWebGL() {
    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    if (!this.gl) {
      throw new Error('WebGL not supported');
    }
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
      uniform float u_time;
      uniform bool u_debugMode;
      uniform int u_normalMapMode;
      
      varying vec2 v_texCoord;
      
      void main() {
        vec2 uv = v_texCoord;
        
        // Sample the poster texture (diffuse map)
        vec4 posterColor = texture2D(u_posterTexture, uv);
        
        // Sample the normal map
        vec3 normal = texture2D(u_normalTexture, uv).rgb;
        
        // Debug mode: Show different normal map interpretations
        if (u_debugMode) {
          if (u_normalMapMode == 0) {
            // Show raw normal map colors (should be blue-ish for a normal map)
            gl_FragColor = vec4(normal, 1.0);
          } else if (u_normalMapMode == 1) {
            // Show transformed normal map
            vec3 transformed = normalize(normal * 2.0 - 1.0);
            gl_FragColor = vec4(transformed * 0.5 + 0.5, 1.0);
          } else if (u_normalMapMode == 2) {
            // Show flipped Y normal map
            vec3 transformed = normalize(normal * 2.0 - 1.0);
            transformed.y = -transformed.y;
            gl_FragColor = vec4(transformed * 0.5 + 0.5, 1.0);
          } else if (u_normalMapMode == 3) {
            // Show UV coordinates to test if texture is working
            gl_FragColor = vec4(uv, 0.0, 1.0);
          } else if (u_normalMapMode == 4) {
            // Show a test pattern
            gl_FragColor = vec4(0.5, 0.5, 1.0, 1.0);
          } else if (u_normalMapMode == 5) {
            // Test if we can sample the poster texture instead
            vec4 posterColor = texture2D(u_posterTexture, uv);
            gl_FragColor = vec4(posterColor.rgb, 1.0);
          } else if (u_normalMapMode == 6) {
            // Test if normal map texture is completely black
            if (normal.r == 0.0 && normal.g == 0.0 && normal.b == 0.0) {
              gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Red if completely black
            } else {
              gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0); // Green if has data
            }
          } else if (u_normalMapMode == 7) {
            // Show the normal map texture directly without any processing
            gl_FragColor = vec4(normal, 1.0);
          }
          return;
        }
        
        // Show the poster image without any effects
        gl_FragColor = posterColor;
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
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    
    // Load poster image
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.posterImage);
    
    // Create normal map texture
    this.normalTexture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.normalTexture);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    
    // Create fallback normal map
    this.createFallbackNormalMap();
    
    // Try to load the actual normal map if available
    if (this.normalMapImage && this.normalMapImage.naturalWidth > 0 && this.normalMapImage.naturalHeight > 0) {
      try {
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.normalMapImage);
      } catch (error) {
        console.error('Failed to load normal map texture:', error);
      }
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
      this.mouseX = this.mouseX * this.canvas.width;
      this.mouseY = this.mouseY * this.canvas.height;
      this.render();
    });
    
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
      const debugLocation = this.gl.getUniformLocation(this.program, 'u_debugMode');
      const normalMapModeLocation = this.gl.getUniformLocation(this.program, 'u_normalMapMode');
      
      this.gl.uniform1i(posterTextureLocation, 0);
      this.gl.uniform1i(normalTextureLocation, 1);
      this.gl.uniform2f(resolutionLocation, this.canvas.width, this.canvas.height);
      this.gl.uniform2f(mouseLocation, this.mouseX, this.mouseY);
      this.gl.uniform1f(timeLocation, Date.now() * 0.001);
      this.gl.uniform1i(debugLocation, this.debugMode ? 1 : 0);
      this.gl.uniform1i(normalMapModeLocation, this.normalMapMode);
      
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
