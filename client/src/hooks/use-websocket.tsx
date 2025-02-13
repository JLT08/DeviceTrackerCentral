import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

type WebSocketStatus = "connected" | "disconnected" | "connecting";

interface WebSocketContextType {
  status: WebSocketStatus;
  socket: WebSocket | null;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [status, setStatus] = useState<WebSocketStatus>("disconnected");
  const { toast } = useToast();

  useEffect(() => {
    const connectWebSocket = () => {
      setStatus("connecting");
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setStatus("connected");
        setSocket(ws);
        toast({
          title: "WebSocket Connected",
          description: "Real-time updates are now active",
        });
      };

      ws.onclose = () => {
        setStatus("disconnected");
        setSocket(null);
        toast({
          title: "WebSocket Disconnected",
          description: "Attempting to reconnect...",
          variant: "destructive",
        });
        // Attempt to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        ws.close();
      };
    };

    connectWebSocket();

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ status, socket }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}
