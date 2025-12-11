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
    resetSimulationState();
    simCtx.fillStyle = 'rgba(0, 0, 0, 1)';
    simCtx.fillRect(0, 0, simCanvas.width, simCanvas.height);
  });
});

const sliders = ['hue', 'decay', 'speed', 'zoom', 'spokes', 'winding'];
sliders.forEach(id => {
  const slider = document.getElementById(id);
  const valueSpan = document.getElementById(id + '-val');
  if (slider && valueSpan) {
    slider.addEventListener('input', () => {
      params[id] = parseInt(slider.value);
      valueSpan.textContent = slider.value;
    });
  }
});

document.getElementById('sim-select').classList.add('active');

function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
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

let particles = [];
let orbitals = [];
let reactionGrid = null;
let flockBoids = [];
let pendulumState = null;
let fractalTreeAngle = 0;
let voronoiPoints = [];
let spirographAngles = [];
let galaxyStars = [];
let lightningBolts = [];
let kaleidoAngle = 0;
let wavePoints = [];
let attractor = { x: [], y: [], z: [] };
let jellyfish = [];
let dnaStrands = [];

function resetSimulationState() {
  particles = [];
  orbitals = [];
  reactionGrid = null;
  flockBoids = [];
  pendulumState = null;
  voronoiPoints = [];
  spirographAngles = [];
  galaxyStars = [];
  lightningBolts = [];
  wavePoints = [];
  attractor = { x: [], y: [], z: [] };
  jellyfish = [];
  dnaStrands = [];
}

function sim0_EvolvingStarFractal() {
  const cx = simCanvas.width / 2;
  const cy = simCanvas.height / 2;
  const A = params.spokes;
  const B = params.winding;
  const speed = params.speed / 800;
  const zoomFactor = params.zoom / 100;
  
  const omegaGlobal = 0.5 + Math.sin(time * speed * 0.1) * 0.3;
  const Rmax = Math.min(cx, cy) * 0.8 * zoomFactor * (1 + Math.sin(time * speed * 0.05) * 0.3);
  
  for (let i = 0; i < 8; i++) {
    const t = time * speed * omegaGlobal + i * 0.05;
    const n = A + Math.sin(t * 0.1) * 2;
    const theta = B * t;
    const r = Rmax * (0.3 + 0.7 * Math.abs(Math.sin(n * theta)));
    const x = cx + r * Math.cos(theta + t * 0.5);
    const y = cy + r * Math.sin(theta + t * 0.5);
    
    simCtx.beginPath();
    simCtx.arc(x, y, 3, 0, Math.PI * 2);
    simCtx.fillStyle = getColor(t * 15);
    simCtx.shadowColor = getGlowColor(t * 15);
    simCtx.shadowBlur = 20;
    simCtx.fill();
  }
}

function sim1_HyperspaceWeb() {
  const cx = simCanvas.width / 2;
  const cy = simCanvas.height / 2;
  const speed = params.speed / 400;
  const zoomFactor = params.zoom / 100;
  const numPoints = 60;
  const points = [];
  
  for (let i = 0; i < numPoints; i++) {
    const phi = (i / numPoints) * Math.PI * 2 + time * speed * 0.1;
    const theta = (i / numPoints) * Math.PI + Math.sin(time * speed * 0.05 + i) * 0.5;
    const r = 180 * zoomFactor * (1 + Math.sin(time * speed * 0.02 + i * 0.3) * 0.3);
    
    const x3d = r * Math.sin(theta) * Math.cos(phi);
    const y3d = r * Math.sin(theta) * Math.sin(phi);
    const z3d = r * Math.cos(theta);
    
    const rotY = time * speed * 0.1;
    const rotX = time * speed * 0.05;
    
    const x2 = x3d * Math.cos(rotY) - z3d * Math.sin(rotY);
    const z2 = x3d * Math.sin(rotY) + z3d * Math.cos(rotY);
    const y2 = y3d * Math.cos(rotX) - z2 * Math.sin(rotX);
    const z3 = y3d * Math.sin(rotX) + z2 * Math.cos(rotX);
    
    const perspective = 500 / (500 + z3);
    points.push({ x: cx + x2 * perspective, y: cy + y2 * perspective, z: z3, perspective });
  }
  
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dist = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);
      if (dist < 100) {
        const alpha = (1 - dist / 100) * 0.4;
        simCtx.beginPath();
        simCtx.moveTo(points[i].x, points[i].y);
        simCtx.lineTo(points[j].x, points[j].y);
        simCtx.strokeStyle = `hsla(${params.hue + i}, 100%, 50%, ${alpha})`;
        simCtx.lineWidth = 1;
        simCtx.stroke();
      }
    }
  }
  
  points.forEach((p, i) => {
    simCtx.beginPath();
    simCtx.arc(p.x, p.y, 4 * p.perspective, 0, Math.PI * 2);
    simCtx.fillStyle = getColor(i * 6);
    simCtx.shadowColor = getGlowColor(i * 6);
    simCtx.shadowBlur = 15;
    simCtx.fill();
  });
}

