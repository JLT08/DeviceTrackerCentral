import { useState } from "react";
import { type Device } from "@shared/schema";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DeviceForm } from "./device-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DeviceStatusProps {
  device: Device;
}

export function DeviceStatus({ device }: DeviceStatusProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateDeviceMutation = useMutation({
    mutationFn: async (updatedDevice: Partial<Device>) => {
      const res = await apiRequest("PATCH", `/api/devices/${device.id}`, updatedDevice);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({
        title: "Success",
        description: "Device updated successfully",
      });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteDeviceMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/devices/${device.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({
        title: "Success",
        description: "Device deleted successfully",
      });
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{device.name}</h3>
          <Badge variant={device.isOnline ? "default" : "destructive"}>
            {device.isOnline ? "Online" : "Offline"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Edit2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Device</DialogTitle>
              </DialogHeader>
              <DeviceForm 
                onSubmit={(data) => updateDeviceMutation.mutate(data)}
                defaultValues={{
                  name: device.name,
                  ipAddress: device.ipAddress,
                  description: device.description || '',
                  category: device.category,
                  groupId: device.groupId,
                }}
              />
            </DialogContent>
          </Dialog>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => deleteDeviceMutation.mutate()}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{device.ipAddress}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Last seen: {device.lastSeen ? formatDistanceToNow(new Date(device.lastSeen), { addSuffix: true }) : 'Never'}
        </p>
        {device.description && (
          <p className="text-sm text-muted-foreground mt-2">{device.description}</p>
        )}
      </CardContent>
    </Card>
  );
}