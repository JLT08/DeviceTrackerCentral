import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { storage } from "./storage";

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  const broadcast = (data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  setInterval(async () => {
    const devices = await storage.getDevices();
    for (const device of devices) {
      const isOnline = Math.random() > 0.1; // Simulate device status
      if (device.isOnline !== isOnline) {
        await storage.updateDevice(device.id, {
          isOnline,
          lastSeen: new Date(),
        });
        broadcast({
          type: "device_status",
          deviceId: device.id,
          isOnline,
          lastSeen: new Date(),
        });
      }
    }
  }, 5000);
}
