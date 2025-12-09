const simCanvas = document.getElementById('sim-canvas');
const simCtx = simCanvas.getContext('2d');

let currentSim = 0;
let animationId;
let time = 0;

const params = {
  hue: 120,
  decay: 5,
  speed: 50,
  zoom: 100,
  spokes: 6,
  winding: 5
};

function resizeSimCanvas() {
  const container = simCanvas.parentElement;
  simCanvas.width = container.clientWidth;
  simCanvas.height = container.clientHeight - 60;
}

resizeSimCanvas();
window.addEventListener('resize', resizeSimCanvas);

const controlToggle = document.getElementById('control-toggle');
const controlPanel = document.getElementById('control-panel');
const closePanel = document.getElementById('close-panel');

controlToggle.addEventListener('click', () => {
  controlPanel.classList.add('active');
  controlToggle.classList.add('hidden');
});

closePanel.addEventListener('click', () => {
  controlPanel.classList.remove('active');
  controlToggle.classList.remove('hidden');
});

document.querySelectorAll('.section-header').forEach(header => {
  header.addEventListener('click', () => {
    const sectionId = header.dataset.section;
    const content = document.getElementById(sectionId);
    content.classList.toggle('active');
  });
});

document.querySelectorAll('.sim-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sim-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentSim = parseInt(btn.dataset.sim);
    time = 0;
    simCtx.fillStyle = 'rgba(0, 0, 0, 1)';
    simCtx.fillRect(0, 0, simCanvas.width, simCanvas.height);
  });
});

const sliders = ['hue', 'decay', 'speed', 'zoom', 'spokes', 'winding'];
sliders.forEach(id => {
  const slider = document.getElementById(id);
  const valueSpan = document.getElementById(id + '-val');
  slider.addEventListener('input', () => {
    params[id] = parseInt(slider.value);
    valueSpan.textContent = slider.value;
  });
});

document.getElementById('sim-select').classList.add('active');

function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function getColor(offset = 0, lightness = 60) {
  const [r, g, b] = hslToRgb((params.hue + offset) % 360, 100, lightness);
  return `rgb(${r}, ${g}, ${b})`;
}

function getGlowColor(offset = 0) {
  const [r, g, b] = hslToRgb((params.hue + offset) % 360, 100, 70);
  return `rgba(${r}, ${g}, ${b}, 0.5)`;
}

function sim0_EvolvingStarFractal() {
  const cx = simCanvas.width / 2;
  const cy = simCanvas.height / 2;
  const A = params.spokes;
  const B = params.winding;
  const speed = params.speed / 1000;
  const zoomFactor = params.zoom / 100;
  
  const omegaGlobal = 0.5 + Math.sin(time * speed * 0.1) * 0.3;
  const omegaZoom = Math.sin(time * speed * 0.05) * 0.5;
  const Rmax = Math.min(cx, cy) * 0.8 * zoomFactor * (1 + omegaZoom * 0.3);
  
  for (let i = 0; i < 5; i++) {
    const t = time * speed * omegaGlobal + i * 0.1;
    const n = A + Math.sin(t * 0.1) * 2;
    const theta = B * t;
    
    const r = Rmax * (0.3 + 0.7 * Math.abs(Math.sin(n * theta)));
    const spiralOffset = t * 0.5;
    
    const x = cx + r * Math.cos(theta + spiralOffset);
    const y = cy + r * Math.sin(theta + spiralOffset);
    
    simCtx.beginPath();
    simCtx.arc(x, y, 2, 0, Math.PI * 2);
    simCtx.fillStyle = getColor(t * 10);
    simCtx.shadowColor = getGlowColor();
    simCtx.shadowBlur = 15;
    simCtx.fill();
  }
}