function sim2_LissajousCascade() {
  const cx = simCanvas.width / 2;
  const cy = simCanvas.height / 2;
  const speed = params.speed / 800;
  const zoomFactor = params.zoom / 100;
  const numFigures = 10;
  const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
  
  for (let f = 0; f < numFigures; f++) {
    const a = primes[f % primes.length] + Math.sin(time * speed * 0.01 + f) * 0.5;
    const b = primes[(f + 1) % primes.length] + Math.cos(time * speed * 0.01 + f) * 0.5;
    const delta = time * speed * 0.1 + f * Math.PI / numFigures;
    const amplitude = (60 + f * 18) * zoomFactor;
    
    simCtx.beginPath();
    for (let t = 0; t < Math.PI * 4; t += 0.03) {
      const x = cx + amplitude * Math.sin(a * t + delta);
      const y = cy + amplitude * Math.sin(b * t);
      if (t === 0) simCtx.moveTo(x, y);
      else simCtx.lineTo(x, y);
    }
    simCtx.strokeStyle = getColor(f * 36, 55);
    simCtx.lineWidth = 2;
    simCtx.shadowColor = getGlowColor(f * 36);
    simCtx.shadowBlur = 12;
    simCtx.stroke();
  }
}

function sim3_MagneticFieldTracer() {
  const speed = params.speed / 400;
  const zoomFactor = params.zoom / 100;
  
  while (particles.length < 150) {
    particles.push({
      x: Math.random() * simCanvas.width,
      y: Math.random() * simCanvas.height,
      age: 0,
      maxAge: 60 + Math.random() * 120,
      hueOffset: Math.random() * 60
    });
  }
  
  function noise(x, y, t) {
    return Math.sin(x * 0.008 + t) * Math.cos(y * 0.008 + t * 0.5) +
           Math.sin((x + y) * 0.015 + t * 0.3) * 0.5 +
           Math.cos(x * 0.02 - y * 0.02 + t * 0.2) * 0.3;
  }
  
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    const angle = noise(p.x, p.y, time * speed * 0.1) * Math.PI * 2;
    const fieldStrength = 2.5 * zoomFactor * speed;
    
    p.x += Math.cos(angle) * fieldStrength;
    p.y += Math.sin(angle) * fieldStrength;
    p.age++;
    
    if (p.age > p.maxAge || p.x < 0 || p.x > simCanvas.width || p.y < 0 || p.y > simCanvas.height) {
      particles.splice(i, 1);
      continue;
    }
    
    const alpha = 1 - p.age / p.maxAge;
    const size = 2 + (1 - alpha) * 2;
    simCtx.beginPath();
    simCtx.arc(p.x, p.y, size, 0, Math.PI * 2);
    simCtx.fillStyle = `hsla(${params.hue + p.age * 0.5 + p.hueOffset}, 100%, 60%, ${alpha})`;
    simCtx.shadowColor = getGlowColor(p.hueOffset);
    simCtx.shadowBlur = 12;
    simCtx.fill();
  }
}

function sim4_AsymmetricOrbitals() {
  const cx = simCanvas.width / 2;
  const cy = simCanvas.height / 2;
  const speed = params.speed / 1500;
  const zoomFactor = params.zoom / 100;
  
  if (orbitals.length === 0) {
    for (let i = 0; i < 5; i++) {
      orbitals.push({
        x: cx + (Math.random() - 0.5) * 250,
        y: cy + (Math.random() - 0.5) * 250,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        mass: 0.8 + Math.random() * 0.8,
        trail: [],
        hue: Math.random() * 360
      });
    }
  }
  
  const G = 0.6 * zoomFactor;
  
  for (let i = 0; i < orbitals.length; i++) {
    for (let j = i + 1; j < orbitals.length; j++) {
      const dx = orbitals[j].x - orbitals[i].x;
      const dy = orbitals[j].y - orbitals[i].y;
      const dist = Math.max(Math.hypot(dx, dy), 25);
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
    if (o.x < 50 || o.x > simCanvas.width - 50) o.vx *= -0.85;
    if (o.y < 50 || o.y > simCanvas.height - 50) o.vy *= -0.85;
    
    o.trail.push({ x: o.x, y: o.y });
    if (o.trail.length > 150) o.trail.shift();
    
    simCtx.beginPath();
    o.trail.forEach((t, i) => {
      if (i === 0) simCtx.moveTo(t.x, t.y);
      else simCtx.lineTo(t.x, t.y);
    });
    simCtx.strokeStyle = `hsla(${o.hue}, 100%, 50%, 0.7)`;
    simCtx.lineWidth = 2;
    simCtx.stroke();
    
    simCtx.beginPath();
    simCtx.arc(o.x, o.y, 8 * o.mass, 0, Math.PI * 2);
    simCtx.fillStyle = `hsl(${o.hue}, 100%, 60%)`;
    simCtx.shadowColor = `hsla(${o.hue}, 100%, 70%, 0.8)`;
    simCtx.shadowBlur = 20;
    simCtx.fill();
  });
}

