import { users, devices, projects, deviceGroups } from "@shared/schema";
import type { InsertUser, InsertDevice, InsertProject, InsertDeviceGroup, User, Device, Project, DeviceGroup } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getDevices(): Promise<Device[]>;
  getDevice(id: number): Promise<Device | undefined>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDevice(id: number, device: Partial<Device>): Promise<Device>;
  deleteDevice(id: number): Promise<void>;
  getDevicesByGroup(groupId: number): Promise<Device[]>;
  getDevicesByCategory(category: string): Promise<Device[]>;

  getDeviceGroups(): Promise<DeviceGroup[]>;
  getDeviceGroup(id: number): Promise<DeviceGroup | undefined>;
  createDeviceGroup(group: InsertDeviceGroup): Promise<DeviceGroup>;
  updateDeviceGroup(id: number, group: Partial<DeviceGroup>): Promise<DeviceGroup>;
  deleteDeviceGroup(id: number): Promise<void>;

  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<Project>): Promise<Project>;
  deleteProject(id: number): Promise<void>;

  sessionStore: session.Store;
  getUsers(): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getDevices(): Promise<Device[]> {
    return await db.select().from(devices);
  }

  async getDevice(id: number): Promise<Device | undefined> {
    const [device] = await db.select().from(devices).where(eq(devices.id, id));
    return device;
  }

  async createDevice(insertDevice: InsertDevice): Promise<Device> {
    const [device] = await db
      .insert(devices)
      .values({
        ...insertDevice,
        isOnline: false,
        lastSeen: new Date(),
      })
      .returning();
    return device;
  }

  async updateDevice(id: number, device: Partial<Device>): Promise<Device> {
    const [updated] = await db
      .update(devices)
      .set(device)
      .where(eq(devices.id, id))
      .returning();
    if (!updated) throw new Error("Device not found");
    return updated;
  }

  async deleteDevice(id: number): Promise<void> {
    await db.delete(devices).where(eq(devices.id, id));
  }

  async getDevicesByGroup(groupId: number): Promise<Device[]> {
    return await db
      .select()
      .from(devices)
      .where(eq(devices.groupId, groupId));
  }

  async getDevicesByCategory(category: string): Promise<Device[]> {
    return await db
      .select()
      .from(devices)
      .where(eq(devices.category, category));
  }

  async getDeviceGroups(): Promise<DeviceGroup[]> {
    return await db.select().from(deviceGroups);
  }

  async getDeviceGroup(id: number): Promise<DeviceGroup | undefined> {
    const [group] = await db
      .select()
      .from(deviceGroups)
      .where(eq(deviceGroups.id, id));
    return group;
  }

  async createDeviceGroup(insertGroup: InsertDeviceGroup): Promise<DeviceGroup> {
    const [group] = await db
      .insert(deviceGroups)
      .values(insertGroup)
      .returning();
    return group;
  }

  async updateDeviceGroup(id: number, group: Partial<DeviceGroup>): Promise<DeviceGroup> {
    const [updated] = await db
      .update(deviceGroups)
      .set(group)
      .where(eq(deviceGroups.id, id))
      .returning();
    if (!updated) throw new Error("Device group not found");
    return updated;
  }

  async deleteDeviceGroup(id: number): Promise<void> {
    await db.delete(deviceGroups).where(eq(deviceGroups.id, id));
  }

  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  async updateProject(id: number, project: Partial<Project>): Promise<Project> {
    const [updated] = await db
      .update(projects)
      .set(project)
      .where(eq(projects.id, id))
      .returning();
    if (!updated) throw new Error("Project not found");
    return updated;
  }

  async deleteProject(id: number): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
}

export const storage = new DatabaseStorage();