"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building2, Phone, Mail, Calendar, Activity, AlertTriangle, Sparkles, 
  MessageCircle, FileText, ChevronLeft, Plus, Loader2, RefreshCw, Tags, 
  CreditCard, DollarSign, UploadCloud, Bell, CheckCircle2, Presentation 
} from 'lucide-react';
import Link from 'next/link';
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const FADE_UP = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function ClientProfilePage() {
  const params = useParams();
  const [client, setClient] = useState<any>(null);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  
  const [logOpen, setLogOpen] = useState(false);
  const [logging, setLogging] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [newInteraction, setNewInteraction] = useState({
    type: 'email',
    content: ''
  });

  const [uploading, setUploading] = useState(false);

  async function fetchClientData() {
    try {
      const res = await api.get(`/clients/${params.id}`);
      setClient(res.data);
      setLoading(false);
      fetchAiSummary();
    } catch (e) {
      console.error(e);
      toast.error("Failed to load client details.");
    }
  }

  async function fetchAiSummary() {
    setSummaryLoading(true);
    try {
        const summaryRes = await api.get(`/ai/summary/${params.id}`);
        setAiSummary(summaryRes.data.summary);
    } catch (e) {
        console.error(e);
    } finally {
        setSummaryLoading(false);
    }
  }

  useEffect(() => {
    if (params.id) fetchClientData();
  }, [params.id]);

  const handleLogInteraction = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newInteraction.content) {
          toast.error("Please provide content for the interaction.");
          return;
      }

      setLogging(true);
      try {
          await api.post('/interactions/', {
              ...newInteraction,
              client_id: parseInt(params.id as string)
          });
          toast.success("Interaction logged and vectorized.");
          setLogOpen(false);
          setNewInteraction({ type: 'email', content: '' });
          fetchClientData();
      } catch (error) {
          toast.error("Failed to log interaction.");
      } finally {
          setLogging(false);
      }
  };

  const handleRefreshIntelligence = async () => {
      setRefreshing(true);
      try {
          await api.get(`/churn/evaluate/${params.id}`);
          await fetchAiSummary();
          const res = await api.get(`/clients/${params.id}`);
          setClient(res.data);
          toast.success("Intelligence updated based on latest memory.");
      } catch (error) {
          toast.error("Failed to update intelligence.");
      } finally {
          setRefreshing(false);
      }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const formData = new FormData();
    formData.append("file", file);
    
    setUploading(true);
    try {
      await api.post(`/upload/?client_id=${params.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Document uploaded & analyzed successfully");
      fetchClientData();
    } catch (error) {
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-[200px]" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-[400px] md:col-span-1 rounded-xl" />
                <Skeleton className="h-[600px] md:col-span-2 rounded-xl" />
            </div>
        </div>
    );
  }

  if (!client) return <div>Client not found</div>;

  const tags = client.personality_tags && client.personality_tags.length > 0 ? client.personality_tags : ["Data-driven", "Responsive"];

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.1 } }
      }}
      className="space-y-6 pb-8"
    >
      <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <Link href="/clients">
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-full shadow-sm hover:bg-muted">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
            </Link>
            <div>
              <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                {client.company_name}
                {client.health_status === 'Critical' ? <Badge variant="destructive" className="ml-2">Critical Health</Badge> : null}
              </h2>
              <p className="text-muted-foreground flex items-center gap-2 text-sm mt-1">
                  <Building2 className="w-4 h-4" /> {client.industry || 'General'} · Client ID: {client.id}
              </p>
            </div>
        </div>
        <Button 
            variant="default" 
            className="flex items-center gap-2 shadow-sm shadow-primary/20" 
            onClick={handleRefreshIntelligence}
            disabled={refreshing}
        >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Intelligence
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-1">
            <motion.div variants={FADE_UP}>
              <Card className="glass-panel hover:shadow-md transition-shadow">
                  <CardHeader>
                      <CardTitle>Client Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                      <div className="flex items-center gap-3 text-sm">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-primary"/>
                          </div>
                          <div>
                              <p className="text-muted-foreground text-[11px] uppercase font-semibold tracking-wider">Contact</p>
                              <p className="font-medium text-[14px]">{client.contact_name || 'Not provided'}</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Mail className="w-4 h-4 text-primary"/>
                          </div>
                          <div className="truncate">
                              <p className="text-muted-foreground text-[11px] uppercase font-semibold tracking-wider">Email</p>
                              <p className="font-medium text-[14px] truncate">{client.email || 'Not provided'}</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Phone className="w-4 h-4 text-primary"/>
                          </div>
                          <div>
                              <p className="text-muted-foreground text-[11px] uppercase font-semibold tracking-wider">Phone</p>
                              <p className="font-medium text-[14px]">{client.phone || 'Not provided'}</p>
                          </div>
                      </div>
                      <div className="pt-4 border-t border-border mt-2 space-y-3">
                         <div>
                           <p className="text-muted-foreground text-[11px] uppercase font-semibold tracking-wider mb-2 flex items-center gap-1">
                              <Tags className="w-3 h-3" /> Personality Profile
                           </p>
                           <div className="flex flex-wrap gap-2">
                             {tags.map((tag: string, idx: number) => (
                               <Badge key={idx} variant="secondary" className="bg-secondary/50 hover:bg-secondary text-xs">{tag}</Badge>
                             ))}
                           </div>
                         </div>
                      </div>
                  </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={FADE_UP}>
              <Card className="glass-panel hover:shadow-md transition-shadow">
                  <CardHeader>
                      <CardTitle>Financials</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-border">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Status</span>
                        </div>
                        <Badge variant="outline" className={client.payment_status === 'Up to date' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : ''}>
                          {client.payment_status || 'Up to date'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">LTV / Revenue</span>
                        </div>
                        <span className="font-bold">₹{(client.total_revenue || 125000).toLocaleString()}</span>
                      </div>
                  </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={FADE_UP}>
              <Card className="glass-panel border-destructive/30 bg-destructive/5 dark:bg-destructive/10 relative overflow-hidden hover:shadow-md transition-shadow">
                  <div className="absolute top-0 right-0 p-4 opacity-10 blur-xl">
                      <AlertTriangle className="w-32 h-32 text-destructive" />
                  </div>
                  <CardHeader>
                      <CardTitle className="text-destructive flex items-center gap-2 text-base">
                         <Activity className="w-5 h-5" /> Churn Intelligence
                      </CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="flex items-end gap-2 mb-2">
                          <span className="text-5xl font-bold tracking-tighter text-destructive">
                              {client.churn_score ? Math.round(client.churn_score.score) : (client.churn_probability ? Math.round(client.churn_probability * 100) : 15)}
                          </span>
                          <span className="text-muted-foreground text-sm font-medium mb-1.5">/ 100 Risk</span>
                      </div>
                      <p className="text-sm font-medium text-destructive/80 mt-4 leading-relaxed">
                          {client.churn_score?.reason || "Client health is stable. Engagement score is currently at normal levels."}
                      </p>
                  </CardContent>
              </Card>
            </motion.div>
        </div>

        <div className="space-y-6 lg:col-span-2">
            <motion.div variants={FADE_UP}>
              <Card className="glass-panel border-primary/20 shadow-primary/5 shadow-lg relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-50 pointer-events-none"></div>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-primary">
                          <Sparkles className="w-5 h-5" /> AI Relationship Synthesis
                      </CardTitle>
                      <CardDescription>RAG-powered reasoning from vector memory</CardDescription>
                  </CardHeader>
                  <CardContent>
                      {summaryLoading ? (
                          <div className="space-y-3">
                              <Skeleton className="h-4 w-full bg-primary/10" />
                              <Skeleton className="h-4 w-[90%] bg-primary/10" />
                              <Skeleton className="h-4 w-[75%] bg-primary/10" />
                          </div>
                      ) : (
                          <p className="leading-relaxed text-foreground/90 font-medium text-[15px]">
                              {aiSummary}
                          </p>
                      )}
                  </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={FADE_UP}>
              <Tabs defaultValue="timeline" className="w-full">
                <TabsList className="w-full bg-muted/50 p-1 rounded-lg grid grid-cols-4 h-auto">
                  <TabsTrigger value="timeline" className="py-2.5"><Activity className="w-4 h-4 mr-2 hidden sm:block" /> Timeline</TabsTrigger>
                  <TabsTrigger value="documents" className="py-2.5"><FileText className="w-4 h-4 mr-2 hidden sm:block" /> Documents</TabsTrigger>
                  <TabsTrigger value="discussions" className="py-2.5"><Presentation className="w-4 h-4 mr-2 hidden sm:block" /> Discussions</TabsTrigger>
                  <TabsTrigger value="tasks" className="py-2.5"><Bell className="w-4 h-4 mr-2 hidden sm:block" /> Tasks</TabsTrigger>
                </TabsList>
                
                <TabsContent value="timeline" className="mt-4">
                  <Card className="glass-panel hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
                          <div>
                              <CardTitle>Timeline</CardTitle>
                              <CardDescription>Client history and interactions</CardDescription>
                          </div>
                          <Dialog open={logOpen} onOpenChange={setLogOpen}>
                              <DialogTrigger asChild>
                                  <Button size="sm" className="shadow-sm"><Plus className="w-4 h-4 mr-2"/> Log Activity</Button>
                              </DialogTrigger>
                              <DialogContent className="glass-panel">
                                  <DialogHeader>
                                      <DialogTitle>Log Activity</DialogTitle>
                                      <DialogDescription>
                                          Record a summary. It will be vectorized and analyzed for sentiment.
                                      </DialogDescription>
                                  </DialogHeader>
                                  <form onSubmit={handleLogInteraction} className="space-y-4 py-2">
                                      <div className="space-y-2">
                                          <Label>Interaction Type</Label>
                                          <Select 
                                              value={newInteraction.type} 
                                              onValueChange={(v) => setNewInteraction({...newInteraction, type: v})}
                                          >
                                              <SelectTrigger>
                                                  <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                  <SelectItem value="email">Email</SelectItem>
                                                  <SelectItem value="meeting">Meeting</SelectItem>
                                                  <SelectItem value="support_ticket">Support Ticket</SelectItem>
                                                  <SelectItem value="call">Call</SelectItem>
                                              </SelectContent>
                                          </Select>
                                      </div>
                                      <div className="space-y-2">
                                          <Label>Content / Summary</Label>
                                          <Textarea 
                                              rows={4} 
                                              placeholder="Summary of what was discussed..." 
                                              value={newInteraction.content}
                                              onChange={(e) => setNewInteraction({...newInteraction, content: e.target.value})}
                                          />
                                      </div>
                                      <DialogFooter>
                                          <Button type="submit" disabled={logging} className="w-full">
                                              {logging ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                              Save to Memory
                                          </Button>
                                      </DialogFooter>
                                  </form>
                              </DialogContent>
                          </Dialog>
                      </CardHeader>
                      <CardContent className="pt-6">
                          <div className="space-y-6">
                              <AnimatePresence>
                                {client.interactions && client.interactions.length > 0 ? (
                                    [...client.interactions].sort((a:any, b:any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((interaction: any, idx: number) => (
                                        <motion.div 
                                          key={interaction.id || idx} 
                                          initial={{ opacity: 0, x: -20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: idx * 0.05 }}
                                          className="relative pl-8 pb-6 last:pb-0"
                                        >
                                            <div className="absolute left-3 top-2 h-full w-[2px] bg-border last:hidden"></div>
                                            <div className={`absolute left-[7px] top-2 h-3 w-3 rounded-full border-2 border-card ${interaction.sentiment === 'negative' ? 'bg-destructive ring-4 ring-destructive/20 shadow-sm shadow-destructive' : interaction.sentiment === 'positive' ? 'bg-emerald-500 ring-4 ring-emerald-500/20 shadow-sm shadow-emerald-500' : 'bg-primary ring-4 ring-primary/20 shadow-sm shadow-primary'}`}></div>
                                            
                                            <div className="bg-muted/30 border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-3">
                                                  <Badge variant="secondary" className="w-fit mb-1 sm:mb-0 capitalize flex items-center gap-1.5 bg-background">
                                                      {interaction.type === 'email' ? <Mail className="w-3 h-3"/> : interaction.type === 'meeting' ? <Calendar className="w-3 h-3"/> : <MessageCircle className="w-3 h-3"/>}
                                                      {interaction.type}
                                                  </Badge>
                                                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{format(new Date(interaction.created_at), 'MMM dd, yyyy h:mm a')}</span>
                                              </div>
                                              <p className="text-sm text-foreground/90 leading-relaxed">
                                                  {interaction.content}
                                              </p>
                                              
                                              {interaction.action_items && interaction.action_items.length > 0 && (
                                                  <div className="mt-3 pt-3 border-t border-border/50">
                                                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Action Items Detected</p>
                                                    <ul className="list-disc pl-4 space-y-1">
                                                      {interaction.action_items.map((item: string, i: number) => (
                                                        <li key={i} className="text-xs text-foreground/80">{item}</li>
                                                      ))}
                                                    </ul>
                                                  </div>
                                              )}
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <motion.div 
                                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                      className="py-12 text-center border-2 border-dashed border-border rounded-xl bg-muted/10 flex flex-col items-center"
                                    >
                                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                                          <FileText className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-foreground text-sm font-medium">No timeline events</p>
                                        <p className="text-muted-foreground text-xs mt-1 max-w-[200px] text-center">Log an activity to start building the intelligence timeline.</p>
                                    </motion.div>
                                )}
                              </AnimatePresence>
                          </div>
                      </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="documents" className="mt-4">
                  <Card className="glass-panel">
                    <CardHeader className="flex flex-row justify-between items-center border-b border-border/50 pb-4">
                      <div>
                        <CardTitle>Document Manager</CardTitle>
                        <CardDescription>Files and AI Summaries</CardDescription>
                      </div>
                      <div>
                        <Input 
                          type="file" 
                          className="hidden" 
                          id="file-upload" 
                          accept=".pdf,.txt,.csv"
                          onChange={handleFileUpload}
                          disabled={uploading}
                        />
                        <Label htmlFor="file-upload">
                          <Button asChild size="sm" disabled={uploading}>
                            <span>
                              {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
                              Upload Document
                            </span>
                          </Button>
                        </Label>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {client.files && client.files.length > 0 ? (
                          client.files.map((file: any) => (
                            <div key={file.id} className="p-4 rounded-xl border border-border/50 bg-muted/30">
                              <div className="flex justify-between items-center mb-2">
                                <div className="font-medium flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-primary" /> {file.filename}
                                </div>
                                <span className="text-xs text-muted-foreground">{format(new Date(file.created_at), 'MMM dd, yyyy')}</span>
                              </div>
                              {file.ai_summary ? (
                                <div className="text-sm mt-2 pt-2 border-t border-border/50 text-muted-foreground">
                                  <strong className="text-foreground text-xs uppercase tracking-wider block mb-1">AI Summary</strong>
                                  {file.ai_summary}
                                </div>
                              ) : null}
                            </div>
                          ))
                        ) : (
                          <div className="py-12 text-center border-2 border-dashed border-border rounded-xl bg-muted/10">
                            <p className="text-muted-foreground text-sm">No documents uploaded yet.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="discussions" className="mt-4">
                  <Card className="glass-panel">
                    <CardHeader className="border-b border-border/50 pb-4">
                      <CardTitle>Discussions</CardTitle>
                      <CardDescription>Threads related to this client</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {client.discussions && client.discussions.length > 0 ? (
                        <div className="space-y-4">
                          {client.discussions.map((d: any) => (
                            <div key={d.id} className="p-4 rounded-xl border border-border/50 bg-muted/30 flex justify-between items-center">
                              <div className="font-medium">{d.title}</div>
                              <Link href="/discussions">
                                <Button variant="outline" size="sm">View Thread</Button>
                              </Link>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center border-2 border-dashed border-border rounded-xl bg-muted/10">
                          <p className="text-muted-foreground text-sm mb-4">No discussions found.</p>
                          <Link href="/discussions">
                            <Button variant="outline" size="sm">Go to Discussions</Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="tasks" className="mt-4">
                  <Card className="glass-panel">
                    <CardHeader className="flex flex-row justify-between items-center border-b border-border/50 pb-4">
                      <div>
                        <CardTitle>Client Tasks</CardTitle>
                        <CardDescription>To-dos and AI suggested actions</CardDescription>
                      </div>
                      <Link href="/tasks">
                        <Button variant="outline" size="sm">Manage Tasks</Button>
                      </Link>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {client.tasks && client.tasks.length > 0 ? (
                          client.tasks.map((t: any) => (
                            <div key={t.id} className="p-4 rounded-xl border border-border/50 bg-muted/30 flex items-start gap-4">
                              <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${t.status === 'Completed' ? 'text-green-500' : 'text-muted-foreground'}`} />
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  {t.title}
                                  {t.is_ai_suggested && <Badge variant="outline" className="text-[10px] h-5">AI Suggested</Badge>}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-12 text-center border-2 border-dashed border-border rounded-xl bg-muted/10">
                            <p className="text-muted-foreground text-sm">No tasks assigned.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