function sim5_ReactionDiffusionRing() {
  const cx = simCanvas.width / 2;
  const cy = simCanvas.height / 2;
  const maxRadius = Math.min(cx, cy) * 0.85 * (params.zoom / 100);
  const numRings = 8;
  const cellsPerRing = 120;
  const speed = params.speed / 200;
  
  if (!reactionGrid) {
    reactionGrid = [];
    for (let ring = 0; ring < numRings; ring++) {
      reactionGrid[ring] = [];
      for (let i = 0; i < cellsPerRing; i++) {
        reactionGrid[ring].push({
          a: 0.5 + Math.random() * 0.5,
          b: Math.random() * 0.3 + (ring === Math.floor(numRings/2) ? 0.5 : 0)
        });
      }
    }
  }
  
  const newGrid = reactionGrid.map((ring, ringIdx) => 
    ring.map((cell, i) => {
      const left = ring[(i - 1 + cellsPerRing) % cellsPerRing];
      const right = ring[(i + 1) % cellsPerRing];
      const inner = ringIdx > 0 ? reactionGrid[ringIdx - 1][i] : cell;
      const outer = ringIdx < numRings - 1 ? reactionGrid[ringIdx + 1][i] : cell;
      
      const Da = 1.0;
      const Db = 0.5;
      const f = 0.035 + Math.sin(time * 0.01) * 0.01;
      const k = 0.057 + Math.cos(time * 0.008 + ringIdx * 0.5) * 0.008;
      
      const laplaceA = (left.a + right.a + inner.a + outer.a) / 4 - cell.a;
      const laplaceB = (left.b + right.b + inner.b + outer.b) / 4 - cell.b;
      const reaction = cell.a * cell.b * cell.b;
      
      return {
        a: Math.max(0, Math.min(1, cell.a + (Da * laplaceA - reaction + f * (1 - cell.a)) * speed)),
        b: Math.max(0, Math.min(1, cell.b + (Db * laplaceB + reaction - (k + f) * cell.b) * speed))
      };
    })
  );
  reactionGrid = newGrid;
  
  for (let ring = 0; ring < numRings; ring++) {
    const radius = maxRadius * (0.3 + (ring / numRings) * 0.7);
    for (let i = 0; i < cellsPerRing; i++) {
      const angle = (i / cellsPerRing) * Math.PI * 2 + time * 0.002;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      
      const intensity = reactionGrid[ring][i].b;
      const hue = params.hue + intensity * 120 + ring * 20;
      const lightness = 25 + intensity * 50;
      const size = 3 + intensity * 6;
      
      simCtx.beginPath();
      simCtx.arc(x, y, size, 0, Math.PI * 2);
      simCtx.fillStyle = `hsl(${hue}, 100%, ${lightness}%)`;
      simCtx.shadowColor = `hsla(${hue}, 100%, 70%, 0.6)`;
      simCtx.shadowBlur = 10;
      simCtx.fill();
    }
  }
}

function sim6_NeuralNetwork() {
  const cx = simCanvas.width / 2;
  const cy = simCanvas.height / 2;
  const speed = params.speed / 600;
  const zoomFactor = params.zoom / 100;
  const layers = [8, 12, 16, 12, 8];
  const nodes = [];
  const connections = [];
  
  const totalWidth = 500 * zoomFactor;
  const layerSpacing = totalWidth / (layers.length - 1);
  
  layers.forEach((count, layerIdx) => {
    const x = cx - totalWidth / 2 + layerIdx * layerSpacing;
    const layerHeight = count * 30 * zoomFactor;
    for (let i = 0; i < count; i++) {
      const y = cy - layerHeight / 2 + i * 30 * zoomFactor + 15 * zoomFactor;
      const activation = Math.sin(time * speed * 0.1 + layerIdx * 0.5 + i * 0.3) * 0.5 + 0.5;
      nodes.push({ x, y, layer: layerIdx, activation });
    }
  });
  
  let nodeIdx = 0;
  for (let l = 0; l < layers.length - 1; l++) {
    const startIdx = nodeIdx;
    const endIdx = startIdx + layers[l];
    const nextStart = endIdx;
    const nextEnd = nextStart + layers[l + 1];
    
    for (let i = startIdx; i < endIdx; i++) {
      for (let j = nextStart; j < nextEnd; j++) {
        const signal = Math.sin(time * speed * 0.2 + i * 0.1 + j * 0.1) * 0.5 + 0.5;
        connections.push({ from: i, to: j, signal });
      }
    }
    nodeIdx = endIdx;
  }
  
  connections.forEach(c => {
    const from = nodes[c.from];
    const to = nodes[c.to];
    if (from && to) {
      const alpha = c.signal * 0.3 * from.activation;
      simCtx.beginPath();
      simCtx.moveTo(from.x, from.y);
      simCtx.lineTo(to.x, to.y);
      simCtx.strokeStyle = `hsla(${params.hue + c.signal * 60}, 100%, 50%, ${alpha})`;
      simCtx.lineWidth = 1;
      simCtx.stroke();
    }
  });
  
  nodes.forEach((n, i) => {
    const size = 4 + n.activation * 6;
    simCtx.beginPath();
    simCtx.arc(n.x, n.y, size, 0, Math.PI * 2);
    simCtx.fillStyle = `hsl(${params.hue + n.activation * 60}, 100%, ${40 + n.activation * 30}%)`;
    simCtx.shadowColor = getGlowColor(n.activation * 60);
    simCtx.shadowBlur = 15;
    simCtx.fill();
  });
}

