const canvas = document.getElementById('fractal-canvas');
const gl = canvas.getContext('webgl2', {
  antialias: false,
  depth: false,
  alpha: false,
  preserveDrawingBuffer: true
});

if (!gl) {
  alert('WebGL2 is required for the fractal generator');
}

let currentProgram = null;
let zoom = 1.0;
let centerX = -0.5;
let centerY = 0.0;
let maxIterations = 256;
let colorShift = 0;
let isAutoZooming = false;
let autoZoomTarget = { x: -0.5, y: 0.0 };
let autoZoomSpeed = 1.02;
let animationId = null;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let currentFractalType = '';

const presetCode = {
  'mandelbrot': { init: 'standard', code: 'z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + c;' },
  'julia': { init: 'julia', code: 'z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + c;', constant: [-0.7269, 0.1889] },
  'burning-ship': { init: 'standard', code: 'z = vec2(abs(z.x), abs(z.y)); z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + c;' },
  'tricorn': { init: 'standard', code: 'z = vec2(z.x*z.x - z.y*z.y, -2.0*z.x*z.y) + c;' }
};

const presetTargets = {
  'mandelbrot': { x: -0.743643887037151, y: 0.131825904205330 },
  'julia': { x: 0.0, y: 0.0 },
  'burning-ship': { x: -1.762, y: -0.028 },
  'tricorn': { x: -0.4, y: 0.6 }
};

const presetCenters = {
  'mandelbrot': { x: -0.5, y: 0.0 },
  'julia': { x: 0.0, y: 0.0 },
  'burning-ship': { x: -0.4, y: -0.5 },
  'tricorn': { x: -0.3, y: 0.0 }
};

const vertexShaderSource = `#version 300 es
in vec4 a_position;
void main() {
  gl_Position = a_position;
}`;

function createFragmentShader(iterationCode, initType = 'standard', juliaConstant = null) {
  let initCode;
  if (initType === 'julia' && juliaConstant) {
    initCode = `vec2 z = uv;
  vec2 c = vec2(${juliaConstant[0].toFixed(6)}, ${juliaConstant[1].toFixed(6)});`;
  } else {
    initCode = `vec2 z = vec2(0.0);
  vec2 c = uv;`;
  }
  
  return `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_zoom;
uniform vec2 u_center;
uniform int u_maxIter;
uniform float u_colorShift;
uniform float u_time;

out vec4 fragColor;

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / min(u_resolution.x, u_resolution.y);
  uv = uv / u_zoom + u_center;
  
  ${initCode}
  float iter = 0.0;
  
  for(int i = 0; i < 2048; i++) {
    if(i >= u_maxIter) break;
    if(dot(z, z) > 256.0) break;
    
    ${iterationCode}
    
    iter += 1.0;
  }
  
  if(iter >= float(u_maxIter)) {
    fragColor = vec4(0.0, 0.0, 0.0, 1.0);
  } else {
    float smoothIter = iter - log2(log2(dot(z, z))) + 4.0;
    float hue = fract(smoothIter * 0.02 + u_colorShift / 360.0);
    float sat = 0.85;
    float val = 0.9;
    
    float glow = exp(-smoothIter * 0.05);
    val = mix(val, 1.0, glow * 0.3);
    
    vec3 rgb = hsv2rgb(vec3(hue, sat, val));
    
    rgb = mix(rgb, vec3(0.0, rgb.g * 1.2, 0.0), 0.15);
    
    fragColor = vec4(rgb, 1.0);
  }
}`;
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const error = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error('Shader compile error: ' + error);
  }
  
  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const error = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error('Program link error: ' + error);
  }
  
  return program;
}

function initFractal(iterationCode, initType = 'standard', juliaConstant = null) {
  try {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShaderSource = createFragmentShader(iterationCode, initType, juliaConstant);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    if (currentProgram) {
      gl.deleteProgram(currentProgram);
    }
    
    currentProgram = createProgram(gl, vertexShader, fragmentShader);
    
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1
    ]), gl.STATIC_DRAW);
    
    const positionLocation = gl.getAttribLocation(currentProgram, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    
    gl.useProgram(currentProgram);
    
    updateStatus('> FRACTAL COMPILED SUCCESSFULLY');
    document.getElementById('fractal-overlay').classList.add('hidden');
    
    return true;
  } catch (error) {
    updateStatus('> ERROR: ' + error.message);
    console.error(error);
    return false;
  }
}

