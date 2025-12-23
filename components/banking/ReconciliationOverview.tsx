'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { AlertCircle, ChevronRight, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const ReconciliationOverview: React.FC = () => {
  const data = [
    { name: 'Matched', value: 9820, color: '#10b981' }, // emerald-500
    { name: 'Unmatched', value: 180, color: '#f43f5e' }, // rose-500
  ];

  const recentDiscrepancies = [
    { 
      id: 'REC-0012', 
      description: 'MTN MW mismatch: $450.00', 
      type: 'warning' as const 
    },
    { 
      id: 'REC-0015', 
      description: 'ICBC duplicate entry check', 
      type: 'info' as const 
    },
  ];

  const totalItems = data.reduce((sum, item) => sum + item.value, 0);
  const matchPercentage = ((data[0].value / totalItems) * 100).toFixed(1);

  return (
    <Card className="border-none shadow-sm bg-white dark:bg-slate-950 ring-1 ring-slate-100 dark:ring-slate-800">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold tracking-tight">Reconciliation</CardTitle>
            <CardDescription className="text-xs">Platform vs. External Ledger</CardDescription>
          </div>
          <div className="px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
            Live Sync
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8 pt-4">
        {/* Chart Section */}
        <div className="grid grid-cols-5 gap-8 items-center">
          <div className="col-span-2 relative h-35">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={58}
                  paddingAngle={8}
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      stroke="transparent"
                      className="outline-none focus:outline-none"
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-slate-50">
                {matchPercentage}%
              </span>
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">
                Matched
              </span>
            </div>
          </div>
          
          <div className="col-span-3 space-y-4">
            <div className="space-y-2">
              {data.map((item) => (
                <div key={item.name} className="flex justify-between items-center group">
                  <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold tabular-nums">
                    {item.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total</span>
              <span className="text-sm font-mono font-bold">{totalItems.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* List Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">
              Recent Discrepancies
            </h3>
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
          </div>
          
          <div className="space-y-2">
            {recentDiscrepancies.map((item) => (
              <div 
                key={item.id}
                className="group flex items-center gap-4 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all cursor-pointer"
              >
                <div className={cn(
                  "shrink-0 p-2 rounded-lg",
                  item.type === 'warning' 
                    ? 'text-amber-600 bg-amber-50 dark:bg-amber-500/10' 
                    : 'text-blue-600 bg-blue-50 dark:bg-blue-500/10'
                )}>
                  <AlertCircle size={16} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-slate-400 group-hover:text-primary transition-colors">
                      {item.id}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium truncate leading-none mt-1">
                    {item.description}
                  </p>
                </div>

                <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 group-hover:translate-x-0.5 transition-all" />
              </div>
            ))}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full mt-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 gap-2"
          >
            Review All Discrepancies
            <ArrowUpRight size={14} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};