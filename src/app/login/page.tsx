// src/app/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
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
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { UtensilsCrossed } from 'lucide-react';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user } = useAuth();
  const { toast } = useToast();

  const redirect = searchParams.get('redirect');

  useEffect(() => {
    if (user) {
      router.push(redirect || '/');
    }
  }, [user, router, redirect]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const success = login(phone);

    if (success) {
      router.push(redirect || '/');
    } else {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'User not found. Please try again or register.',
      });
      setIsSubmitting(false);
    }
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
            <CardTitle>Customer Login</CardTitle>
            <CardDescription>
              Enter your phone number to login or register.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="1234567890"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary hover:underline">
                Register
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
