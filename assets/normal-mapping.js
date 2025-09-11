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
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_time;
      
      varying vec2 v_texCoord;
      
      // Using a sobel filter to create a normal map and then applying simple lighting.
      #define USE_LINEAR_FOR_BUMPMAP
      
      struct C_Sample
      {
        vec3 vAlbedo;
        vec3 vNormal;
      };
      
      C_Sample SampleMaterial(const in vec2 vUV, sampler2D sampler, const in vec2 vTextureSize, const in float fNormalScale)
      {
        C_Sample result;
        
        vec2 vInvTextureSize = vec2(1.0) / vTextureSize;
        
        vec3 cSampleNegXNegY = texture2D(sampler, vUV + (vec2(-1.0, -1.0)) * vInvTextureSize.xy).rgb;
        vec3 cSampleZerXNegY = texture2D(sampler, vUV + (vec2( 0.0, -1.0)) * vInvTextureSize.xy).rgb;
        vec3 cSamplePosXNegY = texture2D(sampler, vUV + (vec2( 1.0, -1.0)) * vInvTextureSize.xy).rgb;
        
        vec3 cSampleNegXZerY = texture2D(sampler, vUV + (vec2(-1.0, 0.0)) * vInvTextureSize.xy).rgb;
        vec3 cSampleZerXZerY = texture2D(sampler, vUV + (vec2( 0.0, 0.0)) * vInvTextureSize.xy).rgb;
        vec3 cSamplePosXZerY = texture2D(sampler, vUV + (vec2( 1.0, 0.0)) * vInvTextureSize.xy).rgb;
        
        vec3 cSampleNegXPosY = texture2D(sampler, vUV + (vec2(-1.0,  1.0)) * vInvTextureSize.xy).rgb;
        vec3 cSampleZerXPosY = texture2D(sampler, vUV + (vec2( 0.0,  1.0)) * vInvTextureSize.xy).rgb;
        vec3 cSamplePosXPosY = texture2D(sampler, vUV + (vec2( 1.0,  1.0)) * vInvTextureSize.xy).rgb;

        // convert to linear	
        vec3 cLSampleNegXNegY = cSampleNegXNegY * cSampleNegXNegY;
        vec3 cLSampleZerXNegY = cSampleZerXNegY * cSampleZerXNegY;
        vec3 cLSamplePosXNegY = cSamplePosXNegY * cSamplePosXNegY;

        vec3 cLSampleNegXZerY = cSampleNegXZerY * cSampleNegXZerY;
        vec3 cLSampleZerXZerY = cSampleZerXZerY * cSampleZerXZerY;
        vec3 cLSamplePosXZerY = cSamplePosXZerY * cSamplePosXZerY;

        vec3 cLSampleNegXPosY = cSampleNegXPosY * cSampleNegXPosY;
        vec3 cLSampleZerXPosY = cSampleZerXPosY * cSampleZerXPosY;
        vec3 cLSamplePosXPosY = cSamplePosXPosY * cSamplePosXPosY;

        // Average samples to get albedo colour
        result.vAlbedo = ( cLSampleNegXNegY + cLSampleZerXNegY + cLSamplePosXNegY 
                         + cLSampleNegXZerY + cLSampleZerXZerY + cLSamplePosXZerY
                         + cLSampleNegXPosY + cLSampleZerXPosY + cLSamplePosXPosY ) / 9.0;	
        
        vec3 vScale = vec3(0.3333);
        
        #ifdef USE_LINEAR_FOR_BUMPMAP
          
          float fSampleNegXNegY = dot(cLSampleNegXNegY, vScale);
          float fSampleZerXNegY = dot(cLSampleZerXNegY, vScale);
          float fSamplePosXNegY = dot(cLSamplePosXNegY, vScale);
          
          float fSampleNegXZerY = dot(cLSampleNegXZerY, vScale);
          float fSampleZerXZerY = dot(cLSampleZerXZerY, vScale);
          float fSamplePosXZerY = dot(cLSamplePosXZerY, vScale);
          
          float fSampleNegXPosY = dot(cLSampleNegXPosY, vScale);
          float fSampleZerXPosY = dot(cLSampleZerXPosY, vScale);
          float fSamplePosXPosY = dot(cLSamplePosXPosY, vScale);
        
        #else
        
          float fSampleNegXNegY = dot(cSampleNegXNegY, vScale);
          float fSampleZerXNegY = dot(cSampleZerXNegY, vScale);
          float fSamplePosXNegY = dot(cSamplePosXNegY, vScale);
          
          float fSampleNegXZerY = dot(cSampleNegXZerY, vScale);
          float fSampleZerXZerY = dot(cSampleZerXZerY, vScale);
          float fSamplePosXZerY = dot(cSamplePosXZerY, vScale);
          
          float fSampleNegXPosY = dot(cSampleNegXPosY, vScale);
          float fSampleZerXPosY = dot(cSampleZerXPosY, vScale);
          float fSamplePosXPosY = dot(cSamplePosXPosY, vScale);	
        
        #endif
        
        // Sobel operator - http://en.wikipedia.org/wiki/Sobel_operator
        
        vec2 vEdge;
        vEdge.x = (fSampleNegXNegY - fSamplePosXNegY) * 0.25 
                + (fSampleNegXZerY - fSamplePosXZerY) * 0.5
                + (fSampleNegXPosY - fSamplePosXPosY) * 0.25;

        vEdge.y = (fSampleNegXNegY - fSampleNegXPosY) * 0.25 
                + (fSampleZerXNegY - fSampleZerXPosY) * 0.5
                + (fSamplePosXNegY - fSamplePosXPosY) * 0.25;

        result.vNormal = normalize(vec3(vEdge * fNormalScale, 1.0));	
        
        return result;
      }
      
      void main() {
        vec2 uv = v_texCoord;
        
        C_Sample materialSample;
        
        float fNormalScale = 10.0;
        materialSample = SampleMaterial(uv, u_posterTexture, u_resolution, fNormalScale);
        
        // Lighting setup
        float fLightHeight = 0.2;
        float fViewHeight = 2.0;
        
        vec3 vSurfacePos = vec3(uv, 0.0);
        
        vec3 vViewPos = vec3(0.5, 0.5, fViewHeight);
        
        vec3 vLightPos = vec3(u_mouse, fLightHeight);
        
        vec3 vDirToView = normalize(vViewPos - vSurfacePos);
        vec3 vDirToLight = normalize(vLightPos - vSurfacePos);
        
        float fNDotL = clamp(dot(materialSample.vNormal, vDirToLight), 0.0, 1.0);
        float fDiffuse = fNDotL;
        
        vec3 vHalf = normalize(vDirToView + vDirToLight);
        float fNDotH = clamp(dot(materialSample.vNormal, vHalf), 0.0, 1.0);
        float fSpec = pow(fNDotH, 10.0) * fNDotL * 0.5;
        
        vec3 vResult = materialSample.vAlbedo * fDiffuse + fSpec;
        
        vResult = sqrt(vResult);
        
        gl_FragColor = vec4(vResult, 1.0);
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
    const resolutionLocation = this.gl.getUniformLocation(this.program, 'u_resolution');
    const mouseLocation = this.gl.getUniformLocation(this.program, 'u_mouse');
    const timeLocation = this.gl.getUniformLocation(this.program, 'u_time');
    
    this.gl.uniform1i(posterTextureLocation, 0);
    this.gl.uniform2f(resolutionLocation, this.canvas.width, this.canvas.height);
    this.gl.uniform2f(mouseLocation, this.mouseX, this.mouseY);
    this.gl.uniform1f(timeLocation, Date.now() * 0.001);
    
    // Bind texture
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.posterTexture);
    
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
  
  console.log('Found product image, initializing Sobel normal mapping effect...');
  
  // Keep the original image visible as background
  img.style.position = 'absolute';
  img.style.top = '0';
  img.style.left = '0';
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.zIndex = '1';
  
  // Create the normal mapping effect (no normal map image needed)
  try {
    window.normalMappingEffect = new NormalMappingEffect(productImageMain, img, null);
  } catch (error) {
    console.error('Failed to create normal mapping effect:', error);
  }
});
