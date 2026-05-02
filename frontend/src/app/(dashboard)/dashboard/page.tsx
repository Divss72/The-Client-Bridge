"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import Cookies from "js-cookie";
import { api } from "@/lib/api";
import { 
  Users, Activity, TrendingUp, AlertCircle, Kanban, 
  Target, Bell, BrainCircuit
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DashboardData {
  stats: {
    totalClients: number;
    activeDeals: number;
    totalRevenue: number;
    tasksDueToday: number;
    churnRiskCount: number;
  };
  recentLeads: any[];
  aiInsights: string[];
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, pipelineRes, leadsRes, tasksRes] = await Promise.all([
          api.get("/clients/"),
          api.get("/pipeline/"),
          api.get("/leads/"),
          api.get("/tasks/")
        ]);

        const clients = clientsRes.data;
        const deals = pipelineRes.data;
        const leads = leadsRes.data;
        const tasks = tasksRes.data;

        const totalRevenue = deals.filter((d: any) => d.stage === "Won").reduce((acc: number, d: any) => acc + d.amount, 0) + 
                             clients.reduce((acc: number, c: any) => acc + (c.total_revenue || 0), 0);

        const activeDeals = deals.filter((d: any) => d.stage !== "Won" && d.stage !== "Lost").length;
        
        const today = new Date().toISOString().split('T')[0];
        const tasksDueToday = tasks.filter((t: any) => t.due_date && t.due_date.startsWith(today) && t.status !== "Completed").length;

        const churnRiskCount = clients.filter((c: any) => c.health_status === "Critical" || c.churn_probability > 70).length;

        // Mocking AI Insights for dashboard based on data
        const insights = [
          `You have ${activeDeals} active deals in the pipeline. Focus on the ones in the "Closing" stage.`,
          churnRiskCount > 0 ? `Alert: ${churnRiskCount} clients are showing high churn risk. Review their profiles immediately.` : `Client health is generally good. Keep up the engagement!`,
          `${tasksDueToday} tasks require your attention today.`,
          `Your conversion rate from leads to clients is looking strong this quarter.`
        ];

        setData({
          stats: {
            totalClients: clients.length,
            activeDeals,
            totalRevenue,
            tasksDueToday,
            churnRiskCount
          },
          recentLeads: leads.slice(0, 5),
          aiInsights: insights
        });

      } catch (error) {
        console.error("Dashboard error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h2 className="text-xl font-semibold">Failed to load dashboard data</h2>
        <p className="text-muted-foreground">Please check your connection and try again.</p>
        <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className="space-y-6 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <motion.h1 variants={itemVariants} className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name.split(" ")[0]}
          </motion.h1>
          <motion.p variants={itemVariants} className="text-muted-foreground mt-1">
            Here's what's happening with your business today.
          </motion.p>
        </div>
        <motion.div variants={itemVariants} className="flex gap-2">
          <Link href="/leads">
            <Button variant="outline" className="gap-2"><Target className="w-4 h-4" /> Add Lead</Button>
          </Link>
          <Link href="/pipeline">
            <Button className="gap-2"><Kanban className="w-4 h-4" /> View Pipeline</Button>
          </Link>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <Link href="/clients" className="block h-full cursor-pointer hover:opacity-90 transition-opacity">
            <Card className="glass-panel overflow-hidden relative h-full hover:border-primary/50 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp className="w-16 h-16" /></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">₹{data?.stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-green-500 mt-1 flex items-center gap-1">+12% from last month</p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Link href="/pipeline" className="block h-full cursor-pointer hover:opacity-90 transition-opacity">
            <Card className="glass-panel overflow-hidden relative h-full hover:border-primary/50 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Kanban className="w-16 h-16" /></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Deals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data?.stats.activeDeals}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">Pipeline needs attention</p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass-panel overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Bell className="w-16 h-16 text-primary" /></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tasks Due Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{data?.stats.tasksDueToday}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">Check your task list</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className={`glass-panel overflow-hidden relative ${data?.stats.churnRiskCount ? 'border-destructive/50' : ''}`}>
            <div className={`absolute top-0 right-0 p-4 opacity-10 ${data?.stats.churnRiskCount ? 'text-destructive' : ''}`}><AlertCircle className="w-16 h-16" /></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Churn Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${data?.stats.churnRiskCount ? 'text-destructive' : 'text-green-500'}`}>
                {data?.stats.churnRiskCount} <span className="text-sm font-normal text-muted-foreground">clients</span>
              </div>
              <p className={`text-xs mt-1 flex items-center gap-1 ${data?.stats.churnRiskCount ? 'text-destructive/80' : 'text-green-500/80'}`}>
                {data?.stats.churnRiskCount ? "High priority alert" : "Healthy retention"}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="glass-panel h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-primary" /> Recent Leads</CardTitle>
              <CardDescription>Latest potential clients added to the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.recentLeads.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No recent leads found.</div>
                ) : (
                  data?.recentLeads.map((lead: any) => (
                    <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {lead.company_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{lead.company_name}</p>
                          <p className="text-xs text-muted-foreground">{lead.industry || 'Unknown Industry'}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className={
                        lead.status === 'New' ? 'bg-blue-500/10 text-blue-500' :
                        lead.status === 'Contacted' ? 'bg-yellow-500/10 text-yellow-500' : ''
                      }>{lead.status}</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass-panel h-full bg-gradient-to-br from-card to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BrainCircuit className="w-5 h-5 text-primary" /> AI Insights</CardTitle>
              <CardDescription>Intelligent recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.aiInsights.map((insight: string, idx: number) => (
                  <div key={idx} className="flex gap-3 text-sm p-3 rounded-lg bg-background/50 border border-border/50 shadow-sm">
                    <BrainCircuit className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">{insight}</p>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-6" variant="outline" asChild>
                <Link href="/ai-assistant">Open AI Assistant</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
