const SimulatorUI = {
  user: null,
  isPaused: false,
  currentSimulation: 0,
  frameCount: 0,
  lastFpsUpdate: 0,
  
  simulationNames: [
    'Evolving Star Fractal', 'Hyperspace Web', 'Lissajous Cascade',
    'Magnetic Field Tracer', 'Asymmetric Orbitals', 'Reaction-Diffusion Ring',
    'Neural Network', 'Flocking Swarm', 'Fractal Tree', 'Galaxy Spiral',
    'Quantum Wave', 'Strange Attractor', 'Sacred Geometry', 'Electric Plasma',
    'Infinite Zoom', 'Bioluminescence', 'DNA Helix'
  ],
  
  async init() {
    await this.checkAuth();
    this.setupEventListeners();
    this.setupKeyboardShortcuts();
    this.parseUrlParams();
    this.startFpsCounter();
    
    // Initialize first section as expanded
    const sections = document.querySelectorAll('.section-content');
    const headers = document.querySelectorAll('.section-header');
    if (sections.length > 0) {
      sections[0].classList.add('active');
      if (headers.length > 0) headers[0].classList.add('expanded');
    }
  },
  
  async checkAuth() {
    try {
      const res = await fetch('/api/auth/user', { credentials: 'include' });
      if (res.ok) {
        this.user = await res.json();
        document.getElementById('login-prompt')?.classList.add('hidden');
      } else {
        document.getElementById('login-prompt')?.classList.remove('hidden');
      }
    } catch (err) {
      console.log('Not authenticated');
    }
  },
  
  parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const sim = params.get('sim');
    if (sim !== null) {
      const simIndex = parseInt(sim);
      if (simIndex >= 0 && simIndex < this.simulationNames.length) {
        this.selectSimulation(simIndex);
      }
    }
  },
  
  setupEventListeners() {
    const controlToggle = document.getElementById('control-toggle');
    const controlPanel = document.getElementById('control-panel');
    const closePanel = document.getElementById('close-panel');
    
    controlToggle?.addEventListener('click', (e) => {
      e.stopPropagation();
      controlPanel.classList.add('active');
      controlToggle.classList.add('hidden');
    });
    
    closePanel?.addEventListener('click', (e) => {
      e.stopPropagation();
      controlPanel.classList.remove('active');
      controlToggle.classList.remove('hidden');
    });
    
    // Click outside to close the control panel
    document.addEventListener('click', (e) => {
      if (controlPanel.classList.contains('active')) {
        if (!controlPanel.contains(e.target) && e.target !== controlToggle) {
          controlPanel.classList.remove('active');
          controlToggle.classList.remove('hidden');
        }
      }
    });
    
    // Section header toggles - Visual Config, Physical Modifiers, Presets
    const sectionToggles = [
      { btn: 'visual-config-btn', content: 'visual-config' },
      { btn: 'physical-mods-btn', content: 'physical-mods' },
      { btn: 'presets-btn', content: 'presets' }
    ];
    
    sectionToggles.forEach(({ btn, content }) => {
      const button = document.getElementById(btn);
      const section = document.getElementById(content);
      if (button && section) {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          section.classList.toggle('active');
          button.classList.toggle('expanded', section.classList.contains('active'));
        });
      }
    });
    
    document.querySelectorAll('.sim-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const simIndex = parseInt(btn.dataset.sim);
        this.selectSimulation(simIndex);
      });
    });
    
    ['hue', 'decay', 'speed', 'zoom', 'spokes', 'winding'].forEach(id => {
      const input = document.getElementById(id);
      const val = document.getElementById(`${id}-val`);
      input?.addEventListener('input', () => {
        if (val) val.textContent = input.value;
      });
    });
    
    document.getElementById('export-btn')?.addEventListener('click', () => this.showExportModal());
    document.getElementById('export-modal-close')?.addEventListener('click', () => this.hideExportModal());
    document.getElementById('export-download')?.addEventListener('click', () => this.downloadExport());
    
    document.getElementById('save-btn')?.addEventListener('click', () => this.showSaveModal());
    document.getElementById('save-modal-close')?.addEventListener('click', () => this.hideSaveModal());
    document.getElementById('save-form')?.addEventListener('submit', (e) => this.handleSave(e));
    
    document.getElementById('fullscreen-btn')?.addEventListener('click', () => this.toggleFullscreen());
    
    document.getElementById('export-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'export-modal') this.hideExportModal();
    });
    document.getElementById('save-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'save-modal') this.hideSaveModal();
    });
  },
  
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      const key = e.key.toLowerCase();
      
      if (key >= '1' && key <= '9') {
        const simIndex = parseInt(key) - 1;
        if (simIndex < this.simulationNames.length) {
          this.selectSimulation(simIndex);
        }
      } else if (key === 'e') {
        this.showExportModal();
      } else if (key === 's') {
        e.preventDefault();
        this.showSaveModal();
      } else if (key === 'f') {
        this.toggleFullscreen();
      } else if (key === 'm') {
        const panel = document.getElementById('control-panel');
        const toggle = document.getElementById('control-toggle');
        if (panel.classList.contains('active')) {
          panel.classList.remove('active');
          toggle.classList.remove('hidden');
        } else {
          panel.classList.add('active');
          toggle.classList.add('hidden');
        }
      } else if (key === ' ') {
        e.preventDefault();
        this.togglePause();
      }
    });
  },
  
  selectSimulation(index) {
    this.currentSimulation = index;
    
    document.querySelectorAll('.sim-btn').forEach((btn, i) => {
      btn.classList.toggle('active', i === index);
    });
    
    document.getElementById('current-sim-name').textContent = this.simulationNames[index];
    
    if (typeof window.selectSimulation === 'function') {
      window.selectSimulation(index);
    }
  },
  
  showExportModal() {
    const modal = document.getElementById('export-modal');
    const preview = document.getElementById('export-preview');
    const canvas = document.getElementById('sim-canvas');
    
    if (canvas) {
      const img = document.createElement('img');
      img.src = canvas.toDataURL('image/png');
      preview.innerHTML = '';
      preview.appendChild(img);
    }
    
    document.getElementById('export-filename').value = 
      this.simulationNames[this.currentSimulation].toLowerCase().replace(/\s+/g, '-');
    
    modal.classList.remove('hidden');
  },
  
  hideExportModal() {
    document.getElementById('export-modal').classList.add('hidden');
  },
  
  downloadExport() {
    const canvas = document.getElementById('sim-canvas');
    const resolution = parseInt(document.getElementById('export-resolution').value);
    const format = document.getElementById('export-format').value;
    const filename = document.getElementById('export-filename').value || 'simulation';
    
    let exportCanvas = canvas;
    if (resolution > 1) {
      exportCanvas = document.createElement('canvas');
      exportCanvas.width = canvas.width * resolution;
      exportCanvas.height = canvas.height * resolution;
      const ctx = exportCanvas.getContext('2d');
      ctx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);
    }
    
    const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
    const quality = format === 'jpeg' ? 0.95 : undefined;
    
    const dataUrl = exportCanvas.toDataURL(mimeType, quality);
    
    const link = document.createElement('a');
    link.download = `${filename}.${format}`;
    link.href = dataUrl;
    link.click();
    
    this.hideExportModal();
  },
  
  showSaveModal() {
    if (!this.user) {
      document.getElementById('login-prompt')?.classList.remove('hidden');
    }
    document.getElementById('save-modal').classList.remove('hidden');
  },
  
  hideSaveModal() {
    document.getElementById('save-modal').classList.add('hidden');
    document.getElementById('save-form').reset();
    document.getElementById('save-error')?.classList.add('hidden');
  },
  
  async handleSave(e) {
    e.preventDefault();
    
    if (!this.user) {
      document.getElementById('save-error').textContent = 'Please login to save presets';
      document.getElementById('save-error').classList.remove('hidden');
      return;
    }
    
    const name = document.getElementById('preset-name').value;
    const description = document.getElementById('preset-description').value;
    const isPublic = document.getElementById('preset-public').checked;
    
    const params = {
      hue: parseInt(document.getElementById('hue').value),
      decay: parseInt(document.getElementById('decay').value),
      speed: parseInt(document.getElementById('speed').value),
      zoom: parseInt(document.getElementById('zoom').value),
      spokes: parseInt(document.getElementById('spokes').value),
      winding: parseInt(document.getElementById('winding').value),
    };
    
    try {
      const simRes = await fetch('/api/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name,
          description,
          simulationType: this.currentSimulation,
          isPublic
        })
      });
      
      if (!simRes.ok) {
        throw new Error('Failed to save simulation');
      }
      
      const simulation = await simRes.json();
      
      await fetch(`/api/simulations/${simulation.id}/presets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: 'Default',
          ...params
        })
      });
      
      this.hideSaveModal();
      alert('Preset saved successfully!');
    } catch (err) {
      document.getElementById('save-error').textContent = err.message;
      document.getElementById('save-error').classList.remove('hidden');
    }
  },
  
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  },
  
  togglePause() {
    this.isPaused = !this.isPaused;
    
    let indicator = document.querySelector('.paused-indicator');
    if (this.isPaused) {
      if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'paused-indicator';
        indicator.textContent = '[ PAUSED ]';
        document.body.appendChild(indicator);
      }
      if (typeof window.pauseSimulation === 'function') {
        window.pauseSimulation();
      }
    } else {
      indicator?.remove();
      if (typeof window.resumeSimulation === 'function') {
        window.resumeSimulation();
      }
    }
  },
  
  startFpsCounter() {
    const counter = document.getElementById('fps-counter');
    if (!counter) return;
    
    const update = () => {
      this.frameCount++;
      const now = performance.now();
      if (now - this.lastFpsUpdate >= 1000) {
        counter.textContent = `${this.frameCount} FPS`;
        this.frameCount = 0;
        this.lastFpsUpdate = now;
      }
      requestAnimationFrame(update);
    };
    update();
  }
};

document.addEventListener('DOMContentLoaded', () => SimulatorUI.init());