function sim7_FlockingSwarm() {
  const speed = params.speed / 500;
  const zoomFactor = params.zoom / 100;
  
  while (flockBoids.length < 100) {
    flockBoids.push({
      x: Math.random() * simCanvas.width,
      y: Math.random() * simCanvas.height,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      hue: Math.random() * 60
    });
  }
  
  const separation = 25 * zoomFactor;
  const alignment = 50 * zoomFactor;
  const cohesion = 80 * zoomFactor;
  
  flockBoids.forEach(boid => {
    let sepX = 0, sepY = 0, sepCount = 0;
    let alignX = 0, alignY = 0, alignCount = 0;
    let cohX = 0, cohY = 0, cohCount = 0;
    
    flockBoids.forEach(other => {
      if (other === boid) return;
      const dx = other.x - boid.x;
      const dy = other.y - boid.y;
      const dist = Math.hypot(dx, dy);
      
      if (dist < separation) {
        sepX -= dx / dist;
        sepY -= dy / dist;
        sepCount++;
      }
      if (dist < alignment) {
        alignX += other.vx;
        alignY += other.vy;
        alignCount++;
      }
      if (dist < cohesion) {
        cohX += other.x;
        cohY += other.y;
        cohCount++;
      }
    });
    
    if (sepCount > 0) { boid.vx += sepX * 0.05 * speed; boid.vy += sepY * 0.05 * speed; }
    if (alignCount > 0) { boid.vx += (alignX / alignCount - boid.vx) * 0.02 * speed; boid.vy += (alignY / alignCount - boid.vy) * 0.02 * speed; }
    if (cohCount > 0) { boid.vx += (cohX / cohCount - boid.x) * 0.001 * speed; boid.vy += (cohY / cohCount - boid.y) * 0.001 * speed; }
    
    const maxSpeed = 4 * speed;
    const spd = Math.hypot(boid.vx, boid.vy);
    if (spd > maxSpeed) { boid.vx = (boid.vx / spd) * maxSpeed; boid.vy = (boid.vy / spd) * maxSpeed; }
    
    boid.x += boid.vx;
    boid.y += boid.vy;
    
    if (boid.x < 0) boid.x = simCanvas.width;
    if (boid.x > simCanvas.width) boid.x = 0;
    if (boid.y < 0) boid.y = simCanvas.height;
    if (boid.y > simCanvas.height) boid.y = 0;
    
    const angle = Math.atan2(boid.vy, boid.vx);
    simCtx.save();
    simCtx.translate(boid.x, boid.y);
    simCtx.rotate(angle);
    simCtx.beginPath();
    simCtx.moveTo(10, 0);
    simCtx.lineTo(-5, 4);
    simCtx.lineTo(-5, -4);
    simCtx.closePath();
    simCtx.fillStyle = `hsl(${params.hue + boid.hue}, 100%, 60%)`;
    simCtx.shadowColor = getGlowColor(boid.hue);
    simCtx.shadowBlur = 10;
    simCtx.fill();
    simCtx.restore();
  });
}

function sim8_FractalTree() {
  const cx = simCanvas.width / 2;
  const cy = simCanvas.height;
  const speed = params.speed / 2000;
  const zoomFactor = params.zoom / 100;
  fractalTreeAngle += speed;
  
  function drawBranch(x, y, length, angle, depth, maxDepth) {
    if (depth > maxDepth || length < 2) return;
    
    const sway = Math.sin(time * 0.02 + depth * 0.5 + x * 0.01) * 0.1;
    const endX = x + Math.cos(angle + sway) * length;
    const endY = y + Math.sin(angle + sway) * length;
    
    const hue = params.hue + (depth / maxDepth) * 120;
    const lightness = 40 + (depth / maxDepth) * 30;
    
    simCtx.beginPath();
    simCtx.moveTo(x, y);
    simCtx.lineTo(endX, endY);
    simCtx.strokeStyle = `hsl(${hue}, 100%, ${lightness}%)`;
    simCtx.lineWidth = Math.max(1, (maxDepth - depth) * 0.8);
    simCtx.shadowColor = `hsla(${hue}, 100%, 70%, 0.5)`;
    simCtx.shadowBlur = 8;
    simCtx.stroke();
    
    const branchAngle = 0.4 + Math.sin(fractalTreeAngle + depth) * 0.2;
    const lengthRatio = 0.7 + Math.sin(fractalTreeAngle * 0.5 + depth * 0.3) * 0.1;
    
    drawBranch(endX, endY, length * lengthRatio, angle - branchAngle, depth + 1, maxDepth);
    drawBranch(endX, endY, length * lengthRatio, angle + branchAngle, depth + 1, maxDepth);
  }
  
  drawBranch(cx, cy - 20, 120 * zoomFactor, -Math.PI / 2, 0, 10);
}

