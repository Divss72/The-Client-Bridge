"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Admin');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', {
          name,
          email,
          password,
          role
      });
      toast.success("Account created successfully! Please login.");
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Registration failed. Email might exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/40 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10 mix-blend-multiply opacity-50 dark:opacity-20 animate-pulse"></div>

        <Card className="w-full max-w-md shadow-2xl backdrop-blur-sm bg-card/80 border-border z-10">
            <CardHeader className="space-y-2 flex items-center flex-col pt-8">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                    <BrainCircuit className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">Create Account</CardTitle>
                <CardDescription>
                    Get started with the future of CRM intelligence.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                            id="name" 
                            type="text" 
                            placeholder="John Doe" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                            id="email" 
                            type="email" 
                            placeholder="you@company.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input 
                            id="password" 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="Manager">Manager</SelectItem>
                                <SelectItem value="Salesperson">Salesperson</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 pb-8">
                    <Button type="submit" className="w-full h-11" disabled={loading}>
                        {loading ? 'Creating account...' : 'Sign up'}
                    </Button>
                    <div className="text-center text-sm text-muted-foreground w-full flex justify-between mx-auto items-center">
                        <div>Already have an account?</div> 
                        <Link href="/login" className="font-medium text-primary hover:underline">Log in</Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    </div>
  );
}
