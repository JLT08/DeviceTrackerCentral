import { useQuery } from "@tanstack/react-query";
import { type Device, type DeviceGroup, deviceCategories } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeviceStatus } from "@/components/device-status";
import { DeviceGroupForm } from "@/components/device-group-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Plus } from "lucide-react";
import { capitalize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent
} from "@/components/ui/dialog";

export function DeviceGroups() {
  const { data: devices, isLoading: isLoadingDevices } = useQuery<Device[]>({
    queryKey: ["/api/devices"],
  });

  const { data: groups, isLoading: isLoadingGroups } = useQuery<DeviceGroup[]>({
    queryKey: ["/api/device-groups"],
  });

  const devicesByGroup = devices?.reduce((acc, device) => {
    const groupId = device.groupId?.toString() || "ungrouped";
    if (!acc[groupId]) acc[groupId] = [];
    acc[groupId].push(device);
    return acc;
  }, {} as Record<string, Device[]>);

  const devicesByCategory = devices?.reduce((acc, device) => {
    if (!acc[device.category]) acc[device.category] = [];
    acc[device.category].push(device);
    return acc;
  }, {} as Record<string, Device[]>);

  if (isLoadingDevices || isLoadingGroups) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Device Management</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DeviceGroupForm />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="groups">
        <TabsList>
          <TabsTrigger value="groups">By Groups</TabsTrigger>
          <TabsTrigger value="categories">By Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="mt-6">
          <div className="grid gap-6">
            {groups?.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{group.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {devicesByGroup?.[group.id.toString()]?.length || 0} devices
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {devicesByGroup?.[group.id.toString()]?.map((device) => (
                        <DeviceStatus key={device.id} device={device} />
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ))}

            {/* Ungrouped devices */}
            {devicesByGroup?.["ungrouped"]?.length ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Ungrouped Devices</span>
                    <span className="text-sm text-muted-foreground">
                      {devicesByGroup["ungrouped"].length} devices
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {devicesByGroup["ungrouped"].map((device) => (
                        <DeviceStatus key={device.id} device={device} />
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <div className="grid gap-6">
            {deviceCategories.map((category) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{capitalize(category)}</span>
                    <span className="text-sm text-muted-foreground">
                      {devicesByCategory?.[category]?.length || 0} devices
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {devicesByCategory?.[category]?.map((device) => (
                        <DeviceStatus key={device.id} device={device} />
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}