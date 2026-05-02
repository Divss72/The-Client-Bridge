"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import Cookies from "js-cookie";
import axios from "axios";
import { 
  Bell, CheckCircle2, Circle, Clock, MoreHorizontal, Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string;
  status: string;
  priority: string;
  is_ai_suggested: boolean;
}

export default function TasksPage() {
  const token = Cookies.get("access_token");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/tasks/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data);
    } catch (error) {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchTasks();
  }, [token]);

  const updateStatus = async (taskId: number, status: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    try {
      await axios.put(`http://localhost:8000/api/tasks/${taskId}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Task updated");
    } catch (error) {
      toast.error("Update failed");
      fetchTasks();
    }
  };

  const getPriorityColor = (p: string) => {
    if (p === 'High') return 'text-destructive bg-destructive/10';
    if (p === 'Medium') return 'text-yellow-500 bg-yellow-500/10';
    return 'text-blue-500 bg-blue-500/10';
  };

  const pendingTasks = tasks.filter(t => t.status !== 'Completed');
  const completedTasks = tasks.filter(t => t.status === 'Completed');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="w-8 h-8 text-primary" />
            My Tasks
          </h1>
          <p className="text-muted-foreground mt-1">Manage your to-dos and AI-suggested actions.</p>
        </div>
        <Button className="gap-2"><Plus className="w-4 h-4" /> Add Task</Button>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            Pending Tasks <Badge variant="secondary">{pendingTasks.length}</Badge>
          </h3>
          <div className="glass-panel rounded-xl overflow-hidden border border-border/50 divide-y divide-border/50">
            <AnimatePresence>
              {pendingTasks.map((task) => (
                <motion.div 
                  key={task.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 flex items-start gap-4 hover:bg-muted/30 transition-colors group"
                >
                  <button onClick={() => updateStatus(task.id, 'Completed')} className="mt-0.5 shrink-0 text-muted-foreground hover:text-green-500 transition-colors">
                    <Circle className="w-5 h-5" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-medium text-foreground flex items-center gap-2">
                          {task.title}
                          {task.is_ai_suggested && <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-primary/30 text-primary bg-primary/5">AI Suggested</Badge>}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                      </div>
                      <Badge variant="secondary" className={`${getPriorityColor(task.priority)} shrink-0`}>
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      {task.due_date && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Due {format(new Date(task.due_date), "MMM d, yyyy")}
                        </span>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => updateStatus(task.id, 'In Progress')}>Mark In Progress</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete Task</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              ))}
            </AnimatePresence>
            {pendingTasks.length === 0 && !loading && (
              <div className="p-8 text-center text-muted-foreground">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p>All caught up!</p>
              </div>
            )}
            {loading && (
              <div className="p-8 text-center text-muted-foreground">
                <p>Loading tasks...</p>
              </div>
            )}
          </div>
        </div>

        {completedTasks.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-muted-foreground">
              Completed <Badge variant="outline">{completedTasks.length}</Badge>
            </h3>
            <div className="glass-panel rounded-xl overflow-hidden border border-border/50 divide-y divide-border/50 opacity-60">
              {completedTasks.map((task) => (
                <div key={task.id} className="p-4 flex items-start gap-4 bg-muted/10">
                  <button onClick={() => updateStatus(task.id, 'Pending')} className="mt-0.5 shrink-0 text-green-500">
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground line-through decoration-muted-foreground/50">{task.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
