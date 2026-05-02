"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import Cookies from "js-cookie";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { 
  Target, Plus, Search, MoreHorizontal, ArrowRightCircle
} from "lucide-react";
import { motion } from "framer-motion";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Lead {
  id: number;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  industry: string;
  status: string;
  source: string;
  created_at: string;
}

export default function LeadsPage() {
  const token = Cookies.get("access_token");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // New Lead form state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "", contact_name: "", email: "", phone: "", industry: ""
  });

  const fetchLeads = async () => {
    try {
      const res = await api.get("/leads/");
      setLeads(res.data);
    } catch (error) {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchLeads();
  }, [token]);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/leads/", formData);
      toast.success("Lead created successfully");
      setIsAddOpen(false);
      setFormData({ company_name: "", contact_name: "", email: "", phone: "", industry: "" });
      fetchLeads();
    } catch (error) {
      toast.error("Failed to create lead");
    }
  };

  const handleConvert = async (leadId: number) => {
    try {
      await api.post(`/leads/${leadId}/convert`, {});
      toast.success("Lead successfully converted to Client");
      fetchLeads();
    } catch (error) {
      toast.error("Conversion failed");
    }
  };

  const updateStatus = async (leadId: number, status: string) => {
    try {
      await api.put(`/leads/${leadId}`, { status });
      toast.success("Status updated");
      fetchLeads();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "New": return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      case "Contacted": return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
      case "Negotiation": return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20";
      case "Converted": return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "Lost": return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      default: return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
    }
  };

  const filteredLeads = leads.filter(l => 
    l.company_name.toLowerCase().includes(search.toLowerCase()) || 
    l.contact_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Target className="w-8 h-8 text-primary" />
            Leads & Prospects
          </h1>
          <p className="text-muted-foreground mt-1">Manage potential clients and track acquisition stages.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-panel">
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateLead} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input required value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact Name</Label>
                  <Input value={formData.contact_name} onChange={e => setFormData({...formData, contact_name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Input value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full">Create Lead</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden border border-border/50">
        <div className="p-4 border-b border-border/50 bg-muted/20 flex justify-between items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search leads..." 
              className="pl-9 bg-background/50 border-border/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">Loading leads...</TableCell>
              </TableRow>
            ) : filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No leads found.</TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead, idx) => (
                <motion.tr 
                  key={lead.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group hover:bg-muted/10"
                >
                  <TableCell className="font-medium">{lead.company_name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{lead.contact_name || 'N/A'}</span>
                      <span className="text-xs text-muted-foreground">{lead.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{lead.industry || 'Unknown'}</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(lead.status)} border-none`}>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(lead.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => updateStatus(lead.id, "Contacted")}>Mark as Contacted</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(lead.id, "Negotiation")}>Move to Negotiation</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(lead.id, "Lost")} className="text-destructive">Mark as Lost</DropdownMenuItem>
                        {lead.status !== 'Converted' && (
                          <DropdownMenuItem onClick={() => handleConvert(lead.id)} className="text-primary font-medium">
                            <ArrowRightCircle className="w-4 h-4 mr-2" />
                            Convert to Client
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
