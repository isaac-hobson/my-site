import type { Express, Request, Response } from "express";
import { storage } from "./storage.js";
import { requireAuth } from "./auth.js";

export function setupRoutes(app: Express) {
  // Simulations API
  app.get("/api/simulations", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const sims = await storage.getPublicSimulations(limit);
      res.json(sims);
    } catch (err) {
      console.error("Error fetching simulations:", err);
      res.status(500).json({ error: "Failed to fetch simulations" });
    }
  });

  app.get("/api/simulations/featured", async (req: Request, res: Response) => {
    try {
      const sims = await storage.getFeaturedSimulations();
      res.json(sims);
    } catch (err) {
      console.error("Error fetching featured simulations:", err);
      res.status(500).json({ error: "Failed to fetch featured simulations" });
    }
  });

  app.get("/api/simulations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const sim = await storage.getSimulation(id);
      if (!sim) {
        return res.status(404).json({ error: "Simulation not found" });
      }
      await storage.incrementViewCount(id);
      res.json(sim);
    } catch (err) {
      console.error("Error fetching simulation:", err);
      res.status(500).json({ error: "Failed to fetch simulation" });
    }
  });

  app.post("/api/simulations", requireAuth, async (req: Request, res: Response) => {
    try {
      const { name, description, simulationType, isPublic } = req.body;
      if (!name || simulationType === undefined) {
        return res.status(400).json({ error: "Name and simulationType are required" });
      }
      const sim = await storage.createSimulation({
        userId: req.user!.id,
        name,
        description: description || "",
        simulationType,
        isPublic: isPublic || false,
      });
      res.status(201).json(sim);
    } catch (err) {
      console.error("Error creating simulation:", err);
      res.status(500).json({ error: "Failed to create simulation" });
    }
  });

  app.put("/api/simulations/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const sim = await storage.getSimulation(id);
      if (!sim) {
        return res.status(404).json({ error: "Simulation not found" });
      }
      if (sim.userId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ error: "Not authorized" });
      }
      const { name, description, isPublic } = req.body;
      const updated = await storage.updateSimulation(id, { name, description, isPublic });
      res.json(updated);
    } catch (err) {
      console.error("Error updating simulation:", err);
      res.status(500).json({ error: "Failed to update simulation" });
    }
  });

  app.delete("/api/simulations/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const sim = await storage.getSimulation(id);
      if (!sim) {
        return res.status(404).json({ error: "Simulation not found" });
      }
      if (sim.userId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ error: "Not authorized" });
      }
      await storage.deleteSimulation(id);
      res.json({ message: "Simulation deleted" });
    } catch (err) {
      console.error("Error deleting simulation:", err);
      res.status(500).json({ error: "Failed to delete simulation" });
    }
  });

  // User simulations
  app.get("/api/user/simulations", requireAuth, async (req: Request, res: Response) => {
    try {
      const sims = await storage.getSimulationsByUser(req.user!.id);
      res.json(sims);
    } catch (err) {
      console.error("Error fetching user simulations:", err);
      res.status(500).json({ error: "Failed to fetch simulations" });
    }
  });

  // Presets API
  app.get("/api/simulations/:id/presets", async (req: Request, res: Response) => {
    try {
      const simulationId = parseInt(req.params.id);
      const presets = await storage.getPresetsBySimulation(simulationId);
      res.json(presets);
    } catch (err) {
      console.error("Error fetching presets:", err);
      res.status(500).json({ error: "Failed to fetch presets" });
    }
  });

  app.post("/api/simulations/:id/presets", requireAuth, async (req: Request, res: Response) => {
    try {
      const simulationId = parseInt(req.params.id);
      const sim = await storage.getSimulation(simulationId);
      if (!sim) {
        return res.status(404).json({ error: "Simulation not found" });
      }
      if (sim.userId !== req.user!.id) {
        return res.status(403).json({ error: "Not authorized" });
      }
      const { name, hue, decay, speed, zoom, spokes, winding, customParams } = req.body;
      const preset = await storage.createPreset({
        simulationId,
        name: name || "Untitled Preset",
        hue: hue ?? 120,
        decay: decay ?? 5,
        speed: speed ?? 50,
        zoom: zoom ?? 100,
        spokes: spokes ?? 6,
        winding: winding ?? 5,
        customParams: customParams || null,
      });
      res.status(201).json(preset);
    } catch (err) {
      console.error("Error creating preset:", err);
      res.status(500).json({ error: "Failed to create preset" });
    }
  });

  app.delete("/api/presets/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePreset(id);
      res.json({ message: "Preset deleted" });
    } catch (err) {
      console.error("Error deleting preset:", err);
      res.status(500).json({ error: "Failed to delete preset" });
    }
  });

  // Favorites API
  app.get("/api/user/favorites", requireAuth, async (req: Request, res: Response) => {
    try {
      const favorites = await storage.getUserFavorites(req.user!.id);
      res.json(favorites);
    } catch (err) {
      console.error("Error fetching favorites:", err);
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });

  app.post("/api/simulations/:id/favorite", requireAuth, async (req: Request, res: Response) => {
    try {
      const simulationId = parseInt(req.params.id);
      await storage.addFavorite(req.user!.id, simulationId);
      res.json({ message: "Added to favorites" });
    } catch (err) {
      console.error("Error adding favorite:", err);
      res.status(500).json({ error: "Failed to add favorite" });
    }
  });

  app.delete("/api/simulations/:id/favorite", requireAuth, async (req: Request, res: Response) => {
    try {
      const simulationId = parseInt(req.params.id);
      await storage.removeFavorite(req.user!.id, simulationId);
      res.json({ message: "Removed from favorites" });
    } catch (err) {
      console.error("Error removing favorite:", err);
      res.status(500).json({ error: "Failed to remove favorite" });
    }
  });

  app.get("/api/simulations/:id/is-favorite", requireAuth, async (req: Request, res: Response) => {
    try {
      const simulationId = parseInt(req.params.id);
      const isFav = await storage.isFavorite(req.user!.id, simulationId);
      res.json({ isFavorite: isFav });
    } catch (err) {
      console.error("Error checking favorite:", err);
      res.status(500).json({ error: "Failed to check favorite" });
    }
  });

  // Export endpoint
  app.post("/api/export", async (req: Request, res: Response) => {
    try {
      const { imageData, format, filename } = req.body;
      if (!imageData) {
        return res.status(400).json({ error: "Image data required" });
      }
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      
      res.setHeader("Content-Type", `image/${format || "png"}`);
      res.setHeader("Content-Disposition", `attachment; filename="${filename || "simulation"}.${format || "png"}"`);
      res.send(buffer);
    } catch (err) {
      console.error("Error exporting image:", err);
      res.status(500).json({ error: "Export failed" });
    }
  });

  // User profile
  app.get("/api/users/me", requireAuth, async (req: Request, res: Response) => {
    res.json({
      id: req.user!.id,
      username: req.user!.username,
      email: req.user!.email,
      displayName: req.user!.displayName,
      role: req.user!.role,
    });
  });

  // Simulation types metadata
  app.get("/api/simulation-types", (req: Request, res: Response) => {
    res.json([
      { id: 0, name: "Evolving Star Fractal", category: "Fractals", description: "Dynamic star/spiral transitions with evolving patterns" },
      { id: 1, name: "Hyperspace Web", category: "3D", description: "3D projected rotating point web with perspective" },
      { id: 2, name: "Lissajous Cascade", category: "Mathematical", description: "Overlapping Lissajous curves with prime ratios" },
      { id: 3, name: "Magnetic Field Tracer", category: "Physics", description: "Particles following noise-based magnetic fields" },
      { id: 4, name: "Asymmetric Orbitals", category: "Physics", description: "Gravitational n-body orbital simulation" },
      { id: 5, name: "Reaction-Diffusion Ring", category: "Cellular", description: "Multi-ring cellular automata patterns" },
      { id: 6, name: "Neural Network", category: "AI", description: "Animated neural network visualization" },
      { id: 7, name: "Flocking Swarm", category: "Behavioral", description: "Boid flocking algorithm simulation" },
      { id: 8, name: "Fractal Tree", category: "Fractals", description: "Animated recursive tree with wind effects" },
      { id: 9, name: "Galaxy Spiral", category: "Astronomy", description: "Rotating spiral galaxy with stars" },
      { id: 10, name: "Quantum Wave", category: "Physics", description: "Layered sine wave interference patterns" },
      { id: 11, name: "Strange Attractor", category: "Chaos", description: "Lorenz attractor chaos visualization" },
      { id: 12, name: "Sacred Geometry", category: "Geometric", description: "Pulsing hexagonal geometric layers" },
      { id: 13, name: "Electric Plasma", category: "Effects", description: "Lightning bolt plasma ball effect" },
      { id: 14, name: "Infinite Zoom", category: "Optical", description: "Endless zooming polygon illusion" },
      { id: 15, name: "Bioluminescence", category: "Nature", description: "Floating jellyfish with glowing tentacles" },
      { id: 16, name: "DNA Helix", category: "Biology", description: "Rotating double helix DNA structure" },
    ]);
  });
}
