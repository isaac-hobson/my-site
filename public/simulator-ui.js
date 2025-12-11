const SimulatorUI = {
  user: null,
  isPaused: false,
  currentSimulation: 0,
  currentSimulationId: null,
  isFavorited: false,
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
    this.loadUserPresets();
    
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
    document.getElementById('fav-btn')?.addEventListener('click', () => this.toggleFavorite());
    
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
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
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
      
      this.currentSimulationId = simulation.id;
      this.hideSaveModal();
      this.loadUserPresets();
      alert('Preset saved successfully! You can now add it to favorites.');
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
  },

  async loadUserPresets() {
    const presetsList = document.getElementById('presets-list');
    if (!presetsList) return;

    if (!this.user) {
      presetsList.innerHTML = '<p class="no-presets">Login to see your saved presets</p>';
      return;
    }

    try {
      const res = await fetch('/api/user/presets', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load presets');
      
      const presets = await res.json();
      
      if (presets.length === 0) {
        presetsList.innerHTML = '<p class="no-presets">No saved presets yet</p>';
        return;
      }

      presetsList.innerHTML = presets.map(preset => `
        <div class="preset-item" data-preset-id="${preset.id}">
          <div class="preset-info">
            <span class="preset-name">${preset.name}</span>
            <span class="preset-sim">${this.simulationNames[preset.simulationType] || 'Unknown'}</span>
          </div>
          <div class="preset-actions">
            <button class="preset-apply-btn" data-preset='${JSON.stringify(preset)}'>APPLY</button>
            <button class="preset-delete-btn" data-id="${preset.id}">X</button>
          </div>
        </div>
      `).join('');

      // Add event listeners for apply and delete
      presetsList.querySelectorAll('.preset-apply-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const preset = JSON.parse(btn.dataset.preset);
          this.applyPreset(preset);
        });
      });

      presetsList.querySelectorAll('.preset-delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = btn.dataset.id;
          await this.deletePreset(id);
        });
      });

    } catch (err) {
      console.error('Error loading presets:', err);
      presetsList.innerHTML = '<p class="no-presets">Failed to load presets</p>';
    }
  },

  applyPreset(preset) {
    // Switch to the simulation type
    if (preset.simulationType !== undefined) {
      this.selectSimulation(preset.simulationType);
    }

    // Apply slider values
    const sliders = ['hue', 'decay', 'speed', 'zoom', 'spokes', 'winding'];
    sliders.forEach(id => {
      const input = document.getElementById(id);
      const val = document.getElementById(`${id}-val`);
      if (input && preset[id] !== undefined) {
        input.value = preset[id];
        if (val) val.textContent = preset[id];
      }
    });
  },

  async deletePreset(id) {
    if (!confirm('Delete this preset?')) return;

    try {
      const res = await fetch(`/api/presets/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Failed to delete preset');
      
      // Reload presets
      this.loadUserPresets();
    } catch (err) {
      console.error('Error deleting preset:', err);
      alert('Failed to delete preset');
    }
  },

  async toggleFavorite() {
    if (!this.user) {
      alert('Please login to add favorites');
      return;
    }

    if (!this.currentSimulationId) {
      alert('Save this simulation first to add it to favorites');
      return;
    }

    const favBtn = document.getElementById('fav-btn');
    
    try {
      if (this.isFavorited) {
        const res = await fetch(`/api/simulations/${this.currentSimulationId}/favorite`, {
          method: 'DELETE',
          credentials: 'include'
        });
        if (res.ok) {
          this.isFavorited = false;
          if (favBtn) favBtn.textContent = '[ FAV ]';
          alert('Removed from favorites');
        }
      } else {
        const res = await fetch(`/api/simulations/${this.currentSimulationId}/favorite`, {
          method: 'POST',
          credentials: 'include'
        });
        if (res.ok) {
          this.isFavorited = true;
          if (favBtn) favBtn.textContent = '[ UNFAV ]';
          alert('Added to favorites!');
        }
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      alert('Failed to update favorites');
    }
  },

  async checkFavoriteStatus(simId) {
    if (!this.user || !simId) return;

    try {
      const res = await fetch(`/api/simulations/${simId}/is-favorite`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        this.isFavorited = data.isFavorite;
        const favBtn = document.getElementById('fav-btn');
        if (favBtn) favBtn.textContent = this.isFavorited ? '[ UNFAV ]' : '[ FAV ]';
      }
    } catch (err) {
      console.error('Error checking favorite status:', err);
    }
  },

  setCurrentSimulationId(simId) {
    this.currentSimulationId = simId;
    this.checkFavoriteStatus(simId);
  }
};

document.addEventListener('DOMContentLoaded', () => SimulatorUI.init());
