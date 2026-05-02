"use client";

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchClients() {
      try {
        const res = await api.get('/clients/');
        setClients(res.data);
      } catch (e) {
        console.error("Failed to load clients");
      }
    }
    fetchClients();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const validTypes = ['application/pdf', 'text/csv', 'text/plain'];
      if (!validTypes.includes(selected.type) && !selected.name.endsWith('.csv')) {
          toast.error("Only PDF, CSV, and TXT files are supported.");
          return;
      }
      setFile(selected);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    if (!selectedClient) {
        toast.error("Please select a client to associate the memory with.");
        return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      await api.post(`/upload/?client_id=${selectedClient}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success("File ingested and vectorized successfully!");
      setFile(null);
      setSelectedClient('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (e) {
       toast.error("Failed to process file.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Data Ingestion Hub</h2>
        <p className="text-muted-foreground">Upload meeting notes, raw emails, or PDF reports. Our AI will embed it into the client's memory.</p>
      </div>

      <Card className="border-dashed border-2">
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
          <CardDescription>Support formats: .csv, .pdf, .txt</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="space-y-2">
              <label className="text-sm font-medium">1. Select Target Client</label>
              <div className="flex gap-2">
                 <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a company..." />
                    </SelectTrigger>
                    <SelectContent>
                        {clients.map(c => (
                            <SelectItem key={c.id} value={c.id.toString()}>{c.company_name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="shrink-0 flex items-center justify-center p-2 rounded-md bg-primary/10 text-primary">
                    <Building2 className="w-5 h-5" />
                </div>
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-sm font-medium">2. Select File</label>
              <div 
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${file ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                    accept=".pdf,.csv,.txt"
                  />
                  {file ? (
                      <div className="flex flex-col items-center gap-3">
                          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                          <div className="text-lg font-medium">{file.name}</div>
                          <div className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setFile(null); }}>Remove</Button>
                      </div>
                  ) : (
                      <div className="flex flex-col items-center gap-3 cursor-pointer">
                          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                              <UploadCloud className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <div className="text-lg font-medium">Click to browse or drag & drop</div>
                          <div className="text-sm text-muted-foreground">Vector ingestion process takes about 2 seconds per page.</div>
                      </div>
                  )}
              </div>
           </div>

           <Button 
                onClick={handleUpload} 
                className="w-full h-12 text-lg" 
                disabled={!file || uploading || !selectedClient}
            >
               {uploading ? (
                   <>Processing Embeddings <UploadCloud className="w-5 h-5 ml-2 animate-bounce" /></>
               ) : (
                   "Ingest to Vector Memory"
               )}
           </Button>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {[
              { icon: FileText, title: 'CSV Imports', desc: 'Map your exported support tickets to detect churn sentiment.' },
              { icon: AlertCircle, title: 'Meeting Notes', desc: 'Raw text transcripts are automatically chunked and classified.' },
              { icon: Building2, title: 'Contracts (PDF)', desc: 'Upload SLAs to allow AI to know specific renewal targets.' }
          ].map((item, idx) => (
             <div key={idx} className="flex flex-col items-center text-center p-6 bg-card rounded-xl border border-border shadow-sm">
                 <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                     <item.icon className="w-6 h-6 text-primary" />
                 </div>
                 <h4 className="font-semibold mb-2">{item.title}</h4>
                 <p className="text-sm text-muted-foreground">{item.desc}</p>
             </div>
          ))}
      </div>
    </div>
  );
}