function sim1_HyperspaceWeb() {
  const cx = simCanvas.width / 2;
  const cy = simCanvas.height / 2;
  const speed = params.speed / 500;
  const zoomFactor = params.zoom / 100;
  const numPoints = 50;
  const points = [];
  
  for (let i = 0; i < numPoints; i++) {
    const phi = (i / numPoints) * Math.PI * 2 + time * speed * 0.1;
    const theta = (i / numPoints) * Math.PI + Math.sin(time * speed * 0.05 + i) * 0.5;
    const r = 150 * zoomFactor * (1 + Math.sin(time * speed * 0.02 + i * 0.3) * 0.3);
    
    const x3d = r * Math.sin(theta) * Math.cos(phi);
    const y3d = r * Math.sin(theta) * Math.sin(phi);
    const z3d = r * Math.cos(theta);
    
    const rotY = time * speed * 0.1;
    const rotX = time * speed * 0.05;
    
    const x2 = x3d * Math.cos(rotY) - z3d * Math.sin(rotY);
    const z2 = x3d * Math.sin(rotY) + z3d * Math.cos(rotY);
    const y2 = y3d * Math.cos(rotX) - z2 * Math.sin(rotX);
    const z3 = y3d * Math.sin(rotX) + z2 * Math.cos(rotX);
    
    const perspective = 400 / (400 + z3);
    points.push({
      x: cx + x2 * perspective,
      y: cy + y2 * perspective,
      z: z3,
      perspective
    });
  }
  
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dist = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);
      if (dist < 80) {
        const alpha = (1 - dist / 80) * 0.3;
        simCtx.beginPath();
        simCtx.moveTo(points[i].x, points[i].y);
        simCtx.lineTo(points[j].x, points[j].y);
        simCtx.strokeStyle = `hsla(${params.hue}, 100%, 50%, ${alpha})`;
        simCtx.lineWidth = 1;
        simCtx.stroke();
      }
    }
  }
  
  points.forEach((p, i) => {
    simCtx.beginPath();
    simCtx.arc(p.x, p.y, 3 * p.perspective, 0, Math.PI * 2);
    simCtx.fillStyle = getColor(i * 5);
    simCtx.shadowColor = getGlowColor();
    simCtx.shadowBlur = 10;
    simCtx.fill();
  });
}

function sim2_LissajousCascade() {
  const cx = simCanvas.width / 2;
  const cy = simCanvas.height / 2;
  const speed = params.speed / 1000;
  const zoomFactor = params.zoom / 100;
  const numFigures = 8;
  
  const primes = [2, 3, 5, 7, 11, 13, 17, 19];
  
  for (let f = 0; f < numFigures; f++) {
    const a = primes[f % primes.length] + Math.sin(time * speed * 0.01 + f) * 0.5;
    const b = primes[(f + 1) % primes.length] + Math.cos(time * speed * 0.01 + f) * 0.5;
    const delta = time * speed * 0.1 + f * Math.PI / numFigures;
    
    const amplitude = (80 + f * 15) * zoomFactor;
    
    simCtx.beginPath();
    for (let t = 0; t < Math.PI * 4; t += 0.05) {
      const x = cx + amplitude * Math.sin(a * t + delta);
      const y = cy + amplitude * Math.sin(b * t);
      
      if (t === 0) simCtx.moveTo(x, y);
      else simCtx.lineTo(x, y);
    }
    
    simCtx.strokeStyle = getColor(f * 30, 50);
    simCtx.lineWidth = 1.5;
    simCtx.shadowColor = getGlowColor(f * 30);
    simCtx.shadowBlur = 8;
    simCtx.stroke();
  }
}

const particles = [];
function sim3_MagneticFieldTracer() {
  const speed = params.speed / 500;
  const zoomFactor = params.zoom / 100;
  
  if (particles.length < 100) {
    particles.push({
      x: Math.random() * simCanvas.width,
      y: Math.random() * simCanvas.height,
      age: 0,
      maxAge: 50 + Math.random() * 100
    });
  }
  
  function noise(x, y, t) {
    return Math.sin(x * 0.01 + t) * Math.cos(y * 0.01 + t * 0.5) +
           Math.sin((x + y) * 0.02 + t * 0.3) * 0.5;
  }
  
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    
    const angle = noise(p.x, p.y, time * speed * 0.1) * Math.PI * 2;
    const fieldStrength = 2 * zoomFactor * speed;
    
    p.x += Math.cos(angle) * fieldStrength;
    p.y += Math.sin(angle) * fieldStrength;
    p.age++;
    
    if (p.age > p.maxAge || p.x < 0 || p.x > simCanvas.width || p.y < 0 || p.y > simCanvas.height) {
      particles.splice(i, 1);
      continue;
    }
    
    const alpha = 1 - p.age / p.maxAge;
    simCtx.beginPath();
    simCtx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    simCtx.fillStyle = `hsla(${params.hue + p.age}, 100%, 60%, ${alpha})`;
    simCtx.shadowColor = getGlowColor();
    simCtx.shadowBlur = 10;
    simCtx.fill();
  }
}

