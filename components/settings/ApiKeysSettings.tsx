'use client';

import { useState } from 'react';
import { 
  Copy, Key, Eye, EyeOff, Trash2, RefreshCw, 
  Building, Smartphone, DollarSign, Plus, 
  ShieldCheck, Zap, MoreHorizontal 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

export const ApiKeysSettings = () => {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [apiKeys] = useState([
    {
      id: '1',
      name: 'Standard Bank Integration',
      service: 'bank',
      key: 'sk_live_abc123xyz789',
      status: 'active',
      created: 'Jan 01, 2024',
      lastUsed: '2 hours ago',
      permissions: ['read:accounts', 'write:transfers']
    },
    {
      id: '2',
      name: 'Forex Rate Provider',
      service: 'forex',
      key: 'fx_sec_def456ghi789',
      status: 'active',
      created: 'Jan 05, 2024',
      lastUsed: '15 mins ago',
      permissions: ['read:rates']
    }
  ]);

  const toggleKeyVisibility = (id: string) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'bank': return <Building className="h-4 w-4" />;
      case 'forex': return <DollarSign className="h-4 w-4" />;
      case 'sms': return <Smartphone className="h-4 w-4" />;
      default: return <Key className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
      
      {/* Header & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">API Infrastructure</h2>
          <p className="text-sm text-muted-foreground">Manage secret tokens and service-to-service permissions.</p>
        </div>
        <Button className="bg-brand-green hover:bg-brand-green/90 rounded-xl px-6 h-11 font-bold shadow-lg shadow-brand-green/10">
          <Plus className="mr-2 h-4 w-4" />
          Create New Key
        </Button>
      </div>

      {/* API Key List - Card Style for better mobile/sleek feel */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Active Identifiers</span>
          <span className="text-[10px] font-medium text-muted-foreground">{apiKeys.length} Keys Total</span>
        </div>

        <div className="grid gap-4">
          {apiKeys.map((key) => (
            <div 
              key={key.id} 
              className="group relative bg-card border border-border/50 rounded-2xl p-5 hover:border-brand-green/30 hover:shadow-md transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                
                {/* Left: Metadata */}
                <div className="flex gap-4">
                  <div className="mt-1 h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center text-brand-blue group-hover:bg-brand-green/10 group-hover:text-brand-green transition-colors">
                    {getServiceIcon(key.service)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm tracking-tight">{key.name}</h4>
                      <Badge className="bg-brand-green/10 text-brand-green border-none text-[10px] uppercase font-bold px-2 py-0">
                        {key.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {key.lastUsed}</span>
                      <Separator orientation="vertical" className="h-3" />
                      <span>Added {key.created}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Key Display & Actions */}
                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center gap-2 bg-muted/30 p-1 pl-3 rounded-lg border border-border/20">
                    <code className="text-xs font-mono font-medium text-foreground/80 tracking-tight">
                      {showKeys[key.id] ? key.key : '•••• •••• •••• ' + key.key.slice(-4)}
                    </code>
                    <div className="flex gap-1 border-l border-border/40 ml-2 pl-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 hover:bg-background"
                        onClick={() => toggleKeyVisibility(key.id)}
                      >
                        {showKeys[key.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background">
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {key.permissions.map(p => (
                      <span key={p} className="text-[10px] font-mono bg-muted/50 px-2 py-0.5 rounded text-muted-foreground">
                        {p}
                      </span>
                    ))}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl border-border/50">
                        <DropdownMenuItem className="text-xs gap-2">
                          <RefreshCw className="h-3.5 w-3.5" /> Rotate Key
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs text-destructive gap-2">
                          <Trash2 className="h-3.5 w-3.5" /> Revoke Key
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simplified New Key Logic */}
      <div className="rounded-2xl border-2 border-dashed border-border/60 p-6 flex items-center gap-6 hover:border-brand-blue/40 hover:bg-brand-blue/5 transition-all cursor-pointer group">
        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-brand-blue/10 group-hover:text-brand-blue transition-all shrink-0">
          <Key className="h-6 w-6" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-bold text-sm">Need a specific integration?</p>
          <p className="text-xs text-muted-foreground">
            Generate a scoped key for SMS, Banking, or Forex services instantly.
          </p>
        </div>
        <Button variant="ghost" className="hidden sm:flex group-hover:translate-x-1 transition-transform">
          Get Started <Plus className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Modern Security Tip */}
      <div className="relative overflow-hidden rounded-2xl bg-brand-blue p-6 text-white shadow-xl shadow-brand-blue/20">
        <div className="relative z-10 flex items-center gap-6">
          <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/10">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-center w-full">
            <h4 className="font-bold text-sm tracking-wide leading-tight">
              Key Security <br className="hidden md:block" /> Protocol
            </h4>
            <p className="text-xs text-white/80 leading-relaxed border-l border-white/10 pl-4">
              Identifiers should be rotated every 90 days. We recommend using <strong>Environment Variables</strong> for server-side implementations. Never expose your secret keys in client-side codebases.
            </p>
          </div>
        </div>
        
        {/* Decorative circle */}
        <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      </div>

    </div>
  );
};
