# Impulsive.cc - Professional Simulation Platform

## Overview
A professional-grade full-stack mathematical simulation platform with retro-terminal CRT/Matrix aesthetic. Features user authentication, preset saving/sharing, high-quality image export, and 17 complex mathematical visualizations. Designed for data scientists, computational artists, and R&D teams.

## Tech Stack
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy + bcrypt
- **Frontend**: Vanilla JS with Canvas API
- **Styling**: CSS with CRT/Matrix visual effects

## Project Structure
```
/
├── server/              # Backend source
│   ├── index.ts         # Express server entry point
│   ├── auth.ts          # Passport authentication setup
│   ├── routes.ts        # API route handlers
│   ├── storage.ts       # Database storage layer
│   └── db.ts            # Database connection
├── shared/
│   └── schema.ts        # Drizzle ORM schema definitions
├── public/              # Frontend static files
│   ├── index.html       # Homepage with auth UI
│   ├── shapes.html      # Simulator page
│   ├── solar.html       # Solar system simulation page
│   ├── fractal.html     # Custom fractal generator page
│   ├── redroom.html     # Red Room horror experience
│   ├── dashboard.html   # User dashboard
│   ├── styles.css       # Main styles
│   ├── shapes.css       # Simulator styles
│   ├── solar.css        # Solar system styles
│   ├── fractal.css      # Fractal generator styles
│   ├── dashboard.css    # Dashboard styles
│   ├── matrix.js        # Matrix rain animation
│   ├── main.js          # Homepage interactions
│   ├── auth.js          # Authentication UI
│   ├── simulations.js   # 17 simulation implementations
│   ├── simulator-ui.js  # Simulator controls/export
│   ├── solar.js         # Solar system simulation
│   ├── fractal.js       # WebGL2 fractal generator
│   └── dashboard.js     # Dashboard functionality
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
└── drizzle.config.ts    # Database migration config
```

