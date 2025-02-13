import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { DeviceForm } from "@/components/device-form";
import { DeviceGroups } from "@/components/device-groups";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Device, type InsertDevice } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DeviceStatus } from "@/components/device-status";

export default function DevicesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: devices, isLoading } = useQuery<Device[]>({
    queryKey: ["/api/devices"],
  });

  const createMutation = useMutation({
    mutationFn: async (device: InsertDevice) => {
      const res = await apiRequest("POST", "/api/devices", device);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Device created successfully",
      });
    },
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <Navigation />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Devices</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Device
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Device</DialogTitle>
                </DialogHeader>
                <DeviceForm
                  onSubmit={(data) => createMutation.mutate(data)}
                />
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Tabs defaultValue="list" className="space-y-6">
              <TabsList>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="groups">Group View</TabsTrigger>
              </TabsList>

              <TabsContent value="list">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {devices?.map((device) => (
                    <DeviceStatus key={device.id} device={device} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="groups">
                <DeviceGroups />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
}