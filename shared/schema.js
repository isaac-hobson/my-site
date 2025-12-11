import { pgTable, serial, text, varchar, timestamp, integer, jsonb, boolean, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 50 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: text("password").notNull(),
    displayName: varchar("display_name", { length: 100 }),
    role: varchar("role", { length: 20 }).notNull().default("user"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    lastLoginAt: timestamp("last_login_at"),
});
export const simulations = pgTable("simulations", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    simulationType: integer("simulation_type").notNull(),
    isPublic: boolean("is_public").notNull().default(false),
    isFeatured: boolean("is_featured").notNull().default(false),
    viewCount: integer("view_count").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const presets = pgTable("presets", {
    id: serial("id").primaryKey(),
    simulationId: integer("simulation_id").references(() => simulations.id).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    hue: real("hue").notNull().default(120),
    decay: real("decay").notNull().default(5),
    speed: real("speed").notNull().default(50),
    zoom: real("zoom").notNull().default(100),
    spokes: integer("spokes").notNull().default(6),
    winding: integer("winding").notNull().default(5),
    customParams: jsonb("custom_params"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const favorites = pgTable("favorites", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id).notNull(),
    simulationId: integer("simulation_id").references(() => simulations.id).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
    uniqueFavorite: {
        columns: [table.userId, table.simulationId],
    },
}));
export const usersRelations = relations(users, ({ many }) => ({
    simulations: many(simulations),
    favorites: many(favorites),
}));
export const simulationsRelations = relations(simulations, ({ one, many }) => ({
    user: one(users, {
        fields: [simulations.userId],
        references: [users.id],
    }),
    presets: many(presets),
    favorites: many(favorites),
}));
export const presetsRelations = relations(presets, ({ one }) => ({
    simulation: one(simulations, {
        fields: [presets.simulationId],
        references: [simulations.id],
    }),
}));
export const favoritesRelations = relations(favorites, ({ one }) => ({
    user: one(users, {
        fields: [favorites.userId],
        references: [users.id],
    }),
    simulation: one(simulations, {
        fields: [favorites.simulationId],
        references: [simulations.id],
    }),
}));
