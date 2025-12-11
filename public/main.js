document.addEventListener('DOMContentLoaded', () => {
  const quote = "the truth finds those who seek";
  const quoteElement = document.getElementById('quote');
  let charIndex = 0;
  
  function typeQuote() {
    if (charIndex < quote.length) {
      quoteElement.textContent = quote.substring(0, charIndex + 1);
      charIndex++;
      setTimeout(typeQuote, 80);
    }
  }
  
  setTimeout(typeQuote, 1000);
  
  const projectsBtn = document.getElementById('projects-btn');
  const dropdown = document.getElementById('dropdown');
  const launchBtn = document.getElementById('launch-btn');
  
  projectsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('active');
  });
  
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && e.target !== projectsBtn) {
      dropdown.classList.remove('active');
    }
  });
  
  launchBtn.addEventListener('click', () => {
    launchSimulator();
  });
  
  createGeometricShapes();
  loadCategories();
  loadPublicPresets();
});

function launchSimulator() {
  const overlay = document.createElement('div');
  overlay.className = 'launch-overlay';
  document.body.appendChild(overlay);
  
  const text = document.createElement('div');
  text.className = 'launch-text';
  text.innerHTML = '> INITIALIZING SIMULATION<span class="blink">_</span>';
  overlay.appendChild(text);
  
  setTimeout(() => {
    overlay.classList.add('active');
  }, 10);
  
  setTimeout(() => {
    text.innerHTML = '> LOADING RENDER ENGINE<span class="blink">_</span>';
  }, 400);
  
  setTimeout(() => {
    text.innerHTML = '> ENTERING SIMULATION<span class="blink">_</span>';
  }, 700);
  
  setTimeout(() => {
    overlay.classList.add('flash');
  }, 1000);
  
  setTimeout(() => {
    window.location.href = 'shapes.html';
  }, 1200);
}

function createGeometricShapes() {
  const container = document.getElementById('geometric-shapes');
  const shapeCount = 5;
  
  for (let i = 0; i < shapeCount; i++) {
    const shape = document.createElement('div');
    shape.className = 'floating-shape';
    shape.style.cssText = `
      position: absolute;
      width: ${30 + Math.random() * 50}px;
      height: ${30 + Math.random() * 50}px;
      border: 1px solid rgba(51, 255, 51, 0.3);
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: float${i} ${15 + Math.random() * 10}s infinite linear;
      transform: rotate(${Math.random() * 360}deg);
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float${i} {
        0% { transform: translate(0, 0) rotate(0deg); }
        25% { transform: translate(${-50 + Math.random() * 100}px, ${-50 + Math.random() * 100}px) rotate(90deg); }
        50% { transform: translate(${-50 + Math.random() * 100}px, ${-50 + Math.random() * 100}px) rotate(180deg); }
        75% { transform: translate(${-50 + Math.random() * 100}px, ${-50 + Math.random() * 100}px) rotate(270deg); }
        100% { transform: translate(0, 0) rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    container.appendChild(shape);
  }
}

async function loadCategories() {
  const container = document.getElementById('categories-container');
  if (!container) return;

  try {
    const res = await fetch('/api/simulation-types');
    const simTypes = await res.json();

    // Group simulations by category
    const categories = {};
    simTypes.forEach(sim => {
      if (!categories[sim.category]) {
        categories[sim.category] = [];
      }
      categories[sim.category].push(sim);
    });

    // Build accordion HTML
    container.innerHTML = Object.entries(categories).map(([category, sims]) => `
      <div class="category-accordion">
        <button class="category-header" type="button">
          <span>>> ${category}</span>
          <span class="category-toggle">[+]</span>
        </button>
        <div class="category-sims">
          ${sims.map(sim => `
            <a href="shapes.html?sim=${sim.id}" class="sim-link">
              <span class="sim-link-name">${sim.name}</span>
              <span class="sim-link-desc">${sim.description}</span>
            </a>
          `).join('')}
        </div>
      </div>
    `).join('');

    // Add accordion behavior
    container.querySelectorAll('.category-header').forEach(header => {
      header.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const accordion = header.closest('.category-accordion');
        const simsContainer = accordion.querySelector('.category-sims');
        const toggle = header.querySelector('.category-toggle');
        const isExpanded = accordion.classList.contains('expanded');

        // Close all other accordions
        container.querySelectorAll('.category-accordion').forEach(acc => {
          acc.classList.remove('expanded');
          acc.querySelector('.category-toggle').textContent = '[+]';
        });

        // Toggle this one
        if (!isExpanded) {
          accordion.classList.add('expanded');
          toggle.textContent = '[-]';
        }
      });
    });

  } catch (err) {
    console.error('Error loading categories:', err);
    container.innerHTML = '<p class="error">Failed to load categories</p>';
  }
}

async function loadPublicPresets() {
  const section = document.getElementById('public-presets-section');
  const grid = document.getElementById('public-presets-grid');
  if (!section || !grid) return;

  try {
    const res = await fetch('/api/presets/public');
    const presets = await res.json();

    if (presets.length === 0) {
      section.classList.add('hidden');
      return;
    }

    section.classList.remove('hidden');

    const simNames = [
      'Evolving Star Fractal', 'Hyperspace Web', 'Lissajous Cascade',
      'Magnetic Field Tracer', 'Asymmetric Orbitals', 'Reaction-Diffusion Ring',
      'Neural Network', 'Flocking Swarm', 'Fractal Tree', 'Galaxy Spiral',
      'Quantum Wave', 'Strange Attractor', 'Sacred Geometry', 'Electric Plasma',
      'Infinite Zoom', 'Bioluminescence', 'DNA Helix'
    ];

    grid.innerHTML = presets.slice(0, 6).map(preset => `
      <a href="shapes.html?sim=${preset.simulationType}&preset=${preset.id}" class="public-preset-card">
        <div class="preset-card-header">
          <span class="preset-card-name">${preset.name}</span>
          <span class="preset-card-author">by ${preset.ownerName}</span>
        </div>
        <div class="preset-card-sim">${simNames[preset.simulationType] || 'Unknown'}</div>
      </a>
    `).join('');

  } catch (err) {
    console.error('Error loading public presets:', err);
    section.classList.add('hidden');
  }
}