## Database Schema
- **users**: id, username, email, password, displayName, role, createdAt, lastLoginAt
- **simulations**: id, userId, name, description, simulationType, isPublic, isFeatured, viewCount, createdAt, updatedAt
- **presets**: id, simulationId, name, hue, decay, speed, zoom, spokes, winding, customParams, createdAt
- **favorites**: id, userId, simulationId, createdAt

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/logout` - Logout current session
- `GET /api/auth/user` - Get current authenticated user

### Simulations
- `GET /api/simulations` - List public simulations
- `GET /api/simulations/featured` - List featured simulations
- `GET /api/simulations/:id` - Get simulation details
- `POST /api/simulations` - Create simulation (auth required)
- `PUT /api/simulations/:id` - Update simulation (owner only)
- `DELETE /api/simulations/:id` - Delete simulation (owner only)
- `GET /api/user/simulations` - List user's simulations (auth required)

### Presets
- `GET /api/simulations/:id/presets` - Get presets for simulation
- `POST /api/simulations/:id/presets` - Create preset (owner only)
- `DELETE /api/presets/:id` - Delete preset (owner only)

### Favorites
- `GET /api/user/favorites` - Get user's favorites (auth required)
- `POST /api/simulations/:id/favorite` - Add to favorites (auth required)
- `DELETE /api/simulations/:id/favorite` - Remove from favorites (auth required)

### Misc
- `GET /api/simulation-types` - Get list of all simulation types
- `POST /api/export` - Export image data

## Simulations (17 Types)
0. Evolving Star Fractal - dynamic star/spiral transitions
1. Hyperspace Web - 3D projected rotating point web
2. Lissajous Cascade - overlapping curves with prime ratios
3. Magnetic Field Tracer - particles following noise-based fields
4. Asymmetric Orbitals - gravitational n-body simulation
5. Reaction-Diffusion Ring - multi-ring cellular automata
6. Neural Network - animated neural network visualization
7. Flocking Swarm - boid flocking algorithm
8. Fractal Tree - animated recursive tree with wind
9. Galaxy Spiral - rotating spiral galaxy with stars
10. Quantum Wave - layered sine wave interference
11. Strange Attractor - Lorenz attractor visualization
12. Sacred Geometry - pulsing hexagonal layers
13. Electric Plasma - lightning bolt plasma ball
14. Infinite Zoom - endless zooming polygons
15. Bioluminescence - floating jellyfish with tentacles
16. DNA Helix - rotating double helix structure

## Keyboard Shortcuts (Simulator)
- `1-9` - Switch between first 9 simulations
- `E` - Open export modal
- `S` - Open save preset modal
- `F` - Toggle fullscreen
- `M` - Toggle modify panel
- `Space` - Pause/resume animation

## Solar System Simulation
Interactive solar system visualization with the following features:
- 8 planets with realistic colors and proportional orbits (Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune)
- Saturn features rings
- Earth has an orbiting moon
- Asteroid belt between Mars and Jupiter (150 asteroids)
- Twinkling star background
- Red matrix rain overlay (toggle with MATRIX button)
- "ACTIVATED"/"DEACTIVATED" status messages when toggling matrix
- Play/pause functionality
- View rotation mode to observe from different angles
- Orbit trails toggle (shows planet paths)
- Planet info popup (tap any planet/sun/moon for facts)
- Screenshot button (captures current view as PNG)
- Fullscreen mode
- Color themes: Matrix Green, Cyber Blue, Neon Purple, Blood Red, Solar Gold
- Adjustable settings: orbit speed, planet scale, orbit scale, star density, rotation speed
- Preset music tracks with dropdown selector:
  - The Intangible (default)
  - Spooky UFO
  - Yellow Brick Road
  - Clubbed to Death
- Volume control slider
- Mobile responsive design
- Keyboard shortcuts: Space (play/pause), R (rotate view), M (matrix), F (fullscreen), S (screenshot), Escape (close panels)

## Fractal Generator
Professional WebGL2-powered fractal generator with the following features:
- GPU-accelerated rendering using fragment shaders for smooth 60fps performance
- 4 built-in fractal presets:
  - Mandelbrot Set - the classic fractal with z = z^2 + c
  - Julia Set - uses fixed constant with z starting at pixel position
  - Burning Ship - asymmetric flame-like patterns using absolute values
  - Tricorn (Mandelbar) - three-cornered bulbs using complex conjugate
- Custom fractal code input using GLSL syntax
- Auto-zoom feature that infinitely zooms into detailed regions
- Adjustable parameters: max iterations (16-2048), color shift
- Mouse controls: scroll to zoom, click-drag to pan
- Touch-friendly for mobile devices
- Info modal explaining equations and usage
- Zoom indicator showing current magnification level
- Professional retro-terminal UI matching site theme
- Accessed via "FRACTAL GENERATOR" button on homepage

## Red Room
Interactive horror-themed experience with the following features:
- Blood-splatter background with dark room aesthetic
- Pain, Suffering, and Magic sliders to control intensity
- Basic Room mode or "Bring a Friend" mode (upload an image)
- Random visual effects: screen shake, red overlays, zoom distortion
- Click/tap interaction with beep sounds and multiplier system
- Timer tracking how long you survive
- High scores saved to local storage
- Background music with volume control
- Accessed via "DO NOT ENTER" button on homepage

## Design Philosophy
"High-Contrast Retro-Terminal Performance"
- Color scheme: #00DD00 (primary), #33FF33 (glow), #003300 (dark), #000000 (background)
- Typography: VT323 monospace font
- Effects: CRT scanlines, matrix rain, floating geometric shapes
- Canvas: Glossy black background with subtle green border glow

## Development Commands
```bash
npm run dev      # Start development server
npm run db:push  # Push schema changes to database
npm run build    # Build for production
npm start        # Run production server
```

## Running
Express server on port 5000 serving static files from public/ folder.
