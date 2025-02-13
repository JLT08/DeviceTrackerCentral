import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { storage } from "./storage";
import { EmailService } from "./email";

export function setupWebSocket(server: Server) {
  console.log('Setting up WebSocket server');
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');
  });

  const broadcast = (data: any) => {
    console.log('Broadcasting:', data);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  // Simulate device status updates every 5 seconds
  setInterval(async () => {
    try {
      const devices = await storage.getDevices();
      const users = await storage.getUsers();
      console.log(`Checking status for ${devices.length} devices`);

      for (const device of devices) {
        const isOnline = Math.random() > 0.1; // Simulate device status
        if (device.isOnline !== isOnline) {
          await storage.updateDevice(device.id, {
            ...device,
            isOnline,
            lastSeen: new Date(),
          });

          // Broadcast the status change
          broadcast({
            type: "device_status",
            deviceId: device.id,
            isOnline,
            lastSeen: new Date(),
          });

          // Send email notifications to all users
          for (const user of users) {
            await EmailService.sendDeviceStatusNotification(user, device, isOnline);
          }
        }
      }
    } catch (error) {
      console.error('Error in device status check:', error);
    }
  }, 5000);

  return wss;
}