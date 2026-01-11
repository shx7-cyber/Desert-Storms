import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const storms = pgTable("storms", {
  id: serial("id").primaryKey(),
  stormType: text("storm_type").notNull(), // MCs, supercell, single cell, multicell
  severity: text("severity").notNull(),
  hailSize: text("hail_size").notNull(),
  characteristics: text("characteristics").array(), // e.g. ["Heavy Rain", "Lightning"]
  mediaUrls: text("media_urls").array(), // URLs of uploaded files
  location: text("location").notNull().default("UAE"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStormSchema = createInsertSchema(storms).omit({ 
  id: true, 
  createdAt: true,
  mediaUrls: true // Handled separately via upload
}).extend({
  password: z.string(), // Required for verification
  characteristics: z.array(z.string()).default([]),
});

export type Storm = typeof storms.$inferSelect;
export type InsertStorm = z.infer<typeof insertStormSchema>;
