const SolarSystem = {
  starCanvas: null,
  starCtx: null,
  matrixCanvas: null,
  matrixCtx: null,
  solarCanvas: null,
  solarCtx: null,
  
  isPaused: false,
  isRotatingView: false,
  isMatrixActive: false,
  viewAngle: 0,
  time: 0,
  animationId: null,
  audioPlayer: null,
  isAudioPlaying: false,
  
  settings: {
    orbitSpeed: 50,
    planetScale: 100,
    orbitScale: 100,
    starDensity: 200,
    rotationSpeed: 20
  },
  
  stars: [],
  matrixDrops: [],
  
  planets: [
    { name: 'Mercury', color: '#B5B5B5', orbitRadius: 0.1, size: 4, speed: 4.15, angle: Math.random() * Math.PI * 2 },
    { name: 'Venus', color: '#E6C35C', orbitRadius: 0.15, size: 6, speed: 1.62, angle: Math.random() * Math.PI * 2 },
    { name: 'Earth', color: '#4A90D9', orbitRadius: 0.2, size: 6.5, speed: 1, angle: Math.random() * Math.PI * 2 },
    { name: 'Mars', color: '#D94A2B', orbitRadius: 0.27, size: 5, speed: 0.53, angle: Math.random() * Math.PI * 2 },
    { name: 'Jupiter', color: '#D4A574', orbitRadius: 0.4, size: 14, speed: 0.084, angle: Math.random() * Math.PI * 2 },
    { name: 'Saturn', color: '#F4D59E', orbitRadius: 0.52, size: 12, speed: 0.034, angle: Math.random() * Math.PI * 2, hasRing: true },
    { name: 'Uranus', color: '#72CFC4', orbitRadius: 0.62, size: 9, speed: 0.012, angle: Math.random() * Math.PI * 2 },
    { name: 'Neptune', color: '#4169E1', orbitRadius: 0.72, size: 8.5, speed: 0.006, angle: Math.random() * Math.PI * 2 }
  ],
  
  init() {
    this.starCanvas = document.getElementById('star-canvas');
    this.starCtx = this.starCanvas.getContext('2d');
    this.matrixCanvas = document.getElementById('matrix-canvas');
    this.matrixCtx = this.matrixCanvas.getContext('2d');
    this.solarCanvas = document.getElementById('solar-canvas');
    this.solarCtx = this.solarCanvas.getContext('2d');
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    this.generateStars();
    this.initMatrixDrops();
    this.setupControls();
    this.animate();
  },
  
  resize() {
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    [this.starCanvas, this.matrixCanvas, this.solarCanvas].forEach(canvas => {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      canvas.getContext('2d').scale(dpr, dpr);
    });
    
    this.width = width;
    this.height = height;
    
    this.generateStars();
    this.initMatrixDrops();
  },
  
  generateStars() {
    this.stars = [];
    const count = Math.floor((this.width * this.height) / 10000 * (this.settings.starDensity / 100));
    
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2 + 0.5,
        brightness: Math.random(),
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinkleOffset: Math.random() * Math.PI * 2
      });
    }
  },
  
  initMatrixDrops() {
    this.matrixDrops = [];
    const columns = Math.floor(this.width / 20);
    
    for (let i = 0; i < columns; i++) {
      this.matrixDrops.push({
        x: i * 20,
        y: Math.random() * -this.height,
        speed: Math.random() * 5 + 3,
        chars: []
      });
      
      const charCount = Math.floor(Math.random() * 15) + 10;
      for (let j = 0; j < charCount; j++) {
        this.matrixDrops[i].chars.push(this.getRandomChar());
      }
    }
  },
  
  getRandomChar() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';
    return chars[Math.floor(Math.random() * chars.length)];
  },
  
  setupControls() {
    const playPauseBtn = document.getElementById('play-pause-btn');
    const rotateViewBtn = document.getElementById('rotate-view-btn');
    const matrixBtn = document.getElementById('matrix-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsPanel = document.getElementById('settings-panel');
    const closeSettings = document.getElementById('close-settings');
    const resetSettings = document.getElementById('reset-settings');
    const uploadAudioBtn = document.getElementById('upload-audio-btn');
    const audioUpload = document.getElementById('audio-upload');
    const audioPlayBtn = document.getElementById('audio-play-btn');
    
    this.audioPlayer = document.getElementById('audio-player');
    
    playPauseBtn.addEventListener('click', () => this.togglePlayPause());
    rotateViewBtn.addEventListener('click', () => this.toggleViewRotation());
    matrixBtn.addEventListener('click', () => this.toggleMatrix());
    settingsBtn.addEventListener('click', () => settingsPanel.classList.toggle('hidden'));
    closeSettings.addEventListener('click', () => settingsPanel.classList.add('hidden'));
    resetSettings.addEventListener('click', () => this.resetSettings());
    
    uploadAudioBtn.addEventListener('click', () => audioUpload.click());
    audioUpload.addEventListener('change', (e) => this.handleAudioUpload(e));
    audioPlayBtn.addEventListener('click', () => this.toggleAudio());
    
    this.audioPlayer.addEventListener('ended', () => {
      this.isAudioPlaying = false;
      audioPlayBtn.textContent = '[ PLAY MUSIC ]';
      audioPlayBtn.classList.remove('audio-btn-playing');
    });
    
    const sliders = ['orbit-speed', 'planet-scale', 'orbit-scale', 'star-density', 'rotation-speed'];
    sliders.forEach(id => {
      const slider = document.getElementById(id);
      const valueSpan = document.getElementById(id + '-val');
      
      slider.addEventListener('input', () => {
        const value = parseInt(slider.value);
        valueSpan.textContent = value;
        
        const key = id.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        this.settings[key] = value;
        
        if (id === 'star-density') {
          this.generateStars();
        }
      });
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.togglePlayPause();
      } else if (e.code === 'KeyR') {
        this.toggleViewRotation();
      } else if (e.code === 'KeyM') {
        this.toggleMatrix();
      } else if (e.code === 'Escape') {
        settingsPanel.classList.add('hidden');
      }
    });
  },
  
  togglePlayPause() {
    this.isPaused = !this.isPaused;
    const btn = document.getElementById('play-pause-btn');
    btn.textContent = this.isPaused ? '[ PLAY ]' : '[ PAUSE ]';
    btn.classList.toggle('active', this.isPaused);
  },
  
  toggleViewRotation() {
    this.isRotatingView = !this.isRotatingView;
    const btn = document.getElementById('rotate-view-btn');
    btn.textContent = this.isRotatingView ? '[ ROTATE VIEW: ON ]' : '[ ROTATE VIEW: OFF ]';
    btn.classList.toggle('active', this.isRotatingView);
  },
  
  toggleMatrix() {
    this.isMatrixActive = !this.isMatrixActive;
    const btn = document.getElementById('matrix-btn');
    const matrixCanvas = document.getElementById('matrix-canvas');
    
    btn.classList.toggle('active', this.isMatrixActive);
    matrixCanvas.classList.toggle('active', this.isMatrixActive);
    
    this.showStatusMessage(this.isMatrixActive ? 'ACTIVATED' : 'DEACTIVATED', this.isMatrixActive);
  },
  
  showStatusMessage(text, isActivated) {
    const msgEl = document.getElementById('status-message');
    msgEl.textContent = text;
    msgEl.classList.toggle('red', isActivated);
    msgEl.classList.add('show');
    
    setTimeout(() => {
      msgEl.classList.remove('show');
    }, 1500);
  },
  
  handleAudioUpload(e) {
    const file = e.target.files[0];
    if (file) {
      if (this.isAudioPlaying) {
        this.audioPlayer.pause();
        this.isAudioPlaying = false;
      }
      
      const url = URL.createObjectURL(file);
      this.audioPlayer.src = url;
      
      const audioPlayBtn = document.getElementById('audio-play-btn');
      audioPlayBtn.classList.remove('hidden');
      audioPlayBtn.classList.remove('audio-btn-playing');
      audioPlayBtn.textContent = '[ PLAY MUSIC ]';
      
      this.showStatusMessage('LOADED', false);
    }
  },
  
  toggleAudio() {
    const audioPlayBtn = document.getElementById('audio-play-btn');
    
    if (this.isAudioPlaying) {
      this.audioPlayer.pause();
      this.isAudioPlaying = false;
      audioPlayBtn.textContent = '[ PLAY MUSIC ]';
      audioPlayBtn.classList.remove('audio-btn-playing');
    } else {
      const playPromise = this.audioPlayer.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.isAudioPlaying = true;
          audioPlayBtn.textContent = '[ PAUSE MUSIC ]';
          audioPlayBtn.classList.add('audio-btn-playing');
        }).catch((err) => {
          console.log('Playback failed:', err.name, err.message);
          if (err.name === 'NotAllowedError') {
            this.audioPlayer.muted = true;
            this.audioPlayer.play().then(() => {
              this.audioPlayer.muted = false;
              this.isAudioPlaying = true;
              audioPlayBtn.textContent = '[ PAUSE MUSIC ]';
              audioPlayBtn.classList.add('audio-btn-playing');
            }).catch(() => {
              this.showStatusMessage('TAP TO PLAY', false);
            });
          } else {
            this.showStatusMessage('PLAY ERROR', true);
          }
        });
      }
    }
  },
  
  resetSettings() {
    this.settings = {
      orbitSpeed: 50,
      planetScale: 100,
      orbitScale: 100,
      starDensity: 200,
      rotationSpeed: 20
    };
    
    document.getElementById('orbit-speed').value = 50;
    document.getElementById('orbit-speed-val').textContent = '50';
    document.getElementById('planet-scale').value = 100;
    document.getElementById('planet-scale-val').textContent = '100';
    document.getElementById('orbit-scale').value = 100;
    document.getElementById('orbit-scale-val').textContent = '100';
    document.getElementById('star-density').value = 200;
    document.getElementById('star-density-val').textContent = '200';
    document.getElementById('rotation-speed').value = 20;
    document.getElementById('rotation-speed-val').textContent = '20';
    
    this.generateStars();
  },
  
  drawStars() {
    this.starCtx.fillStyle = '#000000';
    this.starCtx.fillRect(0, 0, this.width, this.height);
    
    this.stars.forEach(star => {
      const twinkle = Math.sin(this.time * star.twinkleSpeed + star.twinkleOffset) * 0.5 + 0.5;
      const alpha = star.brightness * 0.5 + twinkle * 0.5;
      
      this.starCtx.beginPath();
      this.starCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.starCtx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      this.starCtx.fill();
      
      if (star.size > 1.5 && twinkle > 0.7) {
        this.starCtx.beginPath();
        this.starCtx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
        this.starCtx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
        this.starCtx.fill();
      }
    });
  },
  
  drawMatrix() {
    if (!this.isMatrixActive) return;
    
    this.matrixCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.matrixCtx.fillRect(0, 0, this.width, this.height);
    
    this.matrixCtx.font = '16px VT323';
    
    this.matrixDrops.forEach(drop => {
      drop.chars.forEach((char, i) => {
        const y = drop.y + i * 20;
        
        if (y > 0 && y < this.height) {
          const alpha = 1 - (i / drop.chars.length);
          if (i === 0) {
            this.matrixCtx.fillStyle = '#FF6666';
          } else {
            this.matrixCtx.fillStyle = `rgba(255, 0, 51, ${alpha * 0.8})`;
          }
          this.matrixCtx.fillText(char, drop.x, y);
        }
      });
      
      if (!this.isPaused) {
        drop.y += drop.speed;
        
        if (drop.y > this.height + drop.chars.length * 20) {
          drop.y = Math.random() * -500 - 100;
          drop.chars = drop.chars.map(() => this.getRandomChar());
        }
        
        if (Math.random() < 0.05) {
          const idx = Math.floor(Math.random() * drop.chars.length);
          drop.chars[idx] = this.getRandomChar();
        }
      }
    });
  },
  
  drawSolarSystem() {
    this.solarCtx.clearRect(0, 0, this.width, this.height);
    
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const baseRadius = Math.min(this.width, this.height) * 0.4;
    const orbitScaleMultiplier = this.settings.orbitScale / 100;
    const planetScaleMultiplier = this.settings.planetScale / 100;
    
    this.solarCtx.save();
    this.solarCtx.translate(centerX, centerY);
    
    if (this.isRotatingView && !this.isPaused) {
      this.viewAngle += this.settings.rotationSpeed * 0.0005;
    }
    
    const tiltAngle = 0.3;
    
    this.planets.forEach(planet => {
      const orbitRadius = baseRadius * planet.orbitRadius * orbitScaleMultiplier;
      
      this.solarCtx.beginPath();
      this.solarCtx.ellipse(0, 0, orbitRadius, orbitRadius * Math.cos(tiltAngle), this.viewAngle, 0, Math.PI * 2);
      this.solarCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      this.solarCtx.lineWidth = 1;
      this.solarCtx.stroke();
    });
    
    const sunSize = 25 * planetScaleMultiplier;
    const sunGradient = this.solarCtx.createRadialGradient(0, 0, 0, 0, 0, sunSize * 2);
    sunGradient.addColorStop(0, '#FFFF00');
    sunGradient.addColorStop(0.3, '#FFCC00');
    sunGradient.addColorStop(0.6, '#FF9900');
    sunGradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
    
    this.solarCtx.beginPath();
    this.solarCtx.arc(0, 0, sunSize * 2, 0, Math.PI * 2);
    this.solarCtx.fillStyle = sunGradient;
    this.solarCtx.fill();
    
    this.solarCtx.beginPath();
    this.solarCtx.arc(0, 0, sunSize, 0, Math.PI * 2);
    this.solarCtx.fillStyle = '#FFDD44';
    this.solarCtx.fill();
    
    this.solarCtx.shadowBlur = 30;
    this.solarCtx.shadowColor = '#FFAA00';
    this.solarCtx.fill();
    this.solarCtx.shadowBlur = 0;
    
    const sortedPlanets = [...this.planets].sort((a, b) => {
      const aY = Math.sin(a.angle + this.viewAngle);
      const bY = Math.sin(b.angle + this.viewAngle);
      return aY - bY;
    });
    
    sortedPlanets.forEach(planet => {
      const orbitRadius = baseRadius * planet.orbitRadius * orbitScaleMultiplier;
      const planetSize = planet.size * planetScaleMultiplier;
      
      const x = Math.cos(planet.angle + this.viewAngle) * orbitRadius;
      const y = Math.sin(planet.angle + this.viewAngle) * orbitRadius * Math.cos(tiltAngle);
      
      const depth = Math.sin(planet.angle + this.viewAngle);
      const scaleFactor = 1 + depth * 0.2;
      const adjustedSize = planetSize * scaleFactor;
      
      if (planet.hasRing) {
        this.solarCtx.save();
        this.solarCtx.translate(x, y);
        
        this.solarCtx.beginPath();
        this.solarCtx.ellipse(0, 0, adjustedSize * 2, adjustedSize * 0.5, 0.3, 0, Math.PI * 2);
        this.solarCtx.strokeStyle = 'rgba(210, 180, 140, 0.6)';
        this.solarCtx.lineWidth = adjustedSize * 0.3;
        this.solarCtx.stroke();
        
        this.solarCtx.restore();
      }
      
      const planetGradient = this.solarCtx.createRadialGradient(
        x - adjustedSize * 0.3, y - adjustedSize * 0.3, 0,
        x, y, adjustedSize
      );
      planetGradient.addColorStop(0, this.lightenColor(planet.color, 40));
      planetGradient.addColorStop(0.7, planet.color);
      planetGradient.addColorStop(1, this.darkenColor(planet.color, 40));
      
      this.solarCtx.beginPath();
      this.solarCtx.arc(x, y, adjustedSize, 0, Math.PI * 2);
      this.solarCtx.fillStyle = planetGradient;
      this.solarCtx.fill();
      
      this.solarCtx.shadowBlur = 10;
      this.solarCtx.shadowColor = planet.color;
      this.solarCtx.fill();
      this.solarCtx.shadowBlur = 0;
    });
    
    this.solarCtx.restore();
  },
  
  lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `rgb(${R}, ${G}, ${B})`;
  },
  
  darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return `rgb(${R}, ${G}, ${B})`;
  },
  
  updatePlanets() {
    if (this.isPaused) return;
    
    const speedMultiplier = this.settings.orbitSpeed / 50;
    
    this.planets.forEach(planet => {
      planet.angle += (planet.speed * speedMultiplier * 0.01);
    });
  },
  
  animate() {
    this.time++;
    
    this.drawStars();
    this.drawMatrix();
    this.updatePlanets();
    this.drawSolarSystem();
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
};

document.addEventListener('DOMContentLoaded', () => SolarSystem.init());
