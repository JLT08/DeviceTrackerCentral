import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { setupWebSocket } from "./websocket";
import { storage } from "./storage";
import { insertDeviceSchema, insertProjectSchema, insertDeviceGroupSchema } from "@shared/schema";
import { ZodError } from "zod";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  const httpServer = createServer(app);
  setupWebSocket(httpServer);

  // Device Groups endpoints
  app.get("/api/device-groups", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const groups = await storage.getDeviceGroups();
    res.json(groups);
  });

  app.post("/api/device-groups", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const group = insertDeviceGroupSchema.parse(req.body);
      const created = await storage.createDeviceGroup(group);
      res.status(201).json(created);
    } catch (e) {
      if (e instanceof ZodError) {
        res.status(400).json(e.errors);
      } else {
        throw e;
      }
    }
  });

  app.patch("/api/device-groups/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    try {
      const updated = await storage.updateDeviceGroup(id, req.body);
      res.json(updated);
    } catch (error) {
      if (error instanceof Error && error.message === "Device group not found") {
        res.status(404).json({ error: "Device group not found" });
      } else {
        throw error;
      }
    }
  });

  app.delete("/api/device-groups/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    await storage.deleteDeviceGroup(id);
    res.sendStatus(204);
  });

  // Devices endpoints
  app.get("/api/devices", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const devices = await storage.getDevices();
    res.json(devices);
  });

  app.post("/api/devices", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const device = insertDeviceSchema.parse(req.body);
      const created = await storage.createDevice(device);
      res.status(201).json(created);
    } catch (e) {
      if (e instanceof ZodError) {
        res.status(400).json(e.errors);
      } else {
        throw e;
      }
    }
  });

  app.patch("/api/devices/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    const updated = await storage.updateDevice(id, req.body);
    res.json(updated);
  });

  app.delete("/api/devices/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    await storage.deleteDevice(id);
    res.sendStatus(204);
  });

  // Projects endpoints
  app.get("/api/projects", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const projects = await storage.getProjects();
    res.json(projects);
  });

  app.post("/api/projects", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const project = insertProjectSchema.parse(req.body);
      const created = await storage.createProject(project);
      res.status(201).json(created);
    } catch (e) {
      if (e instanceof ZodError) {
        res.status(400).json(e.errors);
      } else {
        throw e;
      }
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    const updated = await storage.updateProject(id, req.body);
    res.json(updated);
  });

  app.delete("/api/projects/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    await storage.deleteProject(id);
    res.sendStatus(204);
  });

  return httpServer;
}