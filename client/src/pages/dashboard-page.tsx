import { Navigation } from "@/components/navigation";
import { DeviceStatus } from "@/components/device-status";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type Device, type Project } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useState, useEffect } from "react";
import { useWebSocket } from "@/hooks/use-websocket";

// Updated status colors to use valid badge variants
const statusColors = {
  not_started: "secondary",
  in_progress: "default",
  complete: "default",
} as const;

type ProjectStatus = keyof typeof statusColors;

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { data: devices, isLoading: isLoadingDevices } = useQuery<Device[]>({
    queryKey: ["/api/devices"],
  });

  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { socket, status: wsStatus } = useWebSocket();
  const [connectionData, setConnectionData] = useState<Array<{
    timestamp: string;
    onlineDevices: number;
    totalDevices: number;
  }>>([]);

  // Update connection data and device status when receiving WebSocket messages
  useEffect(() => {
    if (!socket) return;

    const handleDeviceStatus = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === "device_status") {
        // Update device status in React Query cache
        queryClient.setQueryData<Device[]>(["/api/devices"], (oldDevices) => {
          if (!oldDevices) return oldDevices;
          return oldDevices.map(device => 
            device.id === data.deviceId 
              ? { ...device, isOnline: data.isOnline, lastSeen: data.lastSeen }
              : device
          );
        });

        // Update connection health graph
        setConnectionData(prev => {
          const now = new Date();
          const newPoint = {
            timestamp: now.toLocaleTimeString(),
            onlineDevices: (devices || []).filter(d => d.isOnline).length,
            totalDevices: (devices || []).length
          };

          // Keep last 10 data points for smooth animation
          const newData = [...prev, newPoint].slice(-10);
          return newData;
        });
      }
    };

    socket.addEventListener("message", handleDeviceStatus);
    return () => socket.removeEventListener("message", handleDeviceStatus);
  }, [socket, devices, queryClient]);

  if (!devices && isLoadingDevices) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Navigation />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

          {/* Connection Health Graph */}
          <section className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Connection Health Dashboard</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={connectionData}>
                    <defs>
                      <linearGradient id="connectionHealth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp"
                      tick={{ fill: 'hsl(var(--foreground))' }}
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="onlineDevices"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#connectionHealth)"
                      name="Online Devices"
                      animationDuration={300}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </section>

          {/* Device Status Grid */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Device Status</h2>
            {isLoadingDevices ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {devices?.map((device) => (
                  <DeviceStatus key={device.id} device={device} />
                ))}
              </div>
            )}
          </section>

          {/* Recent Projects */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
            <Card>
              <CardHeader>
                <CardTitle>Projects Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingProjects ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projects?.slice(0, 5).map((project) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">
                            {project.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusColors[project.status as ProjectStatus]}>
                              {project.status.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {project.description}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}