function sim9_GalaxySpiral() {
  const cx = simCanvas.width / 2;
  const cy = simCanvas.height / 2;
  const speed = params.speed / 1000;
  const zoomFactor = params.zoom / 100;
  
  if (galaxyStars.length === 0) {
    for (let i = 0; i < 500; i++) {
      const arm = i % 4;
      const dist = Math.random() * 200 * zoomFactor;
      const armAngle = (arm / 4) * Math.PI * 2;
      const spiral = dist * 0.03;
      galaxyStars.push({
        dist,
        baseAngle: armAngle + spiral + (Math.random() - 0.5) * 0.5,
        size: 1 + Math.random() * 2,
        brightness: 0.5 + Math.random() * 0.5,
        hue: Math.random() * 60 - 30
      });
    }
  }
  
  galaxyStars.forEach(star => {
    const angle = star.baseAngle + time * speed * (0.5 / (star.dist + 50));
    const wobble = Math.sin(time * 0.05 + star.dist * 0.1) * 3;
    const x = cx + (star.dist + wobble) * Math.cos(angle);
    const y = cy + (star.dist + wobble) * Math.sin(angle) * 0.4;
    
    simCtx.beginPath();
    simCtx.arc(x, y, star.size, 0, Math.PI * 2);
    simCtx.fillStyle = `hsla(${params.hue + star.hue}, 80%, ${50 + star.brightness * 30}%, ${star.brightness})`;
    simCtx.shadowColor = `hsla(${params.hue + star.hue}, 100%, 70%, 0.5)`;
    simCtx.shadowBlur = 8;
    simCtx.fill();
  });
  
  const gradient = simCtx.createRadialGradient(cx, cy, 0, cx, cy, 30);
  gradient.addColorStop(0, `hsla(${params.hue + 30}, 100%, 90%, 0.8)`);
  gradient.addColorStop(1, `hsla(${params.hue}, 100%, 50%, 0)`);
  simCtx.beginPath();
  simCtx.arc(cx, cy, 30, 0, Math.PI * 2);
  simCtx.fillStyle = gradient;
  simCtx.fill();
}

function sim10_QuantumWave() {
  const cx = simCanvas.width / 2;
  const cy = simCanvas.height / 2;
  const speed = params.speed / 500;
  const zoomFactor = params.zoom / 100;
  
  const numWaves = 5;
  const points = 200;
  
  for (let w = 0; w < numWaves; w++) {
    simCtx.beginPath();
    for (let i = 0; i < points; i++) {
      const x = (i / points) * simCanvas.width;
      const freq1 = 0.02 + w * 0.005;
      const freq2 = 0.015 + w * 0.003;
      const phase = time * speed * (1 + w * 0.2);
      
      const y = cy + 
        Math.sin(x * freq1 + phase) * 50 * zoomFactor +
        Math.sin(x * freq2 - phase * 0.7) * 30 * zoomFactor +
        Math.sin(x * 0.008 + phase * 0.3 + w) * 20 * zoomFactor;
      
      if (i === 0) simCtx.moveTo(x, y);
      else simCtx.lineTo(x, y);
    }
    
    const hue = params.hue + w * 30;
    simCtx.strokeStyle = `hsla(${hue}, 100%, 50%, ${0.8 - w * 0.1})`;
    simCtx.lineWidth = 3 - w * 0.4;
    simCtx.shadowColor = `hsla(${hue}, 100%, 70%, 0.6)`;
    simCtx.shadowBlur = 15;
    simCtx.stroke();
  }
}

