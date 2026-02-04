'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import type { TransactionVolume } from '@/lib/api';

interface TransactionVolumeChartProps {
  data?: TransactionVolume[];
}

export const TransactionVolumeChart = ({ data }: TransactionVolumeChartProps) => {
  const [currencyFilter, setCurrencyFilter] = useState('total');

  const chartData = data && data.length > 0 ? data.map(item => ({
    month: item.period,
    cny: Number(item.cny),
    mwk: Number(item.mwk),
    zmw: Number(item.zmw),
    total: Number(item.total)
  })) : [];

  // Helper for currency formatting
  const formatCurrency = (value: number) => {
    let prefix = 'MK';
    if (currencyFilter === 'cny') prefix = '¥';
    if (currencyFilter === 'zmw') prefix = 'ZK';
    
    if (value >= 1000000000) return `${prefix}${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${prefix}${(value / 1000000).toFixed(1)}M`;
    return `${prefix}${value.toLocaleString()}`;
  };

  return (
    <Card className="border-none shadow-sm bg-card">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <div className="p-2 rounded-md bg-primary/10 text-primary">
              <TrendingUp className="h-5 w-5" />
            </div>
            Transaction Volume
          </CardTitle>
          <CardDescription>Visualizing cross-border flow trends</CardDescription>
        </div>
        
        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
          <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
            <SelectTrigger className="w-32 border-none bg-transparent focus:ring-0 shadow-none">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="total">Overall</SelectItem>
              <SelectItem value="cny">CNY Only</SelectItem>
              <SelectItem value="mwk">MWK Only</SelectItem>
              <SelectItem value="zmw">ZMW Only</SelectItem>
            </SelectContent>
          </Select>
          <div className="w-px h-4 bg-border" />
          <Select defaultValue="6m">
            <SelectTrigger className="w-32 border-none bg-transparent focus:ring-0 shadow-none">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-75 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                  tickFormatter={formatCurrency}
                />
                <Tooltip 
                  cursor={{ stroke: 'var(--color-primary)', strokeWidth: 1 }}
                  contentStyle={{ 
                    backgroundColor: 'var(--color-card)', 
                    borderColor: 'var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  itemStyle={{ color: 'var(--color-foreground)' }}
                  labelStyle={{ color: 'var(--color-muted-foreground)', marginBottom: '0.5rem' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Area 
                  type="monotone" 
                  dataKey={currencyFilter} 
                  stroke="var(--color-primary)" 
                  strokeWidth={2}
                  fill="url(#colorPrimary)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No data available for the selected period
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
