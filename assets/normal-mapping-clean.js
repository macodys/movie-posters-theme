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
    this.debugMode = false; // Set to true to see normal map directly
    this.normalMapMode = 0; // 0=raw, 1=transformed, 2=flipped Y
    
    console.log('Creating NormalMappingEffect with container:', container);
    console.log('Poster image:', posterImage);
    console.log('Normal map image:', normalMapImage);
    
    this.init().catch(error => {
      console.error('Failed to initialize normal mapping effect:', error);
    });
  }
  
  async init() {
    try {
      console.log('Initializing normal mapping effect...');
      console.log('Container:', this.container);
      console.log('Poster image:', this.posterImage);
      console.log('Normal map image:', this.normalMapImage);
      
      this.createCanvas();
      console.log('Canvas created');
      
      this.setupWebGL();
      console.log('WebGL setup complete');
      
      this.setupShaders();
      console.log('Shaders setup complete');
      
      this.setupBuffers();
      console.log('Buffers setup complete');
      
      await this.setupTextures();
      console.log('Textures setup complete');
      
      this.setupEventListeners();
      console.log('Event listeners setup complete');
      
      this.isInitialized = true;
      console.log('Normal mapping effect initialized successfully');
      
      // Start rendering loop
      this.startRenderLoop();
    } catch (error) {
      console.error('Failed to initialize normal mapping effect:', error);
      console.error('Error stack:', error.stack);
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
        
        // Transform normal from [0,1] to [-1,1] range (LearnOpenGL technique)
        normal = normalize(normal * 2.0 - 1.0);
        
        // Try different Y-axis orientations - test without flipping first
        // normal.y = -normal.y;
        
        // Calculate cursor position in UV space
        vec2 cursorUV = u_mouse / u_resolution;
        
        // Fallback light position when mouse is not over the element
        vec3 lightPos = vec3(cursorUV, 0.2);
        if (u_mouse.x <= 0.0 && u_mouse.y <= 0.0) {
          // Default light position (center-right)
          lightPos = vec3(0.7, 0.3, 0.2);
        }
        
        vec3 fragPos = vec3(uv, 0.0);
        vec3 lightDir = normalize(lightPos - fragPos);
        
        // View direction (camera looking down at the surface)
        vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0) - fragPos);
        
        // Calculate distance for attenuation
        float distance = length(lightPos - fragPos);
        float attenuation = 1.0 / (1.0 + 0.05 * distance + 0.005 * distance * distance);
        
        // Enhanced diffuse lighting for better depth perception
        float diff = max(dot(normal, lightDir), 0.0);
        // Make the diffuse lighting much more pronounced
        diff = pow(diff, 0.5); // More dramatic falloff
        vec3 diffuse = diff * vec3(2.0, 1.8, 1.5) * attenuation * 3.0; // Much brighter, warmer light
        
        // Enhanced specular lighting for better highlights
        vec3 halfDir = normalize(lightDir + viewDir);
        float spec = pow(max(dot(normal, halfDir), 0.0), 16.0); // Softer specular
        vec3 specular = spec * vec3(1.0, 0.9, 0.8) * 0.8 * attenuation;
        
        // Very low ambient to make lighting extremely dramatic
        vec3 ambient = vec3(0.02, 0.02, 0.03);
        
        // Add rim lighting for better depth perception
        float rim = 1.0 - max(dot(normal, viewDir), 0.0);
        rim = pow(rim, 2.0);
        vec3 rimLight = rim * vec3(0.3, 0.4, 0.6) * 0.5;
        
        // Combine lighting
        vec3 lighting = ambient + diffuse + specular + rimLight;
        
        // Apply lighting to poster color
        vec3 result = posterColor.rgb * lighting;
        
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
  

  async setupTextures() {
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
    
    // Always create fallback normal map for now to test
    console.log('Creating fallback normal map for testing...');
    console.log('Normal texture before fallback:', this.normalTexture);
    this.createFallbackNormalMap();
    console.log('Normal texture after fallback:', this.normalTexture);
    
    // Test the actual normal map loading with debugging
    if (this.normalMapImage && this.normalMapImage.naturalWidth > 0 && this.normalMapImage.naturalHeight > 0) {
      console.log('Loading actual normal map image:', this.normalMapImage.src);
      console.log('Normal map dimensions:', this.normalMapImage.naturalWidth, 'x', this.normalMapImage.naturalHeight);
      console.log('Normal map complete:', this.normalMapImage.complete);
      
      try {
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.normalMapImage);
        console.log('Actual normal map texture loaded successfully');
        
        // Test if the texture actually has data
        const testCanvas = document.createElement('canvas');
        const testCtx = testCanvas.getContext('2d');
        testCanvas.width = 1;
        testCanvas.height = 1;
        testCtx.drawImage(this.normalMapImage, 0, 0, 1, 1);
        const testData = testCtx.getImageData(0, 0, 1, 1).data;
        console.log('Normal map pixel sample:', testData);
        
        if (testData[0] === 0 && testData[1] === 0 && testData[2] === 0) {
          console.warn('Normal map appears to be black, keeping fallback');
          // Re-upload the fallback
          this.createFallbackNormalMap();
        } else {
          console.log('Normal map has data, using actual normal map');
        }
      } catch (error) {
        console.error('Failed to load actual normal map texture:', error);
        console.log('Using fallback normal map instead');
        this.createFallbackNormalMap();
      }
    } else {
      console.log('No actual normal map image available, using fallback');
    }
  }
  
  createFallbackNormalMap() {
    console.log('Creating fallback normal map...');
    
    // First test with a simple 1x1 texture
    console.log('Testing with 1x1 texture first...');
    const testData = new Uint8Array([255, 0, 0, 255]); // Red pixel
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, testData);
    console.log('1x1 test texture uploaded');
    
    // Now create the full fallback normal map
    console.log('Creating full fallback normal map...');
    const size = 64;
    const data = new Uint8Array(size * size * 4);
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const index = (y * size + x) * 4;
        
        // Create a simple bump pattern
        const centerX = size / 2;
        const centerY = size / 2;
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const normalizedDistance = distance / (size / 2);
        
        // Create a simple test pattern that's easy to see
        const normalizedX = x / size;
        const normalizedY = y / size;
        
        // Create a checkerboard pattern with different colors
        const checkerX = Math.floor(normalizedX * 8);
        const checkerY = Math.floor(normalizedY * 8);
        const isChecker = (checkerX + checkerY) % 2;
        
        if (isChecker) {
          // Blue areas (pointing up)
          data[index] = 128; // R = 0.5
          data[index + 1] = 128; // G = 0.5
          data[index + 2] = 255; // B = 1.0
          data[index + 3] = 255; // A = 1.0
        } else {
          // Red areas (pointing right)
          data[index] = 255; // R = 1.0
          data[index + 1] = 128; // G = 0.5
          data[index + 2] = 128; // B = 0.5
          data[index + 3] = 255; // A = 1.0
        }
      }
    }
    
    console.log('Fallback data sample:', data.slice(0, 16)); // Show first 16 bytes
    console.log('Data length:', data.length);
    console.log('Expected length:', size * size * 4);
    
    try {
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, size, size, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, data);
      console.log('Fallback normal map uploaded to GPU successfully');
      
      // Verify the texture was uploaded
      const error = this.gl.getError();
      if (error !== this.gl.NO_ERROR) {
        console.error('OpenGL error after uploading fallback normal map:', error);
      } else {
        console.log('No OpenGL errors after uploading fallback normal map');
      }
    } catch (error) {
      console.error('Failed to upload fallback normal map to GPU:', error);
    }
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
      // Convert to screen coordinates for proper lighting
      this.mouseX = this.mouseX * this.canvas.width;
      this.mouseY = this.mouseY * this.canvas.height;
      this.render();
    });
    
    // Add click handler to toggle debug mode
    this.container.addEventListener('click', (event) => {
      this.toggleDebugMode();
      this.render();
    });
    
    // Add keyboard handler for normal map mode cycling
    document.addEventListener('keydown', (event) => {
      if (this.debugMode) {
        if (event.key >= '1' && event.key <= '8') {
          this.normalMapMode = parseInt(event.key) - 1;
          console.log('Normal map mode set to:', this.normalMapMode);
          this.render();
        } else if (event.key === ' ') {
          this.cycleNormalMapMode();
          this.render();
        }
      }
    });
    
    window.addEventListener('resize', () => {
      const rect = this.container.getBoundingClientRect();
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    });
    
    console.log('Event listeners set up');
  }
  
  toggleDebugMode() {
    this.debugMode = !this.debugMode;
    console.log('Debug mode:', this.debugMode ? 'ON' : 'OFF');
    if (this.debugMode) {
      console.log('Normal map visualization enabled - you should see colored normal vectors');
      console.log('Press 1, 2, or 3 to cycle through different normal map views:');
      console.log('1 = Raw normal map colors');
      console.log('2 = Transformed normal vectors');
      console.log('3 = Flipped Y normal vectors');
      console.log('Current mode:', this.normalMapMode);
    } else {
      console.log('Normal mapping effect enabled - move your mouse to see lighting');
    }
  }
  
  cycleNormalMapMode() {
    this.normalMapMode = (this.normalMapMode + 1) % 8;
    console.log('Normal map mode:', this.normalMapMode);
    if (this.normalMapMode === 0) {
      console.log('Mode 0: Raw normal map colors');
    } else if (this.normalMapMode === 1) {
      console.log('Mode 1: Transformed normal vectors');
    } else if (this.normalMapMode === 2) {
      console.log('Mode 2: Flipped Y normal vectors');
    } else if (this.normalMapMode === 3) {
      console.log('Mode 3: UV coordinates (should show gradient)');
    } else if (this.normalMapMode === 4) {
      console.log('Mode 4: Test pattern (should show blue)');
    } else if (this.normalMapMode === 5) {
      console.log('Mode 5: Poster texture (should show poster image)');
    } else if (this.normalMapMode === 6) {
      console.log('Mode 6: Normal map test (red=black, green=data)');
    } else if (this.normalMapMode === 7) {
      console.log('Mode 7: Direct normal map texture (no processing)');
    }
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
      
      // Debug: Check if normal texture is actually bound
      const currentTexture = this.gl.getParameter(this.gl.TEXTURE_BINDING_2D);
      console.log('Normal texture bound:', currentTexture === this.normalTexture);
      console.log('Normal texture ID:', this.normalTexture);
      console.log('Current bound texture ID:', currentTexture);
      
      
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
  
  // Load custom normal map image
  console.log('Loading custom normal map image...');
  const normalImg = new Image();
  normalImg.crossOrigin = 'anonymous';
  
  normalImg.onload = function() {
    console.log('Custom normal map loaded successfully!');
    console.log('Normal map dimensions:', normalImg.naturalWidth, 'x', normalImg.naturalHeight);
    console.log('Normal map src:', normalImg.src);
    createEffect();
  };
  
  normalImg.onerror = function() {
    console.error('Failed to load custom normal map image');
    console.error('Tried to load:', normalImg.src);
    // Show original image if normal map fails to load
    img.style.display = 'block';
  };
  
  console.log('Attempting to load custom normal map from:', window.normalMapUrl || 'Poster_NRML.png');
  normalImg.src = window.normalMapUrl || 'Poster_NRML.png';
  
  function createEffect() {
    try {
      console.log('Creating NormalMappingEffect...');
      console.log('Poster image loaded:', img.complete);
      console.log('Normal map image loaded:', normalImg.complete);
      console.log('Poster image src:', img.src);
      console.log('Normal map image src:', normalImg.src);
      
      // Check if images are actually loaded
      if (!img.complete || !normalImg.complete) {
        console.error('Images not fully loaded yet');
        return;
      }
      
      window.normalMappingEffect = new NormalMappingEffect(productImageMain, img, normalImg);
      console.log('Normal mapping effect initialized successfully');
    } catch (error) {
      console.error('Failed to create normal mapping effect:', error);
      console.error('Error stack:', error.stack);
      
      // Show the original image as fallback
      img.style.display = 'block';
    }
  }
});
