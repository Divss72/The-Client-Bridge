"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Users, Target, Kanban, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import axios from "axios";

interface SearchResults {
  clients: { id: number; name: string; type: string }[];
  leads: { id: number; name: string; type: string }[];
  deals: { id: number; name: string; type: string }[];
  tasks: { id: number; name: string; type: string }[];
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({ clients: [], leads: [], deals: [], tasks: [] });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length === 0) {
        setResults({ clients: [], leads: [], deals: [], tasks: [] });
        return;
      }
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:8000/api/search/global?q=${query}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setResults(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  const hasResults = results.clients.length > 0 || results.leads.length > 0 || results.deals.length > 0 || results.tasks.length > 0;

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64 transition-all hover:bg-muted"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search Memoria...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Type a command or search..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            ) : "No results found."}
          </CommandEmpty>
          
          {hasResults && (
            <>
              {results.clients.length > 0 && (
                <CommandGroup heading="Clients">
                  {results.clients.map(c => (
                    <CommandItem key={`client-${c.id}`} onSelect={() => runCommand(() => router.push(`/clients/${c.id}`))}>
                      <Users className="w-4 h-4 mr-2" /> {c.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {results.leads.length > 0 && (
                <CommandGroup heading="Leads">
                  {results.leads.map(l => (
                    <CommandItem key={`lead-${l.id}`} onSelect={() => runCommand(() => router.push(`/leads`))}>
                      <Target className="w-4 h-4 mr-2" /> {l.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {results.deals.length > 0 && (
                <CommandGroup heading="Deals">
                  {results.deals.map(d => (
                    <CommandItem key={`deal-${d.id}`} onSelect={() => runCommand(() => router.push(`/pipeline`))}>
                      <Kanban className="w-4 h-4 mr-2" /> {d.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {results.tasks.length > 0 && (
                <CommandGroup heading="Tasks">
                  {results.tasks.map(t => (
                    <CommandItem key={`task-${t.id}`} onSelect={() => runCommand(() => router.push(`/tasks`))}>
                      <Bell className="w-4 h-4 mr-2" /> {t.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          )}

          {!query && (
            <>
              <CommandGroup heading="Suggestions">
                <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
                  Dashboard
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push("/clients"))}>
                  Clients
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push("/leads"))}>
                  Leads
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push("/pipeline"))}>
                  Pipeline
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