function sim11_StrangeAttractor() {
  const cx = simCanvas.width / 2;
  const cy = simCanvas.height / 2;
  const speed = params.speed / 1000;
  const zoomFactor = params.zoom / 100;
  
  if (attractor.x.length === 0) {
    attractor.x.push(0.1);
    attractor.y.push(0);
    attractor.z.push(0);
  }
  
  const sigma = 10;
  const rho = 28;
  const beta = 8/3;
  const dt = 0.005 * speed;
  
  for (let i = 0; i < 20; i++) {
    const x = attractor.x[attractor.x.length - 1];
    const y = attractor.y[attractor.y.length - 1];
    const z = attractor.z[attractor.z.length - 1];
    
    const dx = sigma * (y - x) * dt;
    const dy = (x * (rho - z) - y) * dt;
    const dz = (x * y - beta * z) * dt;
    
    attractor.x.push(x + dx);
    attractor.y.push(y + dy);
    attractor.z.push(z + dz);
  }
  
  if (attractor.x.length > 2000) {
    attractor.x = attractor.x.slice(-2000);
    attractor.y = attractor.y.slice(-2000);
    attractor.z = attractor.z.slice(-2000);
  }
  
  simCtx.beginPath();
  for (let i = 0; i < attractor.x.length; i++) {
    const scale = 8 * zoomFactor;
    const x = cx + attractor.x[i] * scale;
    const y = cy + attractor.z[i] * scale - 150 * zoomFactor;
    
    if (i === 0) simCtx.moveTo(x, y);
    else simCtx.lineTo(x, y);
  }
  
  const gradient = simCtx.createLinearGradient(0, 0, simCanvas.width, simCanvas.height);
  gradient.addColorStop(0, `hsl(${params.hue}, 100%, 50%)`);
  gradient.addColorStop(0.5, `hsl(${params.hue + 60}, 100%, 50%)`);
  gradient.addColorStop(1, `hsl(${params.hue + 120}, 100%, 50%)`);
  
  simCtx.strokeStyle = gradient;
  simCtx.lineWidth = 1.5;
  simCtx.shadowColor = getGlowColor();
  simCtx.shadowBlur = 10;
  simCtx.stroke();
}

function sim12_PulsingSacredGeometry() {
  const cx = simCanvas.width / 2;
  const cy = simCanvas.height / 2;
  const speed = params.speed / 800;
  const zoomFactor = params.zoom / 100;
  
  const pulse = Math.sin(time * speed * 0.3) * 0.3 + 1;
  const rotation = time * speed * 0.05;
  
  for (let layer = 0; layer < 6; layer++) {
    const radius = (50 + layer * 35) * zoomFactor * pulse;
    const sides = 6;
    const layerRotation = rotation + layer * Math.PI / 12;
    
    simCtx.beginPath();
    for (let i = 0; i <= sides; i++) {
      const angle = (i / sides) * Math.PI * 2 + layerRotation;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      if (i === 0) simCtx.moveTo(x, y);
      else simCtx.lineTo(x, y);
    }
    
    const hue = params.hue + layer * 20;
    simCtx.strokeStyle = `hsla(${hue}, 100%, 50%, ${0.9 - layer * 0.1})`;
    simCtx.lineWidth = 2;
    simCtx.shadowColor = `hsla(${hue}, 100%, 70%, 0.6)`;
    simCtx.shadowBlur = 15;
    simCtx.stroke();
    
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2 + layerRotation;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      
      simCtx.beginPath();
      simCtx.moveTo(cx, cy);
      simCtx.lineTo(x, y);
      simCtx.strokeStyle = `hsla(${hue + 30}, 100%, 50%, 0.3)`;
      simCtx.lineWidth = 1;
      simCtx.stroke();
    }
  }
  
  const coreRadius = 20 * zoomFactor * pulse;
  const coreGradient = simCtx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius);
  coreGradient.addColorStop(0, `hsla(${params.hue + 60}, 100%, 80%, 0.9)`);
  coreGradient.addColorStop(1, `hsla(${params.hue}, 100%, 50%, 0)`);
  simCtx.beginPath();
  simCtx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
  simCtx.fillStyle = coreGradient;
  simCtx.fill();
}

function sim13_ElectricPlasma() {
  const cx = simCanvas.width / 2;
  const cy = simCanvas.height / 2;
  const speed = params.speed / 400;
  const zoomFactor = params.zoom / 100;
  
  if (time % 5 === 0 || lightningBolts.length < 8) {
    const angle = Math.random() * Math.PI * 2;
    const startX = cx + Math.cos(angle) * 50 * zoomFactor;
    const startY = cy + Math.sin(angle) * 50 * zoomFactor;
    const endX = cx + Math.cos(angle) * 250 * zoomFactor;
    const endY = cy + Math.sin(angle) * 250 * zoomFactor;
    
    const points = [{ x: startX, y: startY }];
    const segments = 8 + Math.floor(Math.random() * 5);
    
    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const baseX = startX + (endX - startX) * t;
      const baseY = startY + (endY - startY) * t;
      const offset = (Math.random() - 0.5) * 60 * zoomFactor * (1 - t);
      const perpX = -(endY - startY) / Math.hypot(endX - startX, endY - startY);
      const perpY = (endX - startX) / Math.hypot(endX - startX, endY - startY);
      points.push({ x: baseX + perpX * offset, y: baseY + perpY * offset });
    }
    
    lightningBolts.push({ points, age: 0, hue: Math.random() * 60 });
  }
  
  for (let i = lightningBolts.length - 1; i >= 0; i--) {
    const bolt = lightningBolts[i];
    bolt.age++;
    if (bolt.age > 20) {
      lightningBolts.splice(i, 1);
      continue;
    }
    
    const alpha = 1 - bolt.age / 20;
    simCtx.beginPath();
    bolt.points.forEach((p, idx) => {
      if (idx === 0) simCtx.moveTo(p.x, p.y);
      else simCtx.lineTo(p.x, p.y);
    });
    
    simCtx.strokeStyle = `hsla(${params.hue + bolt.hue}, 100%, 70%, ${alpha})`;
    simCtx.lineWidth = 3 * alpha;
    simCtx.shadowColor = `hsla(${params.hue + bolt.hue}, 100%, 80%, ${alpha})`;
    simCtx.shadowBlur = 25;
    simCtx.stroke();
  }
  
  const coreGradient = simCtx.createRadialGradient(cx, cy, 0, cx, cy, 60 * zoomFactor);
  coreGradient.addColorStop(0, `hsla(${params.hue + 30}, 100%, 90%, 0.8)`);
  coreGradient.addColorStop(0.5, `hsla(${params.hue}, 100%, 60%, 0.3)`);
  coreGradient.addColorStop(1, `hsla(${params.hue}, 100%, 50%, 0)`);
  simCtx.beginPath();
  simCtx.arc(cx, cy, 60 * zoomFactor, 0, Math.PI * 2);
  simCtx.fillStyle = coreGradient;
  simCtx.fill();
}

