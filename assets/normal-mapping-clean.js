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
      uniform float u_time;
      
      varying vec2 v_texCoord;
      
      // Normal Mapping Shadow (NMS) based on Shadertoy
      #define iSampleCount 15
      #define SampleCount float(iSampleCount)
      #define HeightScale 1.5
      #define ShadowHardness 2.0
      #define ShadowLength 0.05
      
      void main() {
        vec2 uv = v_texCoord;
        
        // Sample the poster texture
        vec4 posterColor = texture2D(u_posterTexture, uv);
        
        // Sample the custom normal map (instead of generating from poster)
        vec3 normal = texture2D(u_normalTexture, uv).rgb * 2.0 - 1.0;
        normal = normalize(normal);
        
        // Lighting setup
        vec3 lightposition = vec3(0.0, 0.0, 0.1);
        vec3 planeposition = vec3(uv, 0.0);
        
        vec2 cursorposition = u_mouse;
        lightposition.xy = cursorposition;
        if (u_mouse.x <= 0.0 && u_mouse.y <= 0.0) {
          lightposition.x = (sin(u_time * 1.0) + 1.0) * 0.5;
          lightposition.y = (cos(u_time * 2.5) + 1.0) * 0.5;
        }
        
        float samplecount = SampleCount;
        float invsamplecount = 1.0 / samplecount;
        float hardness = HeightScale * ShadowHardness;
        
        vec3 lightdir = lightposition - planeposition;
        vec2 dir = lightdir.xy * HeightScale;
        lightdir = normalize(lightdir.xyz);
        
        // Lighting with flat normals
        float lighting = clamp(dot(lightdir, normal), 0.0, 1.0);
        
        float step = invsamplecount * ShadowLength;
        
        // Randomization
        vec2 noise = fract(uv * 100.0);
        noise.x = (noise.x * 0.5 + noise.y) * (1.0/1.5 - 0.25);
        float pos = step * noise.x;
        
        float slope = -lighting;
        float maxslope = 0.0;
        float shadow = 0.0;
        
        // Shadow sampling loop
        for (int i = 0; i < iSampleCount; i++) {
          vec3 tmpNormal = texture2D(u_normalTexture, uv + dir * pos).rgb * 2.0 - 1.0;
          tmpNormal = normalize(tmpNormal);
          
          float tmpLighting = dot(lightdir, tmpNormal);
          float shadowed = -tmpLighting;
          
          slope += shadowed;
          
          if (slope > maxslope) {
            shadow += hardness * (1.0 - pos);
          }
          maxslope = max(maxslope, slope);
          
          pos += step;
        }
        
        shadow = clamp(1.0 - shadow * invsamplecount, 0.0, 1.0);
        
        // Coloring
        vec3 ambientcolor = vec3(0.15, 0.4, 0.6) * 0.7;
        vec3 lightcolor = vec3(1.0, 0.7, 0.3) * 1.2;
        float ao = clamp(normal.z, 0.0, 1.0);
        
        vec3 result = shadow * lighting * lightcolor;
        result += ambientcolor;
        result *= (clamp(normal.z, 0.0, 1.0) * 0.5 + 0.5);
        
        // Apply to poster color
        result *= posterColor.rgb;
        
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
    
    // Convert and load custom normal map image
    const processedNormalMap = this.convertToNormalMap(this.normalMapImage);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, processedNormalMap);
    console.log('Custom normal map converted and loaded');
    console.log('Normal map dimensions:', this.normalMapImage.naturalWidth, 'x', this.normalMapImage.naturalHeight);
    console.log('Normal map src:', this.normalMapImage.src);
  }
  
  convertToNormalMap(normalMapImage) {
    console.log('Converting image to proper normal map format...');
    
    // Create a canvas to process the normal map
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match the normal map image
    canvas.width = normalMapImage.naturalWidth;
    canvas.height = normalMapImage.naturalHeight;
    
    // Draw the normal map image
    ctx.drawImage(normalMapImage, 0, 0);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Convert each pixel to proper normal map format
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];     // Red channel
      const g = data[i + 1]; // Green channel
      const b = data[i + 2]; // Blue channel
      const a = data[i + 3]; // Alpha channel
      
      // Convert from 0-255 range to -1 to 1 range for normal vectors
      // Normal maps typically store:
      // R = X component (left-right)
      // G = Y component (up-down) 
      // B = Z component (depth)
      
      // Convert to normal vector components
      const normalX = (r / 255.0) * 2.0 - 1.0; // -1 to 1
      const normalY = (g / 255.0) * 2.0 - 1.0; // -1 to 1
      const normalZ = (b / 255.0) * 2.0 - 1.0; // -1 to 1
      
      // Normalize the vector
      const length = Math.sqrt(normalX * normalX + normalY * normalY + normalZ * normalZ);
      if (length > 0) {
        const normalizedX = normalX / length;
        const normalizedY = normalY / length;
        const normalizedZ = normalZ / length;
        
        // Convert back to 0-255 range for texture storage
        data[i] = Math.round((normalizedX + 1.0) * 0.5 * 255);     // X component
        data[i + 1] = Math.round((normalizedY + 1.0) * 0.5 * 255); // Y component
        data[i + 2] = Math.round((normalizedZ + 1.0) * 0.5 * 255); // Z component
        data[i + 3] = 255; // Alpha
      } else {
        // Default normal pointing up if length is 0
        data[i] = 128;     // X = 0
        data[i + 1] = 128; // Y = 0
        data[i + 2] = 255; // Z = 1 (pointing up)
        data[i + 3] = 255; // Alpha
      }
    }
    
    // Put the processed data back
    ctx.putImageData(imageData, 0, 0);
    
    console.log('Normal map conversion completed');
    return canvas;
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
  
  console.log('Attempting to load custom normal map from:', window.normalMapUrl || 'Poster_Normal.png');
  normalImg.src = window.normalMapUrl || 'Poster_Normal.png';
  
  function createEffect() {
    try {
      console.log('Creating NormalMappingEffect...');
      console.log('Poster image loaded:', img.complete);
      console.log('Normal map image loaded:', normalImg.complete);
      window.normalMappingEffect = new NormalMappingEffect(productImageMain, img, normalImg);
      console.log('Normal mapping effect initialized successfully');
    } catch (error) {
      console.error('Failed to create normal mapping effect:', error);
      console.error('Error stack:', error.stack);
    }
  }
});