function render() {
  if (!currentProgram) return;
  
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  gl.useProgram(currentProgram);
  
  gl.uniform2f(gl.getUniformLocation(currentProgram, 'u_resolution'), canvas.width, canvas.height);
  gl.uniform1f(gl.getUniformLocation(currentProgram, 'u_zoom'), zoom);
  gl.uniform2f(gl.getUniformLocation(currentProgram, 'u_center'), centerX, centerY);
  gl.uniform1i(gl.getUniformLocation(currentProgram, 'u_maxIter'), maxIterations);
  gl.uniform1f(gl.getUniformLocation(currentProgram, 'u_colorShift'), colorShift);
  gl.uniform1f(gl.getUniformLocation(currentProgram, 'u_time'), performance.now() * 0.001);
  
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  
  document.getElementById('zoom-indicator').textContent = 'ZOOM: ' + zoom.toExponential(2) + 'x';
}

function autoZoomStep() {
  if (!isAutoZooming) return;
  
  const zoomSpeed = autoZoomSpeed;
  zoom *= zoomSpeed;
  
  const targetWeight = 0.02;
  centerX += (autoZoomTarget.x - centerX) * targetWeight;
  centerY += (autoZoomTarget.y - centerY) * targetWeight;
  
  const maxZoom = 1e14;
  if (zoom > maxZoom) {
    stopAutoZoom();
    updateStatus('> AUTO ZOOM REACHED PRECISION LIMIT');
    return;
  }
  
  render();
  animationId = requestAnimationFrame(autoZoomStep);
}

function startAutoZoom() {
  if (isAutoZooming) {
    stopAutoZoom();
    return;
  }
  
  isAutoZooming = true;
  document.getElementById('auto-zoom-btn').classList.add('active');
  document.getElementById('auto-zoom-btn').textContent = '[ STOP ZOOM ]';
  updateStatus('> AUTO ZOOM ACTIVE - CLICK TO STOP');
  
  if (currentFractalType && presetTargets[currentFractalType]) {
    autoZoomTarget = presetTargets[currentFractalType];
  } else {
    autoZoomTarget = { x: centerX, y: centerY };
  }
  
  autoZoomStep();
}

function stopAutoZoom() {
  isAutoZooming = false;
  document.getElementById('auto-zoom-btn').classList.remove('active');
  document.getElementById('auto-zoom-btn').textContent = '[ AUTO ZOOM ]';
  
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  
  updateStatus('> AUTO ZOOM STOPPED');
}

function resetView() {
  stopAutoZoom();
  
  if (currentFractalType && presetCenters[currentFractalType]) {
    centerX = presetCenters[currentFractalType].x;
    centerY = presetCenters[currentFractalType].y;
  } else {
    centerX = -0.5;
    centerY = 0.0;
  }
  
  zoom = 1.0;
  render();
  updateStatus('> VIEW RESET');
}

function resizeCanvas() {
  const wrapper = canvas.parentElement;
  const rect = wrapper.getBoundingClientRect();
  
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  
  if (currentProgram) {
    render();
  }
}

function updateStatus(message) {
  document.getElementById('status-bar').textContent = message;
}

document.getElementById('preset-select').addEventListener('change', function(e) {
  const preset = e.target.value;
  if (!preset) return;
  
  currentFractalType = preset;
  const presetData = presetCode[preset];
  document.getElementById('custom-code').value = presetData.code;
  
  if (presetCenters[preset]) {
    centerX = presetCenters[preset].x;
    centerY = presetCenters[preset].y;
  }
  zoom = 1.0;
  
  updateStatus('> LOADING ' + preset.toUpperCase() + '...');
  
  if (initFractal(presetData.code, presetData.init, presetData.constant)) {
    render();
  }
});

