'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, ShieldCheck, Key, Activity, Sparkles } from 'lucide-react';
import { SecuritySettings } from './SecuritySettings';
import { ApiKeysSettings } from './ApiKeysSettings';
import { ServiceStatusSettings } from './ServiceStatusSettings';

export const SettingsPanel = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
      
      {/* Header with Glass Effect Icon */}
      <div className="flex items-center gap-5">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue/10 border border-brand-blue/20">
          <Settings className="h-7 w-7 text-brand-blue" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground font-medium">
            Manage your digital fortress and integration ecosystem.
          </p>
        </div>
      </div>

      <Tabs defaultValue="security" className="w-full space-y-8">
        {/* Sleek Floating Tab Bar */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md py-2 -mx-2 px-2">
          <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-muted/40 p-1.5 border border-border/40">
            <TabsTrigger 
              value="security" 
              className="px-6 rounded-lg data-[state=active]:bg-background data-[state=active]:text-brand-green data-[state=active]:shadow-sm transition-all flex items-center gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              <span className="text-sm font-semibold">Security</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="api-keys" 
              className="px-6 rounded-lg data-[state=active]:bg-background data-[state=active]:text-brand-blue data-[state=active]:shadow-sm transition-all flex items-center gap-2"
            >
              <Key className="h-4 w-4" />
              <span className="text-sm font-semibold">API Keys</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="services" 
              className="px-6 rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all flex items-center gap-2"
            >
              <Activity className="h-4 w-4" />
              <span className="text-sm font-semibold">Service Status</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Content with Layered Animation */}
        <div className="relative min-h-125">
          <TabsContent 
            value="security" 
            className="mt-0 ring-offset-background animate-in fade-in zoom-in-95 duration-300 outline-none"
          >
            <div className="rounded-2xl border border-border/60 bg-card/30 p-6 backdrop-blur-sm">
              <SecuritySettings />
            </div>
          </TabsContent>
          
          <TabsContent 
            value="api-keys" 
            className="mt-0 ring-offset-background animate-in fade-in zoom-in-95 duration-300 outline-none"
          >
            <div className="rounded-2xl border border-border/60 bg-card/30 p-6 backdrop-blur-sm">
              <ApiKeysSettings />
            </div>
          </TabsContent>
          
          <TabsContent 
            value="services" 
            className="mt-0 ring-offset-background animate-in fade-in zoom-in-95 duration-300 outline-none"
          >
            <div className="rounded-2xl border border-border/60 bg-card/30 p-6 backdrop-blur-sm">
              <ServiceStatusSettings />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};