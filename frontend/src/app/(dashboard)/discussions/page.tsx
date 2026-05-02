"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import Cookies from "js-cookie";
import axios from "axios";
import { 
  Presentation, MessageSquare, Send, Users, Loader2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface Client {
  id: number;
  company_name: string;
}

interface Message {
  id: number;
  content: string;
  created_at: string;
  user: { id: number; name: string };
}

interface Discussion {
  id: number;
  title: string;
  client_id: number;
  created_at: string;
  messages: Message[];
}

export default function DiscussionsPage() {
  const { user } = useAuthStore();
  const token = Cookies.get("access_token");
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [selectedDisc, setSelectedDisc] = useState<Discussion | null>(null);
  
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/clients/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClients(res.data);
        if (res.data.length > 0) {
          setSelectedClient(res.data[0]);
        }
      } catch (error) {
        toast.error("Failed to load clients");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchClients();
  }, [token]);

  useEffect(() => {
    const fetchDiscussions = async () => {
      if (!selectedClient) return;
      try {
        const res = await axios.get(`http://localhost:8000/api/discussions/client/${selectedClient.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDiscussions(res.data);
        if (res.data.length > 0) {
          setSelectedDisc(res.data[0]);
        } else {
          setSelectedDisc(null);
        }
      } catch (error) {
        console.error(error);
      }
    };
    if (token && selectedClient) fetchDiscussions();
  }, [selectedClient, token]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedDisc) return;

    try {
      const res = await axios.post(`http://localhost:8000/api/discussions/${selectedDisc.id}/messages`, {
        content: message
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      const newMsg = { ...res.data, user: { id: user?.id, name: user?.name } };
      setSelectedDisc({
        ...selectedDisc,
        messages: [...selectedDisc.messages, newMsg]
      });
      setMessage("");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Presentation className="w-8 h-8 text-primary" />
          Discussions
        </h1>
        <p className="text-muted-foreground mt-1">Collaborate with your team regarding specific clients.</p>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Clients Sidebar */}
        <div className="w-64 shrink-0 glass-panel border border-border/50 rounded-xl flex flex-col overflow-hidden hidden md:flex">
          <div className="p-3 border-b border-border/50 bg-muted/30">
            <h2 className="font-semibold text-sm flex items-center gap-2"><Users className="w-4 h-4" /> Clients</h2>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {clients.map(client => (
                <button
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedClient?.id === client.id ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                >
                  {client.company_name}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Discussions Area */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="glass-panel rounded-xl border border-border/50 flex-1 flex flex-col overflow-hidden">
            {selectedDisc ? (
              <>
                <div className="p-4 border-b border-border/50 bg-muted/20">
                  <h2 className="font-semibold text-lg">{selectedDisc.title}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="w-3 h-3" /> {selectedClient?.company_name}
                  </p>
                </div>
                
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-6">
                    {selectedDisc.messages.map((msg, idx) => {
                      const isMe = msg.user?.id === user?.id;
                      return (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={msg.id || idx} 
                          className={`flex gap-3 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
                        >
                          <Avatar className="w-8 h-8 border border-border shrink-0">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {msg.user?.name ? msg.user.name.charAt(0) : '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="text-xs font-medium text-muted-foreground">{msg.user?.name || 'Unknown'}</span>
                              <span className="text-[10px] text-muted-foreground/60">
                                {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <div className={`p-3 rounded-2xl text-sm ${isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm'}`}>
                              {msg.content}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </ScrollArea>
                
                <div className="p-4 bg-background border-t border-border/50">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input 
                      placeholder="Type your message... use @ to mention" 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="bg-muted/50 border-transparent focus-visible:ring-1"
                    />
                    <Button type="submit" size="icon" disabled={!message.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                <h3 className="text-lg font-medium text-foreground mb-1">No Active Discussions</h3>
                <p className="text-sm">Select a client and start a discussion thread to collaborate.</p>
                <Button variant="outline" className="mt-4" onClick={() => {
                  // In a real app, open a modal to create a new discussion thread
                  toast.info("Feature to create new thread coming soon.");
                }}>
                  New Discussion
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
