import { db } from "./db";
import { storms, type InsertStorm, type Storm } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getStorms(): Promise<Storm[]>;
  createStorm(storm: InsertStorm & { mediaUrls: string[], radarUrls: string[] }): Promise<Storm>;
  deleteStorm(id: number): Promise<void>;
  getStorm(id: number): Promise<Storm | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getStorms(): Promise<Storm[]> {
    return await db.select().from(storms).orderBy(desc(storms.createdAt));
  }

  async createStorm(storm: InsertStorm & { mediaUrls: string[], radarUrls: string[] }): Promise<Storm> {
    const { password, ...stormData } = storm;
    const [newStorm] = await db.insert(storms).values({
      ...stormData,
      mediaUrls: storm.mediaUrls,
      radarUrls: storm.radarUrls,
      location: storm.location,
    }).returning();
    return newStorm;
  }

  async deleteStorm(id: number): Promise<void> {
    await db.delete(storms).where(eq(storms.id, id));
  }

  async getStorm(id: number): Promise<Storm | undefined> {
    const [storm] = await db.select().from(storms).where(eq(storms.id, id));
    return storm;
  }
}

export const storage = new DatabaseStorage();
