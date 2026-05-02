"use client";

import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key, User, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user } = useAuthStore();

  const handleSave = () => {
      toast.success("Settings saved successfully.");
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account and platform configurations.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
             <CardTitle className="flex items-center gap-2"><User className="w-5 h-5"/> Profile</CardTitle>
             <CardDescription>Your personal information and role.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input defaultValue={user?.name} />
                  </div>
                  <div className="space-y-2">
                      <Label>Email</Label>
                      <Input defaultValue={user?.email} disabled />
                  </div>
              </div>
              <div className="space-y-2 pt-2">
                  <Label>Role</Label>
                  <div className="flex items-center gap-2 text-sm md:w-fit py-2 px-3 bg-muted rounded-md border border-border">
                      <ShieldCheck className="w-4 h-4 text-primary" /> {user?.role} Privileges
                  </div>
              </div>
          </CardContent>
          <CardFooter className="border-t border-border pt-4">
              <Button onClick={handleSave}>Save Profile</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
             <CardTitle className="flex items-center gap-2"><Key className="w-5 h-5"/> API Configuration</CardTitle>
             <CardDescription>Manage keys for internal tool integrations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="space-y-2">
                  <Label>OpenAI API Key (Custom Model Fallback)</Label>
                  <Input type="password" defaultValue="sk-................................" placeholder="sk-..." />
                  <p className="text-xs text-muted-foreground mt-1">Leave blank to use the platform's default provided models.</p>
              </div>
          </CardContent>
          <CardFooter className="border-t border-border pt-4 bg-muted/20">
              <Button onClick={handleSave}>Update Keys</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
