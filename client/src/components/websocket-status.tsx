import { useWebSocket } from "@/hooks/use-websocket";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";

export function WebSocketStatus() {
  const { status } = useWebSocket();

  const statusConfig = {
    connected: {
      variant: "default" as const,
      icon: Wifi,
      text: "Connected",
    },
    disconnected: {
      variant: "destructive" as const,
      icon: WifiOff,
      text: "Disconnected",
    },
    connecting: {
      variant: "secondary" as const,
      icon: Wifi,
      text: "Connecting...",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className="flex items-center gap-1"
    >
      <Icon className="h-3 w-3" />
      <span>{config.text}</span>
    </Badge>
  );
}
