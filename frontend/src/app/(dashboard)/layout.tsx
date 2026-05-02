"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { BrainCircuit, LayoutDashboard, Users, MessageSquareText, UploadCloud, Settings, LogOut, Loader2, Menu, Bell, ChevronLeft, ChevronRight, Target, Kanban, BarChart3, Presentation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';
import { GlobalSearch } from '@/components/global-search';
import { NotificationPopover } from '@/components/notification-popover';
import { motion, AnimatePresence } from 'framer-motion';

const sidebarLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Leads', href: '/leads', icon: Target },
  { name: 'Pipeline', href: '/pipeline', icon: Kanban },
  { name: 'Discussions', href: '/discussions', icon: Presentation },
  { name: 'Tasks', href: '/tasks', icon: Bell },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'AI Assistant', href: '/ai-assistant', icon: MessageSquareText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, fetchUser, isLoading, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const sidebarWidth = isSidebarCollapsed ? 80 : 256;

  return (
    <div className="min-h-screen flex bg-background text-foreground overflow-hidden">
      {/* Sidebar Desktop */}
      <motion.aside 
        initial={{ width: 256 }}
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden md:flex flex-col bg-card border-r border-border relative z-20"
      >
        <div className="h-16 flex items-center px-4 border-b border-border justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <BrainCircuit className="w-6 h-6 text-primary flex-shrink-0" />
            <AnimatePresence>
              {!isSidebarCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, width: 0 }} 
                  animate={{ opacity: 1, width: "auto" }} 
                  exit={{ opacity: 0, width: 0 }}
                  className="font-bold tracking-tight text-lg"
                >
                  Memoria AI
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto overflow-x-hidden">
          {sidebarLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link key={link.name} href={link.href}>
                <div className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}>
                  {isActive && (
                    <motion.div 
                      layoutId="active-nav-indicator"
                      className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <link.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                  <AnimatePresence>
                    {!isSidebarCollapsed && (
                      <motion.span 
                        initial={{ opacity: 0, width: 0 }} 
                        animate={{ opacity: 1, width: "auto" }} 
                        exit={{ opacity: 0, width: 0 }}
                        className="whitespace-nowrap"
                      >
                        {link.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border mt-auto">
           <div className="flex items-center justify-between mb-4 px-1">
               <div className="flex items-center gap-3 overflow-hidden">
                   <Avatar className="h-9 w-9 flex-shrink-0 ring-1 ring-border">
                       <AvatarFallback className="bg-primary/10 text-primary font-semibold">{user.name.charAt(0)}</AvatarFallback>
                   </Avatar>
                   <AnimatePresence>
                     {!isSidebarCollapsed && (
                       <motion.div 
                         initial={{ opacity: 0, width: 0 }} 
                         animate={{ opacity: 1, width: "auto" }} 
                         exit={{ opacity: 0, width: 0 }}
                         className="flex flex-col whitespace-nowrap"
                       >
                           <span className="text-sm font-semibold truncate max-w-[120px]">{user.name}</span>
                           <span className="text-xs text-muted-foreground">{user.role}</span>
                       </motion.div>
                     )}
                   </AnimatePresence>
               </div>
           </div>
           
           <div className="flex flex-col gap-1">
              <Link href="/settings">
                <Button variant="ghost" className={`w-full ${isSidebarCollapsed ? 'justify-center' : 'justify-start'} text-muted-foreground hover:text-foreground`}>
                  <Settings className="w-4 h-4 flex-shrink-0" /> 
                  {!isSidebarCollapsed && <span className="ml-2">Settings</span>}
                </Button>
              </Link>
              <Button variant="ghost" className={`w-full ${isSidebarCollapsed ? 'justify-center' : 'justify-start'} text-muted-foreground hover:text-destructive hover:bg-destructive/10`} onClick={logout}>
                  <LogOut className="w-4 h-4 flex-shrink-0" /> 
                  {!isSidebarCollapsed && <span className="ml-2">Log out</span>}
              </Button>
           </div>
        </div>

        {/* Collapse toggle */}
        <Button 
          variant="secondary" 
          size="icon" 
          className="absolute -right-4 top-20 h-8 w-8 rounded-full border border-border shadow-sm z-50 hidden md:flex"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        >
          {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen">
          {/* Top Navbar */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 transition-all">
              <div className="flex items-center gap-4 flex-1">
                 <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                     <Menu className="w-5 h-5" />
                 </Button>
                 
                 <div className="hidden md:flex flex-1 max-w-md">
                   <GlobalSearch />
                 </div>
              </div>

              <div className="flex items-center gap-3">
                 <div className="relative">
                   <NotificationPopover />
                 </div>
                 <ThemeToggle />
              </div>
          </header>
          
          {/* Mobile Menu Dropdown */}
          <AnimatePresence>
            {mobileMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="md:hidden absolute top-16 left-0 right-0 bg-card border-b border-border z-20 p-4 shadow-lg space-y-2"
                >
                    <div className="mb-4">
                      <GlobalSearch />
                    </div>
                    {sidebarLinks.map((link) => (
                      <Link key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)}>
                          <span className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium hover:bg-muted">
                          <link.icon className="w-5 h-5 text-muted-foreground" />
                          {link.name}
                          </span>
                      </Link>
                    ))}
                    <div className="pt-4 mt-2 border-t border-border flex flex-col gap-2">
                       <Link href="/settings" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                            <Settings className="w-4 h-4 mr-2" /> Settings
                          </Button>
                       </Link>
                       <Button variant="ghost" className="w-full justify-start text-destructive" onClick={logout}>
                         <LogOut className="w-4 h-4 mr-2" /> Log out
                       </Button>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>

          {/* Page Content with Framer Motion Page Transition */}
          <div className="flex-1 overflow-auto bg-muted/20">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-4 md:p-8 max-w-7xl mx-auto w-full h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
      </main>
    </div>
  );
}
