import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Server, Folder, LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Navigation() {
  const { logoutMutation } = useAuth();

  return (
    <div className="flex flex-col h-screen w-64 border-r bg-background">
      {/* Header */}
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold">ICUMS</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        <Link href="/">
          <Button variant="ghost" className="w-full justify-start">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
        </Link>
        <Link href="/devices">
          <Button variant="ghost" className="w-full justify-start">
            <Server className="h-4 w-4 mr-2" />
            Devices
          </Button>
        </Link>
        <Link href="/projects">
          <Button variant="ghost" className="w-full justify-start">
            <Folder className="h-4 w-4 mr-2" />
            Projects
          </Button>
        </Link>
      </nav>

      {/* Logout Section */}
      <div className="mt-auto">
        <Separator />
        <div className="p-4">
          <Button
            variant="destructive"
            className="w-full justify-start font-semibold"
            onClick={() => logoutMutation.mutate()}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}