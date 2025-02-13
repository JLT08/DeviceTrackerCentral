import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const deviceCategories = [
  "server",
  "network",
  "desktop",
  "mobile",
  "iot",
  "storage",
  "security",
] as const;

export const deviceGroups = pgTable("device_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  notificationsEnabled: boolean("notifications_enabled").default(true),
});

export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ipAddress: text("ip_address").notNull(),
  description: text("description"),
  isOnline: boolean("is_online").default(false),
  lastSeen: timestamp("last_seen"),
  category: text("category").notNull().default("server"),
  groupId: integer("group_id").references(() => deviceGroups.id),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("not_started"),
  assignedTo: integer("assigned_to").references(() => users.id),
});

export const deviceHistory = pgTable("device_history", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").references(() => devices.id, { onDelete: 'cascade' }),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").references(() => devices.id, { onDelete: 'cascade' }),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: 'cascade' }),
});

export const insertUserSchema = createInsertSchema(users);
export const insertDeviceSchema = createInsertSchema(devices).extend({
  category: z.enum(deviceCategories),
  groupId: z.number().optional(),
});
export const insertDeviceGroupSchema = createInsertSchema(deviceGroups);
export const insertProjectSchema = createInsertSchema(projects).extend({
  status: z.enum(["not_started", "in_progress", "complete"]),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type InsertDeviceGroup = z.infer<typeof insertDeviceGroupSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type User = typeof users.$inferSelect;
export type Device = typeof devices.$inferSelect;
export type DeviceGroup = typeof deviceGroups.$inferSelect;
export type Project = typeof projects.$inferSelect;