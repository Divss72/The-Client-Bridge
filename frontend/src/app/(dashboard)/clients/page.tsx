"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { Search, Plus, Building2, Phone, Mail, MoreHorizontal, Loader2, Activity } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const FADE_UP = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    industry: ''
  });

  async function fetchClients() {
    setLoading(true);
    try {
      const res = await api.get('/clients/');
      setClients(res.data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load clients.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company_name) {
      toast.error("Company name is required.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/clients/', formData);
      toast.success("Client added successfully.");
      setOpen(false);
      setFormData({ company_name: '', contact_name: '', email: '', phone: '', industry: '' });
      fetchClients();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create client.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredClients = clients.filter(c => 
    c.company_name?.toLowerCase().includes(search.toLowerCase()) || 
    c.contact_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.1 } }
      }}
      className="space-y-6"
    >
      <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
          <p className="text-muted-foreground mt-1">Manage your client relationships and intelligence.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
                <DialogDescription>
                  Create a new client profile. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateClient} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name*</Label>
                  <Input 
                    id="company_name" 
                    value={formData.company_name} 
                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                    placeholder="Acme Corp" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_name">Contact Name</Label>
                    <Input 
                      id="contact_name" 
                      value={formData.contact_name} 
                      onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                      placeholder="John Doe" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select onValueChange={(v) => setFormData({...formData, industry: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Logistics">Logistics</SelectItem>
                        <SelectItem value="SaaS">SaaS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="contact@acme.com" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+1 (555) 000-0000" 
                  />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Create Client Profile
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      <motion.div variants={FADE_UP}>
        <Card className="shadow-sm border-border/60">
          <CardContent className="p-0">
            <div className="p-4 border-b border-border/60 flex items-center bg-muted/20">
               <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search clients..."
                    className="pl-8 bg-background shadow-none"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
               </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="w-[300px]">Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Health / Industry</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {loading ? (
                      Array.from({length: 5}).map((_, i) => (
                          <TableRow key={`skeleton-${i}`}>
                              <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                              <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                          </TableRow>
                      ))
                    ) : filteredClients.length === 0 ? (
                      <TableRow>
                          <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                              No clients found.
                          </TableCell>
                      </TableRow>
                    ) : (
                      filteredClients.map((client, idx) => (
                        <motion.tr 
                          key={client.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="hover:bg-muted/50 transition-colors group"
                        >
                          <TableCell className="font-medium">
                              <Link href={`/clients/${client.id}`} className="flex items-center gap-3 hover:text-primary transition-colors">
                                 <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                     <Building2 className="w-4 h-4" />
                                 </div>
                                 <span className="truncate">{client.company_name}</span>
                              </Link>
                          </TableCell>
                          <TableCell>
                              <div className="flex flex-col">
                                  <span className="text-[14px]">{client.contact_name || 'N/A'}</span>
                                  {client.email && <span className="text-[12px] text-muted-foreground flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3"/> {client.email}</span>}
                              </div>
                          </TableCell>
                          <TableCell>
                              <div className="flex flex-col gap-1.5 items-start">
                                {client.health_status === 'Critical' ? (
                                  <Badge variant="destructive" className="flex items-center gap-1 text-[10px]"><Activity className="w-3 h-3" /> Critical Risk</Badge>
                                ) : client.health_status === 'Warning' ? (
                                  <Badge variant="outline" className="text-amber-500 border-amber-500/30 flex items-center gap-1 text-[10px]"><Activity className="w-3 h-3" /> Warning</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 flex items-center gap-1 text-[10px]"><Activity className="w-3 h-3" /> Healthy</Badge>
                                )}
                                {client.industry && <span className="text-[12px] text-muted-foreground">{client.industry}</span>}
                              </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-[13px]">
                              {format(new Date(client.created_at), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                              <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="group-hover:opacity-100 md:opacity-0 transition-opacity">
                                          <MoreHorizontal className="w-4 h-4" />
                                      </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                      <DropdownMenuItem asChild><Link href={`/clients/${client.id}`}>View Profile</Link></DropdownMenuItem>
                                      <DropdownMenuItem>Log Interaction</DropdownMenuItem>
                                      <DropdownMenuItem className="text-destructive focus:text-destructive">Delete Client</DropdownMenuItem>
                                  </DropdownMenuContent>
                              </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
