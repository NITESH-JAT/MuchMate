// src/components/auth/admin-auth-guard.tsx
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { UtensilsCrossed } from 'lucide-react';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { adminLogin } = useAuth();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = adminLogin(username, password);

    if (!success) {
      toast({
        variant: 'destructive',
        title: 'Admin Login Failed',
        description: 'Invalid credentials. Please try again.',
      });
      setIsSubmitting(false);
    }
    // On success, the AuthProvider state will change and the guard will render children
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleLogin}>
          <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
              <UtensilsCrossed className="h-8 w-8 text-primary" />
              <span className="text-2xl font-headline">MunchMate</span>
            </div>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Enter your admin credentials to access the dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}


export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { adminUser, isAuthLoading } = useAuth();

  // While loading, show a neutral loading screen to prevent content flashing
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="text-muted-foreground">Initializing...</p>
      </div>
    );
  }

  // If loading is complete and there's no admin user, show the admin login form
  if (!adminUser) {
    return <AdminLogin />;
  }

  // If loading is complete and an admin user exists, render the dashboard
  return <>{children}</>;
}
