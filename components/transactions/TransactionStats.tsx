'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Banknote, AlertCircle, CheckCircle, Clock, BarChart3 } from 'lucide-react';
import { type Transaction } from './types';
import { cn } from '@/lib/utils';

interface TransactionStatsProps {
  transactions: Transaction[];
}

export function TransactionStats({ transactions }: TransactionStatsProps) {

  const stats = {
    total: transactions.length,
    flagged: transactions.filter(tx => tx.flagged).length,
    completed: transactions.filter(tx => tx.status === 'Completed').length,
    pending: transactions.filter(tx => tx.status === 'Pending').length,
    totalAmount: transactions.reduce((sum, tx) => sum + tx.rawAmount, 0),
    totalFees: transactions.reduce((sum, tx) => sum + (tx.feeAmount || 0), 0),
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
      <StatCard 
        label="Total Volume" 
        value={stats.total} 
        icon={BarChart3}
        color="blue"
      />
      <StatCard 
        label="Flagged" 
        value={stats.flagged} 
        icon={AlertCircle}
        color="red"
        isDestructive={stats.flagged > 0}
      />
      <StatCard 
        label="Completed" 
        value={stats.completed} 
        icon={CheckCircle}
        color="emerald"
      />
      <StatCard 
        label="Pending" 
        value={stats.pending} 
        icon={Clock}
        color="amber"
      />
      {/* Special Revenue Card: Spans 2 columns */}
      <StatCard 
        label="Total Revenue" 
        value={stats.totalAmount} 
        icon={Banknote}
        color="violet"
        isCurrency
        className="lg:col-span-2 shadow-md shadow-violet-500/5 ring-violet-500/20 dark:ring-violet-500/30"
      />
      <StatCard 
        label="Fees Earned" 
        value={stats.totalFees} 
        icon={Banknote}
        color="emerald"
        isCurrency
      />
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  color, 
  isCurrency,
  isDestructive,
  className
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  color: 'blue' | 'red' | 'emerald' | 'amber' | 'violet';
  isCurrency?: boolean;
  isDestructive?: boolean;
  className?: string;
}) {
  const colorMap = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400",
    red: "text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400",
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400",
    amber: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400",
    violet: "text-violet-600 bg-violet-50 dark:bg-violet-500/10 dark:text-violet-400",
  };

  // Format currency parts for cleaner typography
  const renderValue = () => {
    if (!isCurrency) return value;
    
    const formatted = value.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
    const [whole, decimal] = formatted.split('.');

    return (
      <div className="flex items-baseline gap-0.5">
        <span className="text-lg font-medium text-slate-400 mr-1">MK</span>
        <span className="text-2xl font-bold tracking-tight">{whole}</span>
        <span className="text-lg font-medium text-slate-400">.{decimal}</span>
      </div>
    );
  };

  return (
    <Card className={cn(
      "p-5 border-none shadow-sm bg-white dark:bg-slate-950 ring-1 ring-slate-100 dark:ring-slate-800 transition-all hover:shadow-md",
      className
    )}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {label}
          </span>
          <div className={cn("p-2 rounded-lg", colorMap[color as keyof typeof colorMap])}>
            <Icon size={14} strokeWidth={2.5} />
          </div>
        </div>
        <div className={cn(
          "tabular-nums leading-none",
          isDestructive ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-slate-50",
          !isCurrency && "text-2xl font-bold tracking-tight"
        )}>
          {renderValue()}
        </div>
      </div>
    </Card>
  );
}
