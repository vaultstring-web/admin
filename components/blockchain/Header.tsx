'use client';

import React from 'react';
import { Activity, Server, Clock, Shield, ChevronRight, Cpu } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export enum NetworkStatus {
  HEALTHY = 'Healthy',
  DEGRADED = 'Degraded',
  OFFLINE = 'Offline',
  SYNCING = 'Syncing',
  MAINTENANCE = 'Maintenance'
}

interface HeaderProps {
  status: NetworkStatus;
  height: number;
  lastUpdate: string;
  peerCount?: number;
  channel?: string;
}

export const BlockchainHeader: React.FC<HeaderProps> = ({ 
  status, 
  height, 
  lastUpdate,
  peerCount = 4,
  channel = 'fintech-channel'
}) => {
  const getStatusConfig = (status: NetworkStatus) => {
    switch (status) {
      case NetworkStatus.HEALTHY:
        return {
          dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
          pulse: 'animate-pulse',
          text: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-50 dark:bg-emerald-500/10',
          border: 'border-emerald-100 dark:border-emerald-500/20'
        };
      case NetworkStatus.OFFLINE:
        return {
          dot: 'bg-rose-500',
          pulse: '',
          text: 'text-rose-600 dark:text-rose-400',
          bg: 'bg-rose-50 dark:bg-rose-500/10',
          border: 'border-rose-100 dark:border-rose-500/20'
        };
      default:
        return {
          dot: 'bg-amber-500',
          pulse: 'animate-pulse',
          text: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-50 dark:bg-amber-500/10',
          border: 'border-amber-100 dark:border-amber-500/20'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <header className="mb-10 space-y-6">
      {/* Top Section: Title & Channel info */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 ring-1 ring-emerald-500/20 rounded-xl shadow-inner">
              <Shield className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
                  Ledger Inspector
                </h1>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium flex items-center gap-1.5">
                Verification Engine 
              </p>
            </div>
          </div>
        </div>

        {/* Global Network Health Bar */}
        <div className={cn(
          "flex items-center gap-4 px-4 py-2 rounded-2xl border backdrop-blur-sm transition-all",
          config.bg, config.border
        )}>
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Network Stability</span>
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", config.dot, config.pulse)} />
              <span className={cn("text-xs font-black uppercase tracking-tight", config.text)}>
                {status}
              </span>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">TPS (Avg)</span>
            <span className="text-xs font-bold font-mono">1,240 <span className="text-[10px] text-slate-400 font-sans">ops/s</span></span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Ledger Height" 
          value={height.toLocaleString()} 
          subValue="Blocks Committed"
          icon={Server} 
          isMono 
        />
        <StatCard 
          label="Last Update" 
          value={lastUpdate} 
          subValue="Commit Latency: 12ms"
          icon={Clock} 
        />
        <StatCard 
          label="Validated Peers" 
          value={peerCount} 
          icon={Cpu}
          customElement={
            <div className="flex -space-x-1.5 mt-2">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-sm"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
              ))}
              <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[8px] font-bold">
                +{peerCount - 3}
              </div>
            </div>
          }
        />
        <StatCard 
          label="Traffic" 
          value="4.2 GB" 
          subValue="Peer-to-Peer Relay"
          icon={Activity} 
        />
      </div>
    </header>
  );
};

function StatCard({ label, value, subValue, icon: Icon, isMono, customElement }: any) {
  return (
    <Card className="border-none shadow-sm bg-white dark:bg-slate-900 ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden group hover:ring-emerald-500/30 transition-all">
      <CardContent className="p-4 relative">
        <div className="flex justify-between items-start relative z-10">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <p className={cn(
              "text-xl font-black tracking-tight text-slate-900 dark:text-white",
              isMono && "font-mono"
            )}>
              {value}
            </p>
            {subValue && (
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                {subValue}
              </p>
            )}
            {customElement}
          </div>
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-600 group-hover:text-emerald-500 transition-colors">
            <Icon size={16} />
          </div>
        </div>
        {/* Subtle background decoration */}
        <div className="absolute -right-2 -bottom-2 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 transition-transform">
            <Icon size={64} />
        </div>
      </CardContent>
    </Card>
  );
}