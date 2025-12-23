'use client';

import { TrendingUp, TrendingDown, Users, Currency, CreditCard, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const AnalyticsSummary = () => {
  const metrics = [
    {
      title: 'Transaction Volume',
      value: '¥8.2M',
      change: '+12.5%',
      trendingUp: true,
      icon: CreditCard,
      color: 'text-emerald-500',
    },
    {
      title: 'Active Users',
      value: '4,528',
      change: '+8.3%',
      trendingUp: true,
      icon: Users,
      color: 'text-blue-500',
    },
    {
      title: 'Revenue from Fees',
      value: 'MK 12.4M',
      change: '+15.2%',
      trendingUp: true,
      icon: Currency,
      color: 'text-primary',
    },
    {
      title: 'Active Merchants',
      value: '342',
      change: '+5.1%',
      trendingUp: true,
      icon: Building2,
      color: 'text-violet-500',
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-1">
      {metrics.map((metric, index) => (
        <div 
          key={index}
          className="group relative overflow-hidden rounded-4xl border border-border/50 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)]"
        >
          {/* Background Accent */}
          <div className="absolute -right-4 -top-4 h-24 w-24 opacity-[0.03] transition-opacity group-hover:opacity-[0.08]">
            <metric.icon className="h-full w-full" />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className={cn("p-2 rounded-xl bg-muted/50 transition-colors group-hover:bg-background", metric.color)}>
                <metric.icon className="h-4 w-4" />
              </div>
              <div className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-tight",
                metric.trendingUp 
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                  : "bg-red-500/10 text-red-600 dark:text-red-400"
              )}>
                {metric.trendingUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {metric.change}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
                {metric.title}
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <h3 className="text-2xl font-black tracking-tighter text-foreground">
                  {metric.value}
                </h3>
              </div>
              <p className="mt-1 text-[10px] font-medium text-muted-foreground/40 italic">
                vs. previous 30d
              </p>
            </div>
          </div>
          
          {/* Subtle Bottom Highlight line */}
          <div className={cn(
            "absolute bottom-0 left-0 h-1 w-0 transition-all duration-500 group-hover:w-full opacity-40",
            metric.color.replace('text', 'bg')
          )} />
        </div>
      ))}
    </div>
  );
};