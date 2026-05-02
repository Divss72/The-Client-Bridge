"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { BrainCircuit } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore(state => state.login);
  const [email, setEmail] = useState('demo@memoria.ai');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      await login(response.data.access_token);
      toast.success("Successfully logged in");
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Login failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/40 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10 mix-blend-multiply opacity-50 dark:opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl -z-10 mix-blend-multiply opacity-50 dark:opacity-20 animate-pulse delay-1000"></div>

        <Card className="w-full max-w-md shadow-2xl backdrop-blur-sm bg-card/80 border-border z-10">
            <CardHeader className="space-y-2 flex items-center flex-col pt-8">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                    <BrainCircuit className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
                <CardDescription>
                    Enter your credentials to access your AI CRM
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                            id="email" 
                            type="email" 
                            placeholder="admin@example.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Link href="#" className="text-sm font-medium text-primary hover:underline">Forgot password?</Link>
                        </div>
                        <Input 
                            id="password" 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 pb-8">
                    <Button type="submit" className="w-full h-11" disabled={loading}>
                        {loading ? 'Logging in...' : 'Log in'}
                    </Button>
                    <div className="text-center text-sm text-muted-foreground w-full flex justify-between mx-auto items-center">
                        <div>Don't have an account?</div> 
                        <Link href="/register" className="font-medium text-primary hover:underline">Sign up</Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    </div>
  );
}
