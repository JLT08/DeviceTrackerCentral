import { useEffect, useState } from "react";
import { Device } from "@shared/schema";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export function DeviceStatus({ device }: { device: Device }) {
  const [status, setStatus] = useState(device);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "device_status" && data.deviceId === device.id) {
        setStatus((prev) => ({
          ...prev,
          isOnline: data.isOnline,
          lastSeen: new Date(data.lastSeen),
        }));
      }
    };

    return () => socket.close();
  }, [device.id]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="font-medium">{status.name}</h3>
        <Badge variant={status.isOnline ? "default" : "destructive"}>
          {status.isOnline ? "Online" : "Offline"}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{status.ipAddress}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Last seen: {formatDistanceToNow(new Date(status.lastSeen), { addSuffix: true })}
        </p>
      </CardContent>
    </Card>
  );
}
