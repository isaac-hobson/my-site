const Dashboard = {
  user: null,
  simulations: [],
  favorites: [],
  presets: [],
  
  simulationTypes: [
    'Evolving Star Fractal', 'Hyperspace Web', 'Lissajous Cascade',
    'Magnetic Field Tracer', 'Asymmetric Orbitals', 'Reaction-Diffusion Ring',
    'Neural Network', 'Flocking Swarm', 'Fractal Tree', 'Galaxy Spiral',
    'Quantum Wave', 'Strange Attractor', 'Sacred Geometry', 'Electric Plasma',
    'Infinite Zoom', 'Bioluminescence', 'DNA Helix'
  ],
  
  async init() {
    const isAuthed = await this.checkAuth();
    if (!isAuthed) {
      window.location.href = '/index.html';
      return;
    }
    
    this.updateUserInfo();
    this.setupEventListeners();
    await this.loadUserData();
  },
  
  async checkAuth() {
    try {
      const res = await fetch('/api/auth/user', { credentials: 'include' });
      if (res.ok) {
        this.user = await res.json();
        return true;
      }
    } catch (err) {
      console.error('Auth check failed:', err);
    }
    return false;
  },
  
  updateUserInfo() {
    if (!this.user) return;
    
    document.getElementById('user-badge').textContent = 
      `> ${this.user.displayName || this.user.username}`;
    document.getElementById('setting-username').textContent = this.user.username;
    document.getElementById('setting-email').textContent = this.user.email;
    document.getElementById('setting-displayname').textContent = 
      this.user.displayName || 'Not set';
    document.getElementById('setting-role').textContent = 
      this.user.role.toUpperCase();
  },
  
  setupEventListeners() {
    document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());
  },
  
  async loadUserData() {
    await Promise.all([
      this.loadSimulations(),
      this.loadFavorites(),
      this.loadPresets()
    ]);
  },
  
  async loadSimulations() {
    const container = document.getElementById('user-simulations');
    
    try {
      const res = await fetch('/api/user/simulations', { credentials: 'include' });
      if (res.ok) {
        this.simulations = await res.json();
        this.renderSimulations(container, this.simulations);
      } else {
        container.innerHTML = '<div class="empty-state">Failed to load simulations</div>';
      }
    } catch (err) {
      console.error('Failed to load simulations:', err);
      container.innerHTML = '<div class="empty-state">Error loading simulations</div>';
    }
  },
  
  async loadFavorites() {
    const container = document.getElementById('user-favorites');
    
    try {
      const res = await fetch('/api/user/favorites', { credentials: 'include' });
      if (res.ok) {
        this.favorites = await res.json();
        this.renderSimulations(container, this.favorites, true);
      } else {
        container.innerHTML = '<div class="empty-state">Failed to load favorites</div>';
      }
    } catch (err) {
      console.error('Failed to load favorites:', err);
      container.innerHTML = '<div class="empty-state">Error loading favorites</div>';
    }
  },
  
  renderSimulations(container, simulations, isFavorites = false) {
    if (simulations.length === 0) {
      container.innerHTML = `<div class="empty-state">${
        isFavorites ? 'No favorites yet' : 'No simulations yet. Create your first one!'
      }</div>`;
      return;
    }
    
    container.innerHTML = simulations.map(sim => `
      <div class="simulation-card" data-id="${this.escapeAttr(sim.id)}">
        <div class="sim-card-header">
          <h3 class="sim-card-name">${this.escapeHtml(sim.name)}</h3>
          ${sim.isPublic ? '<span class="sim-card-type">[PUBLIC]</span>' : ''}
        </div>
        <p class="sim-card-type">${this.escapeHtml(this.simulationTypes[sim.simulationType] || 'Unknown')}</p>
        <div class="sim-card-meta">
          <span>${this.escapeHtml(String(sim.viewCount || 0))} views</span>
          <span>${this.escapeHtml(this.formatDate(sim.createdAt))}</span>
        </div>
        <div class="sim-card-actions">
          <button class="sim-action-btn sim-view-btn" data-sim-type="${this.escapeAttr(sim.simulationType)}">[ VIEW ]</button>
          ${isFavorites 
            ? `<button class="sim-action-btn danger fav-remove-btn" data-sim-id="${this.escapeAttr(sim.id)}">[ REMOVE ]</button>` 
            : `<button class="sim-action-btn danger sim-delete-btn" data-sim-id="${this.escapeAttr(sim.id)}">[ DELETE ]</button>`}
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.sim-view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const simType = btn.dataset.simType;
        this.openSimulation(simType);
      });
    });

    container.querySelectorAll('.sim-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const simId = btn.dataset.simId;
        this.deleteSimulation(simId);
      });
    });

    container.querySelectorAll('.fav-remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const simId = btn.dataset.simId;
        this.removeFavorite(simId);
      });
    });
  },
  
  openSimulation(type) {
    window.location.href = `/shapes.html?sim=${type}`;
  },
  
  async deleteSimulation(id) {
    if (!confirm('Are you sure you want to delete this simulation?')) return;
    
    try {
      const res = await fetch(`/api/simulations/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (res.ok) {
        await this.loadSimulations();
      } else {
        alert('Failed to delete simulation');
      }
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Error deleting simulation');
    }
  },

  async removeFavorite(simulationId) {
    if (!confirm('Remove this simulation from favorites?')) return;
    
    try {
      const res = await fetch(`/api/simulations/${simulationId}/favorite`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (res.ok) {
        await this.loadFavorites();
      } else {
        alert('Failed to remove favorite');
      }
    } catch (err) {
      console.error('Remove favorite failed:', err);
      alert('Error removing favorite');
    }
  },
  
  async loadPresets() {
    const container = document.getElementById('user-presets');
    if (!container) return;
    
    try {
      const res = await fetch('/api/user/presets', { credentials: 'include' });
      if (res.ok) {
        this.presets = await res.json();
        this.renderPresets(container, this.presets);
      } else {
        container.innerHTML = '<div class="empty-state">Failed to load presets</div>';
      }
    } catch (err) {
      console.error('Failed to load presets:', err);
      container.innerHTML = '<div class="empty-state">Error loading presets</div>';
    }
  },
  
  renderPresets(container, presets) {
    if (presets.length === 0) {
      container.innerHTML = '<div class="empty-state">No presets saved yet. Create presets from the simulator!</div>';
      return;
    }
    
    container.innerHTML = '';
    presets.forEach(preset => {
      const card = document.createElement('div');
      card.className = 'preset-card';
      card.dataset.id = preset.id;

      const info = document.createElement('div');
      info.className = 'preset-info';
      const nameSpan = document.createElement('span');
      nameSpan.className = 'preset-name';
      nameSpan.textContent = preset.name;
      const simSpan = document.createElement('span');
      simSpan.className = 'preset-sim';
      simSpan.textContent = this.simulationTypes[preset.simulationType] || 'Unknown';
      info.appendChild(nameSpan);
      info.appendChild(simSpan);

      const params = document.createElement('div');
      params.className = 'preset-params';
      params.textContent = `Hue: ${preset.hue} | Speed: ${preset.speed} | Zoom: ${preset.zoom}`;

      const actions = document.createElement('div');
      actions.className = 'preset-actions';
      const viewBtn = document.createElement('button');
      viewBtn.className = 'sim-action-btn preset-view-btn';
      viewBtn.dataset.simType = preset.simulationType;
      viewBtn.dataset.presetId = preset.id;
      viewBtn.textContent = '[ VIEW ]';
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'sim-action-btn danger preset-delete-btn';
      deleteBtn.dataset.presetId = preset.id;
      deleteBtn.textContent = '[ DELETE ]';
      actions.appendChild(viewBtn);
      actions.appendChild(deleteBtn);

      card.appendChild(info);
      card.appendChild(params);
      card.appendChild(actions);
      container.appendChild(card);
    });

    container.querySelectorAll('.preset-view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const simType = btn.dataset.simType;
        const presetId = btn.dataset.presetId;
        this.viewPreset(simType, presetId);
      });
    });

    container.querySelectorAll('.preset-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const presetId = btn.dataset.presetId;
        this.deletePreset(presetId);
      });
    });
  },
  
  viewPreset(simType, presetId) {
    window.location.href = `/shapes.html?sim=${simType}&preset=${presetId}`;
  },
  
  async deletePreset(id) {
    if (!confirm('Are you sure you want to delete this preset?')) return;
    
    try {
      const res = await fetch(`/api/presets/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (res.ok) {
        await this.loadPresets();
      } else {
        alert('Failed to delete preset');
      }
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Error deleting preset');
    }
  },
  
  async logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      window.location.href = '/index.html';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  },
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  escapeAttr(text) {
    if (text == null) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  },
  
  formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }
};

document.addEventListener('DOMContentLoaded', () => Dashboard.init());
