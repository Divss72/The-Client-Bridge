"use client";

import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Send, User, Bot, Loader2, Sparkles, Mail, Target } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your Memoria AI assistant. Ask me anything about your clients, chunks, or sentiment trends.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Smart Email State
  const [emailContext, setEmailContext] = useState('');
  const [emailTone, setEmailTone] = useState('professional');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  // Acquisition Insights State
  const [insights, setInsights] = useState<any[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    async function fetchClients() {
        try {
            const res = await api.get('/clients/');
            setClients(res.data);
        } catch (e) {
            console.error(e);
        }
    }
    fetchClients();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await api.post('/ai/query', { 
          query: userMsg,
          client_id: selectedClient === 'all' ? null : parseInt(selectedClient)
      });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (error) {
       setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to the intelligence core right now." }]);
    } finally {
      setLoading(false);
    }
  };

  const generateEmail = async () => {
    if (!emailContext) {
      toast.error("Please provide email context");
      return;
    }
    setEmailLoading(true);
    try {
      const res = await api.post('/ai/generate-email', { context: emailContext, tone: emailTone });
      setGeneratedEmail(res.data.content);
      toast.success("Email generated");
    } catch (error) {
      toast.error("Failed to generate email");
    } finally {
      setEmailLoading(false);
    }
  };

  const fetchInsights = async () => {
    setInsightsLoading(true);
    try {
      const res = await api.get('/ai/acquisition-insights');
      setInsights(res.data.insights);
    } catch (error) {
      toast.error("Failed to load insights");
    } finally {
      setInsightsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] animate-in fade-in zoom-in-95 duration-500 max-w-6xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Intelligence Hub</h2>
          <p className="text-muted-foreground">Natural language queries, smart communications, and acquisition insights.</p>
        </div>
      </div>

      <Tabs defaultValue="chat" className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid grid-cols-3 w-[400px] mb-4">
          <TabsTrigger value="chat"><BrainCircuit className="w-4 h-4 mr-2" /> Chat</TabsTrigger>
          <TabsTrigger value="email"><Mail className="w-4 h-4 mr-2" /> Smart Email</TabsTrigger>
          <TabsTrigger value="acquisition" onClick={fetchInsights}><Target className="w-4 h-4 mr-2" /> Acquisition</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 mt-0 data-[state=inactive]:hidden">
          <Card className="flex-1 flex flex-col overflow-hidden border-primary/20 shadow-lg relative glass-panel">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-50 pointer-events-none z-0"></div>
            <CardHeader className="border-b border-border bg-card/50 backdrop-blur-sm z-10 px-6 py-4 flex flex-row items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <BrainCircuit className="w-5 h-5 text-primary" />
                   </div>
                   <div>
                      <CardTitle className="text-lg">Memoria Agent</CardTitle>
                      <CardDescription>RAG-powered intelligence pipeline</CardDescription>
                   </div>
                 </div>
                 <div className="flex items-center gap-2 bg-background p-1.5 rounded-lg border border-border shadow-sm">
                    <div className="flex items-center gap-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-primary" /> Memory Context:
                    </div>
                    <Select value={selectedClient} onValueChange={setSelectedClient}>
                        <SelectTrigger className="w-[150px] h-8 bg-muted/50 border-none text-xs">
                            <SelectValue placeholder="All Clients" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Global (All)</SelectItem>
                            {clients.map(c => (
                                <SelectItem key={c.id} value={c.id.toString()}>{c.company_name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            
            <CardContent className="flex-1 p-0 flex flex-col z-10 bg-gradient-to-b from-transparent to-background/50">
              <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                 <div className="space-y-6 pb-4">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted border border-border text-foreground'}`}>
                                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-primary" />}
                                </div>
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                                    msg.role === 'user' 
                                        ? 'bg-primary text-primary-foreground rounded-tr-sm shadow-md shadow-primary/20' 
                                        : 'bg-card border border-border text-foreground rounded-tl-sm shadow-sm'
                                }`}>
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-muted border border-border text-foreground flex items-center justify-center shrink-0">
                                    <Bot className="w-4 h-4 text-primary" />
                                </div>
                                <div className="p-4 rounded-2xl bg-card border border-border text-muted-foreground rounded-tl-sm flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Thinking across vectors...
                                </div>
                            </div>
                        </div>
                    )}
                 </div>
              </ScrollArea>
               
              <div className="p-4 border-t border-border bg-card">
                  <form 
                    className="flex items-center gap-2 relative"
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  >
                      <Input 
                          placeholder={selectedClient === 'all' ? "Ask about any client..." : `Ask about ${clients.find(c => c.id.toString() === selectedClient)?.company_name}...`}
                          className="flex-1 rounded-full px-6 h-12 border-primary/20 focus-visible:ring-primary/30"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          disabled={loading}
                      />
                      <Button 
                          type="submit" 
                          size="icon" 
                          className="h-12 w-12 rounded-full absolute right-0 shrink-0"
                          disabled={loading || !input.trim()}
                      >
                          <Send className="w-5 h-5" />
                      </Button>
                  </form>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="flex-1 mt-0 data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            <Card className="glass-panel flex flex-col">
              <CardHeader>
                <CardTitle>Email Context</CardTitle>
                <CardDescription>What do you want to say?</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                <div className="space-y-2 flex-1 flex flex-col">
                  <Label>Context / Key Points</Label>
                  <Textarea 
                    className="flex-1 resize-none" 
                    placeholder="e.g. Apologize for the downtime yesterday, assure them we fixed the root cause, and offer a 10% discount on the next renewal."
                    value={emailContext}
                    onChange={e => setEmailContext(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select value={emailTone} onValueChange={setEmailTone}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="apologetic">Apologetic</SelectItem>
                      <SelectItem value="persuasive">Persuasive / Sales</SelectItem>
                      <SelectItem value="friendly">Friendly / Casual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={generateEmail} disabled={emailLoading || !emailContext}>
                  {emailLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Generate Draft
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-panel flex flex-col">
              <CardHeader>
                <CardTitle>Generated Draft</CardTitle>
                <CardDescription>Review and copy your AI-generated email.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <Textarea 
                  className="w-full h-full min-h-[300px] resize-none bg-muted/30" 
                  readOnly 
                  value={generatedEmail}
                  placeholder="Your generated email will appear here..."
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="acquisition" className="flex-1 mt-0 data-[state=inactive]:hidden">
          <Card className="glass-panel h-full">
            <CardHeader>
              <CardTitle>Acquisition Intelligence</CardTitle>
              <CardDescription>AI-suggested target industries and pitch strategies based on current market trends.</CardDescription>
            </CardHeader>
            <CardContent>
              {insightsLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {insights.map((insight, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-border/50 bg-card hover:bg-muted/30 transition-colors">
                      <div className="font-semibold text-lg flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-primary" /> {insight.industry}
                      </div>
                      <div className="space-y-2 mt-4">
                        <div>
                          <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Trend</span>
                          <p className="text-sm mt-1">{insight.trend}</p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Strategy</span>
                          <p className="text-sm mt-1 text-primary">{insight.suggestion}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {insights.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                      No insights available right now.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
