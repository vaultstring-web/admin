'use client';

import { useState, useEffect } from 'react';
import { 
  Copy, Key, Eye, EyeOff, Trash2, RefreshCw, 
  Building, Smartphone, DollarSign, Plus, 
  ShieldCheck, Zap, MoreHorizontal, Loader2, Check 
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { getAPIKeys, createAPIKey, revokeAPIKey, APIKey } from '@/lib/api-keys';
import { toast } from '@/hooks/use-toast';

export const ApiKeysSettings = () => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Key State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null); // To show the key one time

  const availableScopes = [
    { id: 'read:users', label: 'Read Users' },
    { id: 'write:users', label: 'Write Users' },
    { id: 'read:transactions', label: 'Read Transactions' },
    { id: 'write:payments', label: 'Initiate Payments' },
    { id: 'read:audit', label: 'Read Audit Logs' },
  ];

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    setLoading(true);
    const response = await getAPIKeys();
    if (response.data) {
      // Backend returns APIKey[] directly
      setApiKeys(response.data || []);
    } else {
      toast({
        title: "Error",
        description: response.error || "Failed to fetch API keys",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleCreateKey = async () => {
    if (!newKeyName || selectedScopes.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please provide a name and select at least one scope.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    const response = await createAPIKey(newKeyName, selectedScopes, 365); // Default 1 year expiry
    setIsCreating(false);

    if (response.data) {
      // Backend returns { api_key: ..., secret: ... }
      setCreatedKey(response.data.secret || null);
      // Refresh list
      fetchKeys();
      toast({
        title: "Success",
        description: "API Key created successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: response.error || "Failed to create API key",
        variant: "destructive",
      });
    }
  };

  const handleRevokeKey = async (id: string) => {
    const response = await revokeAPIKey(id);
    if (!response.error) {
      setApiKeys(prev => prev.filter(k => k.id !== id));
      toast({
        title: "Revoked",
        description: "API Key has been revoked.",
      });
    } else {
      toast({
        title: "Error",
        description: response.error || "Failed to revoke key",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "API Key copied to clipboard",
    });
  };

  const toggleScope = (scopeId: string) => {
    setSelectedScopes(prev => 
      prev.includes(scopeId) 
        ? prev.filter(id => id !== scopeId) 
        : [...prev, scopeId]
    );
  };

  const resetForm = () => {
    setNewKeyName('');
    setSelectedScopes([]);
    setCreatedKey(null);
    setIsCreateOpen(false);
  };

  const getServiceIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('bank')) return <Building className="h-4 w-4" />;
    if (lower.includes('forex')) return <DollarSign className="h-4 w-4" />;
    if (lower.includes('sms') || lower.includes('mobile')) return <Smartphone className="h-4 w-4" />;
    return <Key className="h-4 w-4" />;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  if (loading && apiKeys.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
      
      {/* Header & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">API Infrastructure</h2>
          <p className="text-sm text-muted-foreground">Manage secret tokens and service-to-service permissions.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          if (!open) resetForm();
          setIsCreateOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-brand-green hover:bg-brand-green/90 rounded-xl px-6 h-11 font-bold shadow-lg shadow-brand-green/10">
              <Plus className="mr-2 h-4 w-4" />
              Create New Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            {!createdKey ? (
              <>
                <DialogHeader>
                  <DialogTitle>Create API Key</DialogTitle>
                  <DialogDescription>
                    Generate a new key for server-side integration.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Key Name</Label>
                    <Input 
                      id="name" 
                      placeholder="e.g. Payment Service Worker" 
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Scopes</Label>
                    <div className="grid grid-cols-2 gap-2 border rounded-lg p-3">
                      {availableScopes.map((scope) => (
                        <div key={scope.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={scope.id} 
                            checked={selectedScopes.includes(scope.id)}
                            onCheckedChange={() => toggleScope(scope.id)}
                          />
                          <Label htmlFor={scope.id} className="text-xs cursor-pointer font-normal">{scope.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateKey} disabled={isCreating} className="bg-brand-green hover:bg-brand-green/90">
                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Key
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle className="text-brand-green flex items-center gap-2">
                    <Check className="h-5 w-5" /> Key Created
                  </DialogTitle>
                  <DialogDescription>
                    Please copy your key now. You won't be able to see it again!
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="p-4 bg-muted/50 rounded-lg border border-border/50 break-all font-mono text-sm relative">
                    {createdKey}
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => copyToClipboard(createdKey)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={resetForm}>Done</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* API Key List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Active Identifiers</span>
          <span className="text-[10px] font-medium text-muted-foreground">{apiKeys.length} Keys Total</span>
        </div>

        {apiKeys.length === 0 ? (
          <div className="text-center p-10 border-2 border-dashed border-border/50 rounded-2xl text-muted-foreground">
            No API keys found. Create one to get started.
          </div>
        ) : (
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
                      {getServiceIcon(key.name)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm tracking-tight">{key.name}</h4>
                        <Badge className={`border-none text-[10px] uppercase font-bold px-2 py-0 ${
                          key.is_active 
                            ? "bg-brand-green/10 text-brand-green" 
                            : "bg-destructive/10 text-destructive"
                        }`}>
                          {key.is_active ? 'Active' : 'Revoked'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" /> 
                          {key.last_used_at ? formatDate(key.last_used_at) : 'Never used'}
                        </span>
                        <Separator orientation="vertical" className="h-3" />
                        <span>Added {formatDate(key.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Key Display & Actions */}
                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-2 bg-muted/30 p-1 pl-3 rounded-lg border border-border/20">
                      <code className="text-xs font-mono font-medium text-foreground/80 tracking-tight">
                        {key.key_prefix}•••• ••••
                      </code>
                      <div className="flex gap-1 border-l border-border/40 ml-2 pl-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-background">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem className="text-xs text-destructive gap-2" onClick={() => handleRevokeKey(key.id)}>
                              <Trash2 className="h-3.5 w-3.5" /> Revoke Key
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Simplified New Key Logic (Bottom card) */}
      <div 
        className="rounded-2xl border-2 border-dashed border-border/60 p-6 flex items-center gap-6 hover:border-brand-blue/40 hover:bg-brand-blue/5 transition-all cursor-pointer group"
        onClick={() => setIsCreateOpen(true)}
      >
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

    </div>
  );
};
