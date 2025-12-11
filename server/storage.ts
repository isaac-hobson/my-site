import { users, simulations, presets, favorites, type User, type InsertUser, type Simulation, type InsertSimulation, type Preset, type InsertPreset } from "../shared/schema.js";
import { db } from "./db.js";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastLogin(id: number): Promise<void>;
  
  getSimulation(id: number): Promise<Simulation | undefined>;
  getSimulationsByUser(userId: number): Promise<Simulation[]>;
  getPublicSimulations(limit?: number): Promise<Simulation[]>;
  getFeaturedSimulations(): Promise<Simulation[]>;
  createSimulation(simulation: InsertSimulation): Promise<Simulation>;
  updateSimulation(id: number, updates: Partial<InsertSimulation>): Promise<Simulation | undefined>;
  deleteSimulation(id: number): Promise<void>;
  incrementViewCount(id: number): Promise<void>;
  
  getPresetsBySimulation(simulationId: number): Promise<Preset[]>;
  createPreset(preset: InsertPreset): Promise<Preset>;
  deletePreset(id: number): Promise<void>;
  
  getUserFavorites(userId: number): Promise<Simulation[]>;
  addFavorite(userId: number, simulationId: number): Promise<void>;
  removeFavorite(userId: number, simulationId: number): Promise<void>;
  isFavorite(userId: number, simulationId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserLastLogin(id: number): Promise<void> {
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, id));
  }

  async getSimulation(id: number): Promise<Simulation | undefined> {
    const [sim] = await db.select().from(simulations).where(eq(simulations.id, id));
    return sim || undefined;
  }

  async getSimulationsByUser(userId: number): Promise<Simulation[]> {
    return db.select().from(simulations).where(eq(simulations.userId, userId)).orderBy(desc(simulations.updatedAt));
  }

  async getPublicSimulations(limit = 20): Promise<Simulation[]> {
    return db.select().from(simulations).where(eq(simulations.isPublic, true)).orderBy(desc(simulations.viewCount)).limit(limit);
  }

  async getFeaturedSimulations(): Promise<Simulation[]> {
    return db.select().from(simulations).where(eq(simulations.isFeatured, true)).orderBy(desc(simulations.viewCount));
  }

  async createSimulation(simulation: InsertSimulation): Promise<Simulation> {
    const [sim] = await db.insert(simulations).values(simulation).returning();
    return sim;
  }

  async updateSimulation(id: number, updates: Partial<InsertSimulation>): Promise<Simulation | undefined> {
    const [sim] = await db.update(simulations).set({ ...updates, updatedAt: new Date() }).where(eq(simulations.id, id)).returning();
    return sim || undefined;
  }

  async deleteSimulation(id: number): Promise<void> {
    await db.delete(presets).where(eq(presets.simulationId, id));
    await db.delete(favorites).where(eq(favorites.simulationId, id));
    await db.delete(simulations).where(eq(simulations.id, id));
  }

  async incrementViewCount(id: number): Promise<void> {
    await db.update(simulations).set({ viewCount: sql`${simulations.viewCount} + 1` }).where(eq(simulations.id, id));
  }

  async getPresetsBySimulation(simulationId: number): Promise<Preset[]> {
    return db.select().from(presets).where(eq(presets.simulationId, simulationId)).orderBy(desc(presets.createdAt));
  }

  async getPresetsByUser(userId: number): Promise<(Preset & { simulationType: number; simulationName: string })[]> {
    const results = await db
      .select({
        id: presets.id,
        simulationId: presets.simulationId,
        name: presets.name,
        hue: presets.hue,
        decay: presets.decay,
        speed: presets.speed,
        zoom: presets.zoom,
        spokes: presets.spokes,
        winding: presets.winding,
        customParams: presets.customParams,
        createdAt: presets.createdAt,
        simulationType: simulations.simulationType,
        simulationName: simulations.name,
      })
      .from(presets)
      .innerJoin(simulations, eq(presets.simulationId, simulations.id))
      .where(eq(simulations.userId, userId))
      .orderBy(desc(presets.createdAt));
    return results;
  }

  async getPublicPresets(limit = 50): Promise<(Preset & { simulationType: number; simulationName: string; ownerName: string })[]> {
    const results = await db
      .select({
        id: presets.id,
        simulationId: presets.simulationId,
        name: presets.name,
        hue: presets.hue,
        decay: presets.decay,
        speed: presets.speed,
        zoom: presets.zoom,
        spokes: presets.spokes,
        winding: presets.winding,
        customParams: presets.customParams,
        createdAt: presets.createdAt,
        simulationType: simulations.simulationType,
        simulationName: simulations.name,
        ownerName: users.displayName,
      })
      .from(presets)
      .innerJoin(simulations, eq(presets.simulationId, simulations.id))
      .innerJoin(users, eq(simulations.userId, users.id))
      .where(eq(simulations.isPublic, true))
      .orderBy(desc(presets.createdAt))
      .limit(limit);
    return results.map(r => ({ ...r, ownerName: r.ownerName || 'Anonymous' }));
  }

  async createPreset(preset: InsertPreset): Promise<Preset> {
    const [p] = await db.insert(presets).values(preset).returning();
    return p;
  }

  async deletePreset(id: number): Promise<void> {
    await db.delete(presets).where(eq(presets.id, id));
  }

  async getUserFavorites(userId: number): Promise<Simulation[]> {
    const favs = await db.select({ simulation: simulations }).from(favorites).innerJoin(simulations, eq(favorites.simulationId, simulations.id)).where(eq(favorites.userId, userId));
    return favs.map(f => f.simulation);
  }

  async addFavorite(userId: number, simulationId: number): Promise<void> {
    await db.insert(favorites).values({ userId, simulationId }).onConflictDoNothing();
  }

  async removeFavorite(userId: number, simulationId: number): Promise<void> {
    await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.simulationId, simulationId)));
  }

  async isFavorite(userId: number, simulationId: number): Promise<boolean> {
    const [fav] = await db.select().from(favorites).where(and(eq(favorites.userId, userId), eq(favorites.simulationId, simulationId)));
    return !!fav;
  }
}

export const storage = new DatabaseStorage();