function sim14_InfiniteZoom() {
  const cx = simCanvas.width / 2;
  const cy = simCanvas.height / 2;
  const speed = params.speed / 600;
  const zoomFactor = params.zoom / 100;
  
  const numLayers = 12;
  const baseZoom = (time * speed * 0.1) % 1;
  
  for (let layer = 0; layer < numLayers; layer++) {
    const layerZoom = ((baseZoom + layer / numLayers) % 1);
    const scale = Math.pow(2, layerZoom * 3) * zoomFactor * 20;
    const alpha = Math.sin(layerZoom * Math.PI) * 0.8;
    
    if (alpha < 0.05) continue;
    
    const sides = 5 + (layer % 3);
    const rotation = time * speed * 0.02 * (layer % 2 === 0 ? 1 : -1);
    
    simCtx.beginPath();
    for (let i = 0; i <= sides; i++) {
      const angle = (i / sides) * Math.PI * 2 + rotation + layer * 0.2;
      const x = cx + scale * Math.cos(angle);
      const y = cy + scale * Math.sin(angle);
      if (i === 0) simCtx.moveTo(x, y);
      else simCtx.lineTo(x, y);
    }
    
    const hue = params.hue + layer * 25;
    simCtx.strokeStyle = `hsla(${hue}, 100%, 55%, ${alpha})`;
    simCtx.lineWidth = 2 + (1 - layerZoom) * 2;
    simCtx.shadowColor = `hsla(${hue}, 100%, 70%, ${alpha * 0.7})`;
    simCtx.shadowBlur = 15;
    simCtx.stroke();
  }
}

function sim15_BioLuminescence() {
  const speed = params.speed / 500;
  const zoomFactor = params.zoom / 100;
  
  while (jellyfish.length < 15) {
    jellyfish.push({
      x: Math.random() * simCanvas.width,
      y: Math.random() * simCanvas.height,
      size: 20 + Math.random() * 40,
      phase: Math.random() * Math.PI * 2,
      hue: Math.random() * 60,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -0.5 - Math.random() * 0.5,
      tentacles: 5 + Math.floor(Math.random() * 4)
    });
  }
  
  jellyfish.forEach(j => {
    j.x += j.vx * speed;
    j.y += j.vy * speed;
    j.phase += speed * 0.05;
    
    if (j.y < -100) { j.y = simCanvas.height + 50; j.x = Math.random() * simCanvas.width; }
    if (j.x < -50) j.x = simCanvas.width + 50;
    if (j.x > simCanvas.width + 50) j.x = -50;
    
    const pulse = Math.sin(j.phase) * 0.3 + 1;
    const bodySize = j.size * zoomFactor * pulse;
    
    const gradient = simCtx.createRadialGradient(j.x, j.y, 0, j.x, j.y, bodySize);
    gradient.addColorStop(0, `hsla(${params.hue + j.hue}, 100%, 70%, 0.8)`);
    gradient.addColorStop(0.5, `hsla(${params.hue + j.hue + 20}, 100%, 50%, 0.5)`);
    gradient.addColorStop(1, `hsla(${params.hue + j.hue}, 100%, 40%, 0)`);
    
    simCtx.beginPath();
    simCtx.arc(j.x, j.y, bodySize, Math.PI, 0);
    simCtx.quadraticCurveTo(j.x + bodySize, j.y + bodySize * 0.3, j.x, j.y + bodySize * 0.5);
    simCtx.quadraticCurveTo(j.x - bodySize, j.y + bodySize * 0.3, j.x - bodySize, j.y);
    simCtx.fillStyle = gradient;
    simCtx.shadowColor = `hsla(${params.hue + j.hue}, 100%, 80%, 0.8)`;
    simCtx.shadowBlur = 30;
    simCtx.fill();
    
    for (let t = 0; t < j.tentacles; t++) {
      const tentacleX = j.x + (t - (j.tentacles - 1) / 2) * (bodySize * 0.4);
      simCtx.beginPath();
      simCtx.moveTo(tentacleX, j.y + bodySize * 0.3);
      
      const segments = 5;
      let px = tentacleX;
      let py = j.y + bodySize * 0.3;
      for (let s = 1; s <= segments; s++) {
        const wave = Math.sin(j.phase + s * 0.5 + t) * 10;
        px = tentacleX + wave;
        py += bodySize * 0.4;
        simCtx.lineTo(px, py);
      }
      
      simCtx.strokeStyle = `hsla(${params.hue + j.hue + 10}, 100%, 60%, 0.6)`;
      simCtx.lineWidth = 2;
      simCtx.stroke();
    }
  });
}

