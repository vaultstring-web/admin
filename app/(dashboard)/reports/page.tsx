'use client';

import { AnalyticsDashboard } from '@/components/reports/AnalyticsDashboard';
import { Shield, LineChart, RefreshCw, FileDown, Clock, Database, CheckCircle2, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function ReportsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate a data fetch
    setTimeout(() => {
      setRefreshKey(prev => prev + 1);
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header & Global Actions */}
        <header className="flex items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-6">
            {/* Title & Badge Group */}
            <div className="flex flex-col">
               <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black tracking-tighter text-foreground uppercase">
                  Analytics
                </h1>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-[9px] font-black uppercase tracking-widest px-2 py-0 h-5">
                  Live Insights
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                Business Intelligence Dashboard <span className="mx-1 text-muted-foreground/30">•</span> v2.4.0
              </p>
            </div>

            <Separator orientation="vertical" className="h-10 hidden lg:block" />

            {/* Quick Summary (Visible on Desktop) */}
            <div className="hidden lg:flex items-center gap-8">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">Node Status</span>
                <span className="text-xs font-bold text-brand-green flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-green animate-pulse" />
                  Optimal
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">Active Sync</span>
                <span className="text-xs font-bold font-mono tracking-tight">14:30:12 UTC</span>
              </div>
            </div>
          </div>

          {/* Action Group */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="rounded-xl h-10 px-4 border-border/60 font-bold gap-2 hover:bg-muted/50 transition-all text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Syncing...' : 'Sync'}
            </Button>
            <Button className="rounded-xl h-10 px-5 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold gap-2 text-xs">
              <FileDown className="h-3.5 w-3.5" />
              Export
            </Button>
          </div>
        </header>

        {/* Stats Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              label: 'Data Sync Status', 
              value: 'Live', 
              sub: 'Last updated 2m ago', 
              icon: CheckCircle2, 
              color: 'text-brand-green',
              bg: 'bg-brand-green/10'
            },
            { 
              label: 'Indexed Points', 
              value: '1.24M', 
              sub: '+12k since yesterday', 
              icon: Database, 
              color: 'text-brand-blue',
              bg: 'bg-brand-blue/10'
            },
            { 
              label: 'Report Accuracy', 
              value: '99.98%', 
              sub: 'High confidence level', 
              icon: Shield, 
              color: 'text-primary',
              bg: 'bg-primary/10'
            },
            { 
              label: 'Refresh Interval', 
              value: '15 min', 
              sub: 'Next sync at 14:45', 
              icon: Clock, 
              color: 'text-purple-500',
              bg: 'bg-purple-500/10'
            }
          ].map((stat, i) => (
            <div key={i} className="group relative overflow-hidden bg-card border border-border/50 p-5 rounded-2xl hover:border-primary/30 transition-all duration-300">
              <div className="flex items-start justify-between relative z-10">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{stat.label}</p>
                  <p className="text-2xl font-black tracking-tight text-foreground">{stat.value}</p>
                  <p className="text-[11px] font-medium text-muted-foreground/60">{stat.sub}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
              {/* Subtle decorative element */}
              <div className="absolute -right-2 -bottom-2 h-16 w-16 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>

        {/* Main Analytics Content Container */}
        <main className="relative rounded-4xl border border-border/40 bg-muted/20 p-1">
          <div className="bg-background rounded-[1.8rem] border border-border/50 shadow-sm overflow-hidden">
            <div className="p-1 min-h-125" key={refreshKey}>
              <AnalyticsDashboard />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}