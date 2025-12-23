'use client';

import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Download, Activity, Zap, CheckCircle2, AlertCircle, Coins } from 'lucide-react';
import { SettlementBatch, Corridor } from './types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface SettlementActivityProps {
  batches: SettlementBatch[];
}

export const SettlementActivity: React.FC<SettlementActivityProps> = ({ batches }) => {
  const [currency, setCurrency] = useState<'MWK' | 'CNY'>('MWK');

  // Simple conversion mock (e.g., 1 CNY = 240 MWK)
  const conversionRate = currency === 'MWK' ? 1 : 1 / 240;

  const chartData = useMemo(() => [
    { name: 'Mon', vol: 4500000 * conversionRate },
    { name: 'Tue', vol: 3800000 * conversionRate },
    { name: 'Wed', vol: 5100000 * conversionRate },
    { name: 'Thu', vol: 4200000 * conversionRate },
    { name: 'Fri', vol: 5800000 * conversionRate },
    { name: 'Sat', vol: 2100000 * conversionRate },
    { name: 'Sun', vol: 1500000 * conversionRate },
  ], [conversionRate]);

  const getStatusConfig = (status: string) => {
    const configs: Record<string, any> = {
      Completed: { icon: CheckCircle2, class: "text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" },
      Pending: { icon: Activity, class: "text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" },
      Failed: { icon: AlertCircle, class: "text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20" },
    };
    return configs[status] || { icon: Activity, class: "bg-slate-100 text-slate-600 border-slate-200" };
  };

  const getCorridorStyles = (corridor: Corridor) => {
    switch (corridor) {
      case Corridor.MALAWI:
        return "bg-emerald-500 text-white dark:bg-emerald-600 border-transparent shadow-sm shadow-emerald-200";
      case Corridor.USA:
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300 border-cyan-200/50";
      case Corridor.CHINA:
        return "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200/50";
      case Corridor.EUROPE:
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200/50";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200";
    }
  };

  return (
    <Card className="border-none shadow-md bg-white dark:bg-slate-950 ring-1 ring-slate-100 dark:ring-slate-800">
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between pb-8 space-y-4 md:space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
            Settlement Activity
            <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200 uppercase font-black">Live</Badge>
          </CardTitle>
          <CardDescription className="text-xs">Global funds movement and batch logs</CardDescription>
        </div>
        
        <div className="flex items-center gap-3">
          <Tabs defaultValue="MWK" onValueChange={(v) => setCurrency(v as any)} className="h-8">
            <TabsList className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-8 p-1">
              <TabsTrigger value="MWK" className="text-[10px] font-bold px-3 data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all h-6">MWK</TabsTrigger>
              <TabsTrigger value="CNY" className="text-[10px] font-bold px-3 data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all h-6">CNY (元)</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-semibold border-slate-200 dark:border-slate-800">
            <Download className="h-3.5 w-3.5" />
            CSV
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-10">
        {/* Expanded Chart Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Settlement Volume Trend</h3>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">Unit: {currency}</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                  tickFormatter={(v) => currency === 'MWK' ? `${(v/1000000).toFixed(1)}M` : `¥${(v/1000).toFixed(0)}k`}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(16, 185, 129, 0.05)', radius: 6 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-950 text-white p-3 rounded-lg shadow-2xl border border-emerald-500/30 text-xs">
                          <p className="font-bold mb-1 text-slate-400">{payload[0].payload.name}</p>
                          <p className="text-emerald-400 font-mono font-bold text-sm">
                            {currency === 'CNY' ? '¥' : 'K'}{payload[0].value?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="vol" radius={[6, 6, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill="url(#greenGradient)"
                      fillOpacity={index === 4 ? 1 : 0.7}
                      className="transition-all duration-500 hover:fillOpacity-100 cursor-pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Repositioned Horizontal Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricTile label="Avg. Settlement" value="18m 42s" icon={Zap} color="emerald" />
          <MetricTile label="Success Rate" value="99.9%" subValue="Last 24 hours" icon={CheckCircle2} color="emerald" />
          <MetricTile label="Conversion Rate" value={currency === 'MWK' ? "1:1" : "1:240"} subValue={`${currency} Ratio`} icon={Coins} color="emerald" />
        </div>

        {/* Table Section */}
        <div className="space-y-4 pt-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Recent Batches</h3>
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <TableRow>
                  <TableHead className="h-12 text-[10px] font-bold uppercase">Batch ID</TableHead>
                  <TableHead className="h-12 text-[10px] font-bold uppercase">Corridor</TableHead>
                  <TableHead className="h-12 text-[10px] font-bold uppercase text-right">Volume ({currency})</TableHead>
                  <TableHead className="h-12 text-[10px] font-bold uppercase text-center">Status</TableHead>
                  <TableHead className="h-12 text-[10px] font-bold uppercase text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((batch) => {
                  const config = getStatusConfig(batch.status);
                  const StatusIcon = config.icon;
                  const convertedVolume = batch.volume * conversionRate;
                  
                  return (
                    <TableRow key={batch.id} className="group hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors border-slate-100 dark:border-slate-800">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 leading-none mb-1">{batch.id}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{batch.date}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-[10px] font-bold py-0.5 h-6 px-3 border transition-all", getCorridorStyles(batch.corridor))}>
                          {batch.corridor}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-bold tabular-nums">
                        {convertedVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap", config.class)}>
                          <StatusIcon size={10} strokeWidth={3} />
                          {batch.status}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-emerald-600">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

function MetricTile({ label, value, subValue, icon: Icon, color }: any) {
  return (
    <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-emerald-500/30 transition-all duration-300">
      <div className="space-y-0.5">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">{value}</p>
        {subValue && <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 opacity-80">{subValue}</p>}
      </div>
      <div className="p-2.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
        <Icon size={18} strokeWidth={2.5} />
      </div>
    </div>
  );
}