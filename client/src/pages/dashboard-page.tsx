import { Navigation } from "@/components/navigation";
import { DeviceStatus } from "@/components/device-status";
import { useQuery } from "@tanstack/react-query";
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

const statusColors = {
  not_started: "secondary",
  in_progress: "default",
  complete: "success",
} as const;

export default function DashboardPage() {
  const { data: devices, isLoading: isLoadingDevices } = useQuery<Device[]>({
    queryKey: ["/api/devices"],
  });

  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <Navigation />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

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
                            <Badge variant={statusColors[project.status]}>
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