const orbitals = [];
function sim4_AsymmetricOrbitals() {
  const cx = simCanvas.width / 2;
  const cy = simCanvas.height / 2;
  const speed = params.speed / 2000;
  const zoomFactor = params.zoom / 100;
  
  if (orbitals.length === 0) {
    for (let i = 0; i < 4; i++) {
      orbitals.push({
        x: cx + (Math.random() - 0.5) * 200,
        y: cy + (Math.random() - 0.5) * 200,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        mass: 1 + Math.random() * 0.5,
        trail: []
      });
    }
  }
  
  const G = 0.5 * zoomFactor;
  
  for (let i = 0; i < orbitals.length; i++) {
    for (let j = i + 1; j < orbitals.length; j++) {
      const dx = orbitals[j].x - orbitals[i].x;
      const dy = orbitals[j].y - orbitals[i].y;
      const dist = Math.max(Math.hypot(dx, dy), 20);
      const force = G * orbitals[i].mass * orbitals[j].mass / (dist * dist);
      
      const ax = force * dx / dist;
      const ay = force * dy / dist;
      
      orbitals[i].vx += ax * speed;
      orbitals[i].vy += ay * speed;
      orbitals[j].vx -= ax * speed;
      orbitals[j].vy -= ay * speed;
    }
  }
  
  orbitals.forEach((o, idx) => {
    o.x += o.vx;
    o.y += o.vy;
    
    if (o.x < 50 || o.x > simCanvas.width - 50) o.vx *= -0.8;
    if (o.y < 50 || o.y > simCanvas.height - 50) o.vy *= -0.8;
    
    o.trail.push({ x: o.x, y: o.y });
    if (o.trail.length > 100) o.trail.shift();
    
    simCtx.beginPath();
    o.trail.forEach((t, i) => {
      if (i === 0) simCtx.moveTo(t.x, t.y);
      else simCtx.lineTo(t.x, t.y);
    });
    simCtx.strokeStyle = `hsla(${params.hue + idx * 60}, 100%, 50%, 0.6)`;
    simCtx.lineWidth = 2;
    simCtx.stroke();
    
    simCtx.beginPath();
    simCtx.arc(o.x, o.y, 6 * o.mass, 0, Math.PI * 2);
    simCtx.fillStyle = getColor(idx * 60);
    simCtx.shadowColor = getGlowColor(idx * 60);
    simCtx.shadowBlur = 15;
    simCtx.fill();
  });
}

let reactionRing = null;
function sim5_ReactionDiffusionRing() {
  const cx = simCanvas.width / 2;
  const cy = simCanvas.height / 2;
  const radius = Math.min(cx, cy) * 0.7 * (params.zoom / 100);
  const numCells = 200;
  const speed = params.speed / 500;
  
  if (!reactionRing || reactionRing.length !== numCells) {
    reactionRing = [];
    for (let i = 0; i < numCells; i++) {
      reactionRing.push({
        a: Math.random(),
        b: Math.random() * 0.5
      });
    }
  }
  
  const newRing = reactionRing.map((cell, i) => {
    const left = reactionRing[(i - 1 + numCells) % numCells];
    const right = reactionRing[(i + 1) % numCells];
    
    const Da = 1.0;
    const Db = 0.5;
    const f = 0.055;
    const k = 0.062;
    
    const laplaceA = left.a - 2 * cell.a + right.a;
    const laplaceB = left.b - 2 * cell.b + right.b;
    
    const reaction = cell.a * cell.b * cell.b;
    
    return {
      a: cell.a + (Da * laplaceA - reaction + f * (1 - cell.a)) * speed,
      b: cell.b + (Db * laplaceB + reaction - (k + f) * cell.b) * speed
    };
  });
  
  reactionRing = newRing;
  
  for (let i = 0; i < numCells; i++) {
    const angle = (i / numCells) * Math.PI * 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    
    const intensity = reactionRing[i].b;
    const hue = params.hue + intensity * 60;
    const lightness = 30 + intensity * 40;
    
    simCtx.beginPath();
    simCtx.arc(x, y, 5 + intensity * 5, 0, Math.PI * 2);
    simCtx.fillStyle = `hsl(${hue}, 100%, ${lightness}%)`;
    simCtx.shadowColor = getGlowColor();
    simCtx.shadowBlur = 10;
    simCtx.fill();
  }
  
  simCtx.beginPath();
  simCtx.arc(cx, cy, radius, 0, Math.PI * 2);
  simCtx.strokeStyle = `hsla(${params.hue}, 100%, 30%, 0.3)`;
  simCtx.lineWidth = 1;
  simCtx.stroke();
}

const simulations = [
  sim0_EvolvingStarFractal,
  sim1_HyperspaceWeb,
  sim2_LissajousCascade,
  sim3_MagneticFieldTracer,
  sim4_AsymmetricOrbitals,
  sim5_ReactionDiffusionRing
];

function animate() {
  const decayAlpha = params.decay / 100;
  simCtx.fillStyle = `rgba(0, 0, 0, ${decayAlpha})`;
  simCtx.fillRect(0, 0, simCanvas.width, simCanvas.height);
  
  simCtx.shadowBlur = 0;
  simulations[currentSim]();
  
  time++;
  animationId = requestAnimationFrame(animate);
}

animate();
