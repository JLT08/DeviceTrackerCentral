import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { loginMutation, registerMutation, user } = useAuth();
  const [_, setLocation] = useLocation();

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const form = useForm({
    resolver: zodResolver(isLogin ? 
      insertUserSchema.pick({ username: true, password: true }) :
      insertUserSchema
    ),
    defaultValues: {
      username: "",
      password: "",
      email: "",
    },
  });

  const onSubmit = (data: { username: string; password: string; email?: string }) => {
    if (isLogin) {
      loginMutation.mutate({ username: data.username, password: data.password });
    } else {
      registerMutation.mutate(data as { username: string; password: string; email: string });
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Form Section */}
      <div className="flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 pointer-events-none" />
        <div className="w-full max-w-md relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "register"}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {isLogin ? "Welcome Back" : "Create Account"}
                  </h1>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <Label className="text-sm font-medium">Username</Label>
                            <FormControl>
                              <Input 
                                {...field} 
                                className="h-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                autoComplete="username" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {!isLogin && (
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <Label className="text-sm font-medium">Email</Label>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="email"
                                  className="h-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                  autoComplete="email" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <Label className="text-sm font-medium">Password</Label>
                            <FormControl>
                              <Input 
                                type="password" 
                                {...field} 
                                className="h-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                autoComplete={isLogin ? "current-password" : "new-password"}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full h-10 bg-gradient-to-r from-primary to-primary/90 hover:opacity-90 transition-opacity"
                        disabled={loginMutation.isPending || registerMutation.isPending}
                      >
                        {isLogin ? "Sign In" : "Create Account"}
                      </Button>

                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            Or
                          </span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full hover:bg-primary/5"
                        onClick={() => {
                          setIsLogin(!isLogin);
                          form.reset();
                        }}
                      >
                        {isLogin ? "Create an account" : "Sign in instead"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-10" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-md relative"
        >
          <h2 className="text-4xl font-bold mb-6">ICUMS Infrastructure Management</h2>
          <p className="text-lg opacity-90 mb-8">
            Monitor your IT infrastructure, manage devices, and track projects all in one place.
          </p>
          <ul className="space-y-4 text-lg">
            {["Real-time device monitoring", "Infrastructure management", "Project tracking", "Team collaboration"].map((feature, index) => (
              <motion.li
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                className="flex items-center space-x-2"
              >
                <div className="h-2 w-2 rounded-full bg-primary-foreground/90" />
                <span>{feature}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}