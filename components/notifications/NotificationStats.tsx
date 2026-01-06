'use client';

import { Notification, NotificationType, NotificationStatus } from './types';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, AlertCircle, CheckCircle2, ShieldAlert, Activity, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationStatsProps {
  notifications: Notification[];
}

export const NotificationStats: React.FC<NotificationStatsProps> = ({ notifications }) => {
  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => n.status === NotificationStatus.UNREAD).length,
    today: notifications.filter(n => {
      const today = new Date();
      const notificationDate = new Date(n.timestamp);
      return today.toDateString() === notificationDate.toDateString();
    }).length,
    security: notifications.filter(n => n.type === NotificationType.SECURITY).length,
    errors: notifications.filter(n => n.type === NotificationType.ERROR).length,
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard 
        label="Total Events" 
        value={stats.total} 
        icon={Activity} 
        color="slate" 
      />
      
      <StatCard 
        label="Unread Signals" 
        value={stats.unread} 
        icon={Bell} 
        color="emerald" 
        pulse={stats.unread > 0}
      />

      <StatCard 
        label="Daily Throughput" 
        value={stats.today} 
        icon={CheckCircle2} 
        color="blue" 
      />

      <StatCard 
        label="Security Alerts" 
        value={stats.security} 
        icon={ShieldAlert} 
        color="indigo" 
        isWarning={stats.security > 0}
      />

      <StatCard 
        label="Critical Errors" 
        value={stats.errors} 
        icon={AlertCircle} 
        color="rose" 
        isCritical={stats.errors > 0}
      />
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'slate' | 'emerald' | 'blue' | 'indigo' | 'rose';
  pulse?: boolean;
  isWarning?: boolean;
  isCritical?: boolean;
}

const StatCard = ({ label, value, icon: Icon, color, pulse, isWarning, isCritical }: StatCardProps) => {
  const themes = {
    slate: "text-slate-600 dark:text-slate-400 bg-slate-500/10 ring-slate-500/20",
    emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 ring-emerald-500/20",
    blue: "text-blue-600 dark:text-blue-400 bg-blue-500/10 ring-blue-500/20",
    indigo: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 ring-indigo-500/20",
    rose: "text-rose-600 dark:text-rose-400 bg-rose-500/10 ring-rose-500/20",
  };

  return (
    <Card className={cn(
      "border-none shadow-sm ring-1 transition-all duration-300 overflow-hidden bg-white dark:bg-slate-950",
      themes[color],
      (isCritical || isWarning) && "ring-opacity-50 shadow-lg shadow-current/5"
    )}>
      <CardContent className="p-4 relative">
        {/* Background Decorative Icon */}
        <Icon className="absolute -right-2 -bottom-2 h-16 w-16 opacity-[0.03] dark:opacity-[0.05] rotate-12" />
        
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.15em] opacity-70">
              {label}
            </span>
            <div className={cn(
              "p-1.5 rounded-lg",
              themes[color]
            )}>
              <Icon className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono tracking-tighter tabular-nums">
              {value.toLocaleString()}
            </span>
            {pulse && (
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
