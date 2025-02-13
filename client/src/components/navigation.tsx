import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Server, Folder, LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { WebSocketStatus } from "@/components/websocket-status";

export function Navigation() {
  const { logoutMutation } = useAuth();
  const [location] = useLocation();

  return (
    <div className="flex flex-col h-screen w-64 border-r bg-background">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">ICUMS</h1>
          <WebSocketStatus />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start"
          asChild
        >
          <Link href="/">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Dashboard
          </Link>
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start"
          asChild
        >
          <Link href="/devices">
            <Server className="h-4 w-4 mr-2" />
            Devices
          </Link>
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start"
          asChild
        >
          <Link href="/projects">
            <Folder className="h-4 w-4 mr-2" />
            Projects
          </Link>
        </Button>
      </nav>

      {/* Footer with Logout */}
      <div className="p-4 border-t">
        <Button
          variant="destructive"
          className="w-full justify-start"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}