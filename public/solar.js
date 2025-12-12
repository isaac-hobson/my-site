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
  showTrails: false,
  viewAngle: 0,
  time: 0,
  animationId: null,
  
  audioPlayer: null,
  isAudioPlaying: false,
  currentTrack: 'the-intangible',
  volume: 0.5,
  
  currentTheme: 'green',
  themes: {
    green: { primary: '#00DD00', glow: '#33FF33', dark: '#003300' },
    blue: { primary: '#00AAFF', glow: '#33CCFF', dark: '#002244' },
    purple: { primary: '#AA00FF', glow: '#CC33FF', dark: '#220044' },
    red: { primary: '#FF0044', glow: '#FF3366', dark: '#440011' },
    gold: { primary: '#FFAA00', glow: '#FFCC33', dark: '#442200' }
  },
  
  tracks: {
    'the-intangible': { file: './music/the-intangible.mp3', name: 'The Intangible' },
    'spooky-ufo': { file: './music/spooky-ufo.mp3', name: 'Spooky UFO' },
    'yellow-brick-road': { file: './music/yellow-brick-road.mp3', name: 'Yellow Brick Road' },
    'clubbed-to-death': { file: './music/clubbed-to-death.mp3', name: 'Clubbed to Death' }
  },
  
  settings: {
    orbitSpeed: 50,
    planetScale: 100,
    orbitScale: 100,
    starDensity: 200,
    rotationSpeed: 20
  },
  
  stars: [],
  matrixDrops: [],
  asteroids: [],
  planetTrails: {},
  
  planetInfo: {
    Mercury: { size: '4,879 km', distance: '57.9M km', year: '88 days', fact: 'Smallest planet, extreme temperatures from -180°C to 430°C' },
    Venus: { size: '12,104 km', distance: '108.2M km', year: '225 days', fact: 'Hottest planet at 465°C, rotates backwards' },
    Earth: { size: '12,742 km', distance: '149.6M km', year: '365 days', fact: 'Only known planet with life, 71% covered in water' },
    Mars: { size: '6,779 km', distance: '227.9M km', year: '687 days', fact: 'Has the largest volcano in the solar system: Olympus Mons' },
    Jupiter: { size: '139,820 km', distance: '778.5M km', year: '12 years', fact: 'Largest planet, Great Red Spot is a 400-year-old storm' },
    Saturn: { size: '116,460 km', distance: '1.43B km', year: '29 years', fact: 'Has 83 known moons, rings made of ice and rock' },
    Uranus: { size: '50,724 km', distance: '2.87B km', year: '84 years', fact: 'Rotates on its side, coldest atmosphere at -224°C' },
    Neptune: { size: '49,244 km', distance: '4.5B km', year: '165 years', fact: 'Strongest winds in solar system at 2,100 km/h' },
    Sun: { size: '1,392,700 km', distance: '0 km', year: 'N/A', fact: 'Contains 99.86% of all mass in the solar system' },
    Moon: { size: '3,474 km', distance: '384,400 km from Earth', year: '27.3 days', fact: 'Only natural satellite of Earth, affects ocean tides' }
  },
  
  planets: [
    { name: 'Mercury', color: '#B5B5B5', orbitRadius: 0.1, size: 4, speed: 4.15, angle: Math.random() * Math.PI * 2 },
    { name: 'Venus', color: '#E6C35C', orbitRadius: 0.15, size: 6, speed: 1.62, angle: Math.random() * Math.PI * 2 },
    { name: 'Earth', color: '#4A90D9', orbitRadius: 0.2, size: 6.5, speed: 1, angle: Math.random() * Math.PI * 2, hasMoon: true },
    { name: 'Mars', color: '#D94A2B', orbitRadius: 0.27, size: 5, speed: 0.53, angle: Math.random() * Math.PI * 2 },
    { name: 'Jupiter', color: '#D4A574', orbitRadius: 0.4, size: 14, speed: 0.084, angle: Math.random() * Math.PI * 2 },
    { name: 'Saturn', color: '#F4D59E', orbitRadius: 0.52, size: 12, speed: 0.034, angle: Math.random() * Math.PI * 2, hasRing: true },
    { name: 'Uranus', color: '#72CFC4', orbitRadius: 0.62, size: 9, speed: 0.012, angle: Math.random() * Math.PI * 2 },
    { name: 'Neptune', color: '#4169E1', orbitRadius: 0.72, size: 8.5, speed: 0.006, angle: Math.random() * Math.PI * 2 }
  ],
  
  moonAngle: 0,
  
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
    this.generateAsteroids();
    this.initPlanetTrails();
    this.setupControls();
    this.setupAudio();
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
    this.generateAsteroids();
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
  
  generateAsteroids() {
    this.asteroids = [];
    const count = 150;
    
    for (let i = 0; i < count; i++) {
      const baseRadius = 0.32 + Math.random() * 0.06;
      this.asteroids.push({
        orbitRadius: baseRadius,
        angle: Math.random() * Math.PI * 2,
        size: Math.random() * 2 + 1,
        speed: 0.2 + Math.random() * 0.1,
        brightness: 0.3 + Math.random() * 0.4
      });
    }
  },
  
  initPlanetTrails() {
    this.planets.forEach(planet => {
      this.planetTrails[planet.name] = [];
    });
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
  
  setupAudio() {
    this.audioPlayer = new Audio();
    this.audioPlayer.loop = true;
    this.audioPlayer.volume = this.volume;
    this.audioPlayer.src = this.tracks[this.currentTrack].file;
    
    this.audioPlayer.addEventListener('canplaythrough', () => {
      console.log('Audio ready');
    });
    
    this.audioPlayer.addEventListener('ended', () => {
      this.audioPlayer.currentTime = 0;
      this.audioPlayer.play();
    });
  },
  
  setupControls() {
    const playPauseBtn = document.getElementById('play-pause-btn');
    const rotateViewBtn = document.getElementById('rotate-view-btn');
    const matrixBtn = document.getElementById('matrix-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsPanel = document.getElementById('settings-panel');
    const closeSettings = document.getElementById('close-settings');
    const resetSettings = document.getElementById('reset-settings');
    const screenshotBtn = document.getElementById('screenshot-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const trailsToggle = document.getElementById('trails-toggle');
    const themeSelect = document.getElementById('theme-select');
    const musicPlayBtn = document.getElementById('music-play-btn');
    const musicSelect = document.getElementById('music-select');
    const volumeSlider = document.getElementById('volume-slider');
    const planetInfoClose = document.getElementById('planet-info-close');
    
    playPauseBtn.addEventListener('click', () => this.togglePlayPause());
    rotateViewBtn.addEventListener('click', () => this.toggleViewRotation());
    matrixBtn.addEventListener('click', () => this.toggleMatrix());
    settingsBtn.addEventListener('click', () => settingsPanel.classList.toggle('hidden'));
    closeSettings.addEventListener('click', () => settingsPanel.classList.add('hidden'));
    resetSettings.addEventListener('click', () => this.resetSettings());
    screenshotBtn.addEventListener('click', () => this.takeScreenshot());
    fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    planetInfoClose.addEventListener('click', () => this.hidePlanetInfo());
    
    trailsToggle.addEventListener('click', () => {
      this.showTrails = !this.showTrails;
      trailsToggle.textContent = this.showTrails ? '[ ON ]' : '[ OFF ]';
      trailsToggle.classList.toggle('active', this.showTrails);
      if (!this.showTrails) {
        this.initPlanetTrails();
      }
    });
    
    themeSelect.addEventListener('change', (e) => {
      this.setTheme(e.target.value);
    });
    
    musicPlayBtn.addEventListener('click', () => this.toggleMusic());
    musicSelect.addEventListener('change', (e) => this.changeTrack(e.target.value));
    volumeSlider.addEventListener('input', (e) => {
      this.volume = e.target.value / 100;
      if (this.audioPlayer) {
        this.audioPlayer.volume = this.volume;
      }
    });
    
    this.solarCanvas.addEventListener('click', (e) => this.handleCanvasClick(e));
    
    document.getElementById('planet-info').addEventListener('click', (e) => {
      if (e.target.id === 'planet-info') {
        this.hidePlanetInfo();
      }
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
      } else if (e.code === 'KeyF') {
        this.toggleFullscreen();
      } else if (e.code === 'KeyS') {
        this.takeScreenshot();
      } else if (e.code === 'Escape') {
        settingsPanel.classList.add('hidden');
        this.hidePlanetInfo();
      }
    });
  },
  
  handleCanvasClick(e) {
    const rect = this.solarCanvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const baseRadius = Math.min(this.width, this.height) * 0.4;
    const orbitScaleMultiplier = this.settings.orbitScale / 100;
    const planetScaleMultiplier = this.settings.planetScale / 100;
    const tiltAngle = 0.3;
    
    const sunDist = Math.sqrt(Math.pow(clickX - centerX, 2) + Math.pow(clickY - centerY, 2));
    if (sunDist < 30 * planetScaleMultiplier) {
      this.showPlanetInfo('Sun');
      return;
    }
    
    for (const planet of this.planets) {
      const orbitRadius = baseRadius * planet.orbitRadius * orbitScaleMultiplier;
      const x = centerX + Math.cos(planet.angle + this.viewAngle) * orbitRadius;
      const y = centerY + Math.sin(planet.angle + this.viewAngle) * orbitRadius * Math.cos(tiltAngle);
      const planetSize = planet.size * planetScaleMultiplier * 1.5;
      
      const dist = Math.sqrt(Math.pow(clickX - x, 2) + Math.pow(clickY - y, 2));
      if (dist < planetSize + 10) {
        this.showPlanetInfo(planet.name);
        return;
      }
      
      if (planet.hasMoon) {
        const moonX = x + Math.cos(this.moonAngle) * (planetSize + 15);
        const moonY = y + Math.sin(this.moonAngle) * (planetSize + 15) * 0.5;
        const moonDist = Math.sqrt(Math.pow(clickX - moonX, 2) + Math.pow(clickY - moonY, 2));
        if (moonDist < 10) {
          this.showPlanetInfo('Moon');
          return;
        }
      }
    }
  },
  
  showPlanetInfo(name) {
    const info = this.planetInfo[name];
    if (!info) return;
    
    const panel = document.getElementById('planet-info');
    const nameEl = document.getElementById('planet-info-name');
    const contentEl = document.getElementById('planet-info-content');
    
    nameEl.textContent = name.toUpperCase();
    contentEl.innerHTML = `
      <div class="info-row"><span>Diameter:</span> ${info.size}</div>
      <div class="info-row"><span>Distance:</span> ${info.distance}</div>
      <div class="info-row"><span>Orbit:</span> ${info.year}</div>
      <div class="info-row"><span>Fun Fact:</span> ${info.fact}</div>
    `;
    
    panel.classList.remove('hidden');
  },
  
  hidePlanetInfo() {
    document.getElementById('planet-info').classList.add('hidden');
  },
  
  setTheme(theme) {
    this.currentTheme = theme;
    const colors = this.themes[theme];
    document.documentElement.style.setProperty('--primary-green', colors.primary);
    document.documentElement.style.setProperty('--glow-green', colors.glow);
    document.documentElement.style.setProperty('--dark-green', colors.dark);
  },
  
  toggleMusic() {
    const btn = document.getElementById('music-play-btn');
    
    if (this.isAudioPlaying) {
      this.audioPlayer.pause();
      this.isAudioPlaying = false;
      btn.textContent = '[ PLAY ]';
      btn.classList.remove('audio-btn-playing');
    } else {
      this.audioPlayer.play().then(() => {
        this.isAudioPlaying = true;
        btn.textContent = '[ PAUSE ]';
        btn.classList.add('audio-btn-playing');
      }).catch(err => {
        console.log('Playback error:', err);
        this.showStatusMessage('TAP AGAIN', false);
      });
    }
  },
  
  changeTrack(trackId) {
    const wasPlaying = this.isAudioPlaying;
    
    if (this.isAudioPlaying) {
      this.audioPlayer.pause();
      this.isAudioPlaying = false;
    }
    
    this.currentTrack = trackId;
    this.audioPlayer.src = this.tracks[trackId].file;
    
    const songNameEl = document.getElementById('song-name');
    songNameEl.textContent = '> NOW: ' + this.tracks[trackId].name;
    
    if (wasPlaying) {
      this.audioPlayer.play().then(() => {
        this.isAudioPlaying = true;
      }).catch(err => console.log('Error playing:', err));
    }
  },
  
  takeScreenshot() {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.width;
    tempCanvas.height = this.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCtx.drawImage(this.starCanvas, 0, 0);
    if (this.isMatrixActive) {
      tempCtx.globalAlpha = 0.6;
      tempCtx.drawImage(this.matrixCanvas, 0, 0);
      tempCtx.globalAlpha = 1;
    }
    tempCtx.drawImage(this.solarCanvas, 0, 0);
    
    const link = document.createElement('a');
    link.download = 'solar-system-' + Date.now() + '.png';
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
    
    this.showStatusMessage('SAVED', false);
  },
  
  toggleFullscreen() {
    const btn = document.getElementById('fullscreen-btn');
    
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        btn.textContent = '[ EXIT FULLSCREEN ]';
      }).catch(err => {
        console.log('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        btn.textContent = '[ FULLSCREEN ]';
      });
    }
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
    
    this.showTrails = false;
    document.getElementById('trails-toggle').textContent = '[ OFF ]';
    document.getElementById('trails-toggle').classList.remove('active');
    this.initPlanetTrails();
    
    this.setTheme('green');
    document.getElementById('theme-select').value = 'green';
    
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
    
    const asteroidBeltRadius = baseRadius * 0.34 * orbitScaleMultiplier;
    this.asteroids.forEach(asteroid => {
      const r = baseRadius * asteroid.orbitRadius * orbitScaleMultiplier;
      const x = Math.cos(asteroid.angle + this.viewAngle) * r;
      const y = Math.sin(asteroid.angle + this.viewAngle) * r * Math.cos(tiltAngle);
      
      this.solarCtx.beginPath();
      this.solarCtx.arc(x, y, asteroid.size, 0, Math.PI * 2);
      this.solarCtx.fillStyle = `rgba(150, 140, 130, ${asteroid.brightness})`;
      this.solarCtx.fill();
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
    
    if (this.showTrails) {
      this.planets.forEach(planet => {
        const trail = this.planetTrails[planet.name];
        if (trail.length > 1) {
          this.solarCtx.beginPath();
          this.solarCtx.moveTo(trail[0].x, trail[0].y);
          
          for (let i = 1; i < trail.length; i++) {
            this.solarCtx.lineTo(trail[i].x, trail[i].y);
          }
          
          this.solarCtx.strokeStyle = planet.color + '60';
          this.solarCtx.lineWidth = 2;
          this.solarCtx.stroke();
        }
      });
    }
    
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
      
      if (this.showTrails && !this.isPaused) {
        const trail = this.planetTrails[planet.name];
        trail.push({ x, y });
        if (trail.length > 60) {
          trail.shift();
        }
      }
      
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
      
      if (planet.hasMoon) {
        const moonDistance = adjustedSize + 15;
        const moonX = x + Math.cos(this.moonAngle) * moonDistance;
        const moonY = y + Math.sin(this.moonAngle) * moonDistance * 0.5;
        const moonSize = 3 * planetScaleMultiplier;
        
        this.solarCtx.beginPath();
        this.solarCtx.arc(moonX, moonY, moonSize, 0, Math.PI * 2);
        this.solarCtx.fillStyle = '#AAAAAA';
        this.solarCtx.fill();
      }
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
    
    this.asteroids.forEach(asteroid => {
      asteroid.angle += (asteroid.speed * speedMultiplier * 0.005);
    });
    
    this.moonAngle += speedMultiplier * 0.1;
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
