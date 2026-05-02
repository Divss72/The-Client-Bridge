"use client";

import { BarChart3, TrendingUp, Users, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-primary" />
          Analytics & Reporting
        </h1>
        <p className="text-muted-foreground mt-1">Deep dive into your business metrics.</p>
      </div>

      <div className="py-20 text-center border-2 border-dashed border-border rounded-xl bg-muted/10 glass-panel">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Advanced Analytics Coming Soon</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          We are currently building comprehensive charts for revenue forecasting, lead conversion rates, and team performance tracking.
        </p>
        <Button variant="outline">Notify Me When Ready</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-50 pointer-events-none">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Target className="w-4 h-4"/> Lead Conversion Rate</CardTitle>
            <CardDescription>Monthly conversion trends</CardDescription>
          </CardHeader>
          <CardContent className="h-64 bg-muted/20 flex items-center justify-center border-t border-border/50">
            [Chart Placeholder]
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="w-4 h-4"/> Churn Prevention</CardTitle>
            <CardDescription>Saved accounts vs Lost accounts</CardDescription>
          </CardHeader>
          <CardContent className="h-64 bg-muted/20 flex items-center justify-center border-t border-border/50">
             [Chart Placeholder]
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
