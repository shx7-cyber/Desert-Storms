import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer for disk storage
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  })
});

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "weather123";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Serve uploaded files statically
  app.use("/uploads", express.static(uploadDir));

  app.get(api.storms.list.path, async (req, res) => {
    const storms = await storage.getStorms();
    res.json(storms);
  });

  // Handle both 'media' and 'radar' file uploads
  app.post(api.storms.create.path, upload.fields([
    { name: 'media', maxCount: 10 },
    { name: 'radar', maxCount: 10 }
  ]), async (req, res) => {
    try {
      const { password, ...body } = req.body;

      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Invalid password" });
      }

      // Handle characteristics if sent as JSON string (from FormData)
      let characteristics = [];
      if (body.characteristics) {
        try {
           characteristics = typeof body.characteristics === 'string' 
             ? JSON.parse(body.characteristics) 
             : body.characteristics;
           if (!Array.isArray(characteristics)) characteristics = [characteristics];
        } catch (e) {
          characteristics = [body.characteristics];
        }
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const mediaUrls = files?.media?.map(f => `/uploads/${f.filename}`) || [];
      const radarUrls = files?.radar?.map(f => `/uploads/${f.filename}`) || [];

      const stormData = {
        stormType: body.stormType,
        severity: body.severity,
        hailSize: body.hailSize,
        location: body.location, // Now a required field from frontend
        characteristics: characteristics,
        password: password
      };

      const storm = await storage.createStorm({ ...stormData, mediaUrls, radarUrls });
      res.status(201).json(storm);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: "Failed to create storm log" });
    }
  });

  app.delete(api.storms.delete.path, async (req, res) => {
    const { password } = req.body;
    
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const id = Number(req.params.id);
    const storm = await storage.getStorm(id);
    if (!storm) {
      return res.status(404).json({ message: "Storm not found" });
    }

    await storage.deleteStorm(id);
    res.status(204).send();
  });

  return httpServer;
}
