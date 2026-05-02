"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BrainCircuit, Activity, BarChart, Users, ChevronRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-x-hidden">
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">Memoria AI</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-40 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
          
          <div className="container mx-auto px-4 lg:px-8 text-center max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
                Never Forget a <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Customer Interaction</span> Again.
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                AI-powered customer memory and churn intelligence platform. Instantly recall past conversations, detect silent dissatisfaction, and prevent churn before it happens.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/25 rounded-full">
                    Start for Free <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="h-12 px-8 text-base rounded-full backdrop-blur-md bg-background/50">
                    View Demo Dashboard
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Everything your sales team needs</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Stop relying on scattered notes. Our vector database creates a semantic memory of every PDF, email, and chat log.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: BrainCircuit, title: 'Semantic Memory Retrieval', desc: 'Ask "what complaints are repeated by Client X?" and get exact answers instantly.' },
                { icon: Activity, title: 'Predictive Churn Engine', desc: 'Our ML models flag negative sentiment trajectories months before a client leaves.' },
                { icon: BarChart, title: 'Automated Briefings', desc: 'Get a 30-second AI summary of a 3-year relationship right before your meeting.' },
                { icon: Users, title: 'Omnichannel Ingestion', desc: 'Drop in CSVs, PDFs, Support Tickets or plain text. The AI maps the context.' },
                { icon: ShieldCheck, title: 'Enterprise Security', desc: 'Role-based access, JWT authentication, and secure localized LLM fallbacks.' }
              ].map((feature, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-border bg-card">
        <div className="container mx-auto px-4 lg:px-8 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BrainCircuit className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold text-foreground tracking-tight">Memoria AI</span>
          </div>
          <p className="mb-4">© 2026 Memoria AI CRM. All rights reserved.</p>
          <p className="text-sm">Built for the future of customer relationships.</p>
        </div>
      </footer>
    </div>
  );
}