document.getElementById('generate-btn').addEventListener('click', function() {
  const customCode = document.getElementById('custom-code').value.trim();
  
  if (!customCode) {
    updateStatus('> ERROR: NO CODE PROVIDED');
    return;
  }
  
  stopAutoZoom();
  currentFractalType = '';
  document.getElementById('preset-select').value = '';
  updateStatus('> GENERATING CUSTOM FRACTAL...');
  
  if (initFractal(customCode)) {
    render();
  }
});

document.getElementById('auto-zoom-btn').addEventListener('click', startAutoZoom);
document.getElementById('reset-btn').addEventListener('click', resetView);

document.getElementById('max-iterations').addEventListener('change', function(e) {
  maxIterations = Math.min(2048, Math.max(16, parseInt(e.target.value) || 256));
  e.target.value = maxIterations;
  render();
  updateStatus('> ITERATIONS: ' + maxIterations);
});

document.getElementById('color-shift').addEventListener('input', function(e) {
  colorShift = parseInt(e.target.value) || 0;
  render();
});

canvas.addEventListener('wheel', function(e) {
  e.preventDefault();
  
  const rect = canvas.getBoundingClientRect();
  const mouseX = (e.clientX - rect.left) / rect.width;
  const mouseY = 1 - (e.clientY - rect.top) / rect.height;
  
  const aspect = canvas.width / canvas.height;
  const worldX = (mouseX - 0.5) * 2 / zoom + centerX;
  const worldY = (mouseY - 0.5) * 2 / aspect / zoom + centerY;
  
  const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
  zoom *= zoomFactor;
  
  centerX = worldX - (mouseX - 0.5) * 2 / zoom;
  centerY = worldY - (mouseY - 0.5) * 2 / aspect / zoom;
  
  render();
});

canvas.addEventListener('mousedown', function(e) {
  isDragging = true;
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
  canvas.style.cursor = 'grabbing';
});

canvas.addEventListener('mousemove', function(e) {
  if (!isDragging) return;
  
  const dx = e.clientX - lastMouseX;
  const dy = e.clientY - lastMouseY;
  
  const rect = canvas.getBoundingClientRect();
  const scale = 2 / zoom / Math.min(rect.width, rect.height);
  
  centerX -= dx * scale;
  centerY += dy * scale;
  
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
  
  render();
});

canvas.addEventListener('mouseup', function() {
  isDragging = false;
  canvas.style.cursor = 'crosshair';
});

canvas.addEventListener('mouseleave', function() {
  isDragging = false;
  canvas.style.cursor = 'crosshair';
});

canvas.addEventListener('touchstart', function(e) {
  e.preventDefault();
  if (e.touches.length === 1) {
    isDragging = true;
    lastMouseX = e.touches[0].clientX;
    lastMouseY = e.touches[0].clientY;
  }
}, { passive: false });

canvas.addEventListener('touchmove', function(e) {
  e.preventDefault();
  if (!isDragging || e.touches.length !== 1) return;
  
  const dx = e.touches[0].clientX - lastMouseX;
  const dy = e.touches[0].clientY - lastMouseY;
  
  const rect = canvas.getBoundingClientRect();
  const scale = 2 / zoom / Math.min(rect.width, rect.height);
  
  centerX -= dx * scale;
  centerY += dy * scale;
  
  lastMouseX = e.touches[0].clientX;
  lastMouseY = e.touches[0].clientY;
  
  render();
}, { passive: false });

canvas.addEventListener('touchend', function() {
  isDragging = false;
});

document.getElementById('info-btn').addEventListener('click', function() {
  document.getElementById('info-modal').classList.remove('hidden');
});

document.getElementById('info-close').addEventListener('click', function() {
  document.getElementById('info-modal').classList.add('hidden');
});

document.getElementById('info-modal').addEventListener('click', function(e) {
  if (e.target === this) {
    this.classList.add('hidden');
  }
});

window.addEventListener('resize', resizeCanvas);

document.addEventListener('DOMContentLoaded', function() {
  resizeCanvas();
  updateStatus('> READY - SELECT A PRESET OR ENTER CUSTOM CODE');
});

window.addEventListener('load', function() {
  setTimeout(resizeCanvas, 100);
});
