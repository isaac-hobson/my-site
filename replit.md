# Impulsive.cc

## Overview
A retro-terminal themed personal website with CRT/Matrix aesthetic effects. Features a dramatic homepage and an interactive shapes simulator with 6 complex mathematical visualizations.

## Project Structure
```
/
├── index.html       # Homepage with welcome text, projects dropdown
├── shapes.html      # Simulator page with 6 mathematical visualizations
├── styles.css       # Main styles (shared across pages)
├── shapes.css       # Simulator-specific styles
├── matrix.js        # Matrix rain background animation
├── main.js          # Homepage interactions (typing effect, dropdown)
├── simulations.js   # All 6 mathematical simulation implementations
└── .gitignore       # Python ignores
```

## Design Philosophy
"High-Contrast Retro-Terminal Performance"
- Color scheme: #00DD00 (primary), #33FF33 (glow), #003300 (dark), #000000 (background)
- Typography: VT323 monospace font
- Effects: CRT scanlines, matrix rain, floating geometric shapes

## Pages

### Homepage (index.html)
- Glowing "WELCOME" header with flicker animation
- Typing quote animation: "the truth finds those who seek"
- Projects dropdown with terminal styling
- Matrix rain background + floating shapes
- Footer: "CONNECTION ESTABLISHED // IMPULSIVE.CC // DESIGNED BY ISAAC"

### Shapes Simulator (shapes.html)
- Full-screen canvas for simulations
- Collapsible control panel (MODIFY button)
- 6 simulations:
  1. Evolving Star Fractal - dynamic star/spiral transitions
  2. Hyperspace Web - 3D projected rotating point web
  3. Lissajous Cascade - overlapping curves with prime ratios
  4. Magnetic Field Tracer - particles following noise-based fields
  5. Asymmetric Orbitals - gravitational n-body simulation
  6. Reaction-Diffusion Ring - cellular automata on circular canvas

### Adjustable Parameters
- COLOR HUE: Primary color cycle (0-360)
- TRAIL DECAY: Path persistence
- GLOBAL SPEED: Animation speed multiplier
- ZOOM MAGNITUDE: Size oscillation intensity
- N-SPOKES (A): Star fractal spokes
- WINDING (B): Spiral winding factor

## Adding New Pages
To add new pages:
1. Create new HTML file (copy structure from shapes.html)
2. Include shared styles.css and matrix.js
3. Add navigation link in homepage dropdown

## Running
Static file server on port 5000. No build step required.
