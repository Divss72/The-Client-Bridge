"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import Cookies from "js-cookie";
import axios from "axios";
import { 
  Kanban, Plus, MoreHorizontal, DollarSign, Calendar
} from "lucide-react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Deal {
  id: number;
  title: string;
  amount: number;
  stage: string;
  expected_close_date: string;
  client_id?: number;
  lead_id?: number;
}

const STAGES = ["Prospecting", "Qualification", "Proposal", "Closing", "Won", "Lost"];

export default function PipelinePage() {
  const token = Cookies.get("access_token");
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "", amount: "", stage: "Prospecting", expected_close_date: ""
  });

  const fetchDeals = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/pipeline/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeals(res.data);
    } catch (error) {
      toast.error("Failed to load deals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchDeals();
  }, [token]);

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/api/pipeline/", {
        ...formData,
        amount: parseFloat(formData.amount) || 0,
        expected_close_date: formData.expected_close_date ? new Date(formData.expected_close_date).toISOString() : null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Deal created");
      setIsAddOpen(false);
      setFormData({ title: "", amount: "", stage: "Prospecting", expected_close_date: "" });
      fetchDeals();
    } catch (error) {
      toast.error("Failed to create deal");
    }
  };

  const updateDealStage = async (dealId: number, newStage: string) => {
    // Optimistic UI update
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: newStage } : d));
    
    try {
      await axios.put(`http://localhost:8000/api/pipeline/${dealId}`, { stage: newStage }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Stage updated");
    } catch (error) {
      toast.error("Failed to update stage");
      fetchDeals(); // revert on failure
    }
  };

  const calculateStageTotal = (stage: string) => {
    return deals.filter(d => d.stage === stage).reduce((sum, d) => sum + d.amount, 0);
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Kanban className="w-8 h-8 text-primary" />
            Sales Pipeline
          </h1>
          <p className="text-muted-foreground mt-1">Drag and drop deals across stages.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Add Deal
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-panel">
            <DialogHeader>
              <DialogTitle>Add New Deal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateDeal} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Deal Title</Label>
                <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Stage</Label>
                  <Select value={formData.stage} onValueChange={v => setFormData({...formData, stage: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Expected Close Date</Label>
                <Input type="date" value={formData.expected_close_date} onChange={e => setFormData({...formData, expected_close_date: e.target.value})} />
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full">Create Deal</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 flex-1 items-start snap-x snap-mandatory">
        {STAGES.map(stage => {
          const stageDeals = deals.filter(d => d.stage === stage);
          return (
            <div key={stage} className="flex-shrink-0 w-80 bg-muted/30 rounded-xl border border-border/50 flex flex-col max-h-full snap-center">
              <div className="p-3 border-b border-border/50 flex justify-between items-center bg-card/50 rounded-t-xl">
                <h3 className="font-semibold text-sm">{stage}</h3>
                <Badge variant="secondary" className="text-xs">
                  ₹{calculateStageTotal(stage).toLocaleString()}
                </Badge>
              </div>
              
              <div className="flex-1 p-2 overflow-y-auto space-y-2">
                <AnimatePresence>
                  {stageDeals.map(deal => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={deal.id}
                      draggable
                      onDragStart={(e: any) => {
                        e.dataTransfer.setData("dealId", deal.id.toString());
                      }}
                      className="glass-panel p-3 rounded-lg border border-border/50 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
                    >
                      <div className="font-medium text-sm mb-2">{deal.title}</div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <DollarSign className="w-3 h-3 text-green-500" />
                          {deal.amount.toLocaleString()}
                        </span>
                        {deal.expected_close_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(deal.expected_close_date), "MMM d")}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {/* Drop Zone */}
                <div 
                  className="h-10 rounded-lg border-2 border-dashed border-transparent hover:border-primary/30 transition-colors"
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    const dealId = parseInt(e.dataTransfer.getData("dealId"));
                    if (dealId) updateDealStage(dealId, stage);
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