function sim16_DNAHelix() {
  const cx = simCanvas.width / 2;
  const cy = simCanvas.height / 2;
  const speed = params.speed / 600;
  const zoomFactor = params.zoom / 100;
  
  const helixHeight = simCanvas.height * 0.8;
  const helixRadius = 80 * zoomFactor;
  const numPoints = 60;
  const rotation = time * speed * 0.1;
  
  const strand1 = [];
  const strand2 = [];
  
  for (let i = 0; i < numPoints; i++) {
    const t = i / numPoints;
    const y = cy - helixHeight / 2 + t * helixHeight;
    const angle1 = t * Math.PI * 4 + rotation;
    const angle2 = angle1 + Math.PI;
    
    const z1 = Math.sin(angle1);
    const z2 = Math.sin(angle2);
    
    strand1.push({
      x: cx + Math.cos(angle1) * helixRadius,
      y: y,
      z: z1,
      t: t
    });
    
    strand2.push({
      x: cx + Math.cos(angle2) * helixRadius,
      y: y,
      z: z2,
      t: t
    });
  }
  
  for (let i = 0; i < numPoints; i += 4) {
    const p1 = strand1[i];
    const p2 = strand2[i];
    const avgZ = (p1.z + p2.z) / 2;
    const alpha = 0.3 + avgZ * 0.2;
    
    simCtx.beginPath();
    simCtx.moveTo(p1.x, p1.y);
    simCtx.lineTo(p2.x, p2.y);
    simCtx.strokeStyle = `hsla(${params.hue + 60}, 100%, 50%, ${alpha})`;
    simCtx.lineWidth = 2;
    simCtx.stroke();
    
    simCtx.beginPath();
    simCtx.arc((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, 4, 0, Math.PI * 2);
    simCtx.fillStyle = `hsla(${params.hue + 120}, 100%, 60%, ${alpha})`;
    simCtx.fill();
  }
  
  [strand1, strand2].forEach((strand, idx) => {
    simCtx.beginPath();
    strand.forEach((p, i) => {
      if (i === 0) simCtx.moveTo(p.x, p.y);
      else simCtx.lineTo(p.x, p.y);
    });
    
    const hue = params.hue + idx * 40;
    simCtx.strokeStyle = `hsl(${hue}, 100%, 55%)`;
    simCtx.lineWidth = 4;
    simCtx.shadowColor = `hsla(${hue}, 100%, 70%, 0.7)`;
    simCtx.shadowBlur = 15;
    simCtx.stroke();
    
    strand.forEach(p => {
      const size = 5 + p.z * 2;
      const alpha = 0.6 + p.z * 0.3;
      simCtx.beginPath();
      simCtx.arc(p.x, p.y, size, 0, Math.PI * 2);
      simCtx.fillStyle = `hsla(${hue + 20}, 100%, 60%, ${alpha})`;
      simCtx.fill();
    });
  });
}

const simulations = [
  sim0_EvolvingStarFractal,
  sim1_HyperspaceWeb,
  sim2_LissajousCascade,
  sim3_MagneticFieldTracer,
  sim4_AsymmetricOrbitals,
  sim5_ReactionDiffusionRing,
  sim6_NeuralNetwork,
  sim7_FlockingSwarm,
  sim8_FractalTree,
  sim9_GalaxySpiral,
  sim10_QuantumWave,
  sim11_StrangeAttractor,
  sim12_PulsingSacredGeometry,
  sim13_ElectricPlasma,
  sim14_InfiniteZoom,
  sim15_BioLuminescence,
  sim16_DNAHelix
];

window.selectSimulation = function(index) {
  if (index >= 0 && index < simulations.length) {
    document.querySelectorAll('.sim-btn').forEach(b => b.classList.remove('active'));
    const targetBtn = document.querySelector(`.sim-btn[data-sim="${index}"]`);
    if (targetBtn) targetBtn.classList.add('active');
    currentSim = index;
    time = 0;
    resetSimulationState();
    simCtx.fillStyle = 'rgba(0, 0, 0, 1)';
    simCtx.fillRect(0, 0, simCanvas.width, simCanvas.height);
  }
};

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
