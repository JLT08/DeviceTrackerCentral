import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertDeviceGroupSchema, type InsertDeviceGroup } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function DeviceGroupForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertDeviceGroup>({
    resolver: zodResolver(insertDeviceGroupSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: InsertDeviceGroup) => {
      const res = await apiRequest("POST", "/api/device-groups", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/device-groups"] });
      toast({
        title: "Success",
        description: "Device group created successfully",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit((data) => createGroupMutation.mutate(data))}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          disabled={createGroupMutation.isPending}
          className="w-full"
        >
          Create Group
        </Button>
      </form>
    </Form>
  );
}