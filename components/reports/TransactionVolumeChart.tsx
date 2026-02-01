'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export const TransactionVolumeChart = () => {
  const [currencyFilter, setCurrencyFilter] = useState('total');

  const data = [
    { month: 'Jan', cny: 7200000, mwk: 1250000000, total: 1322000000 },
    { month: 'Feb', cny: 8100000, mwk: 1420000000, total: 1428100000 },
    { month: 'Mar', cny: 9200000, mwk: 1680000000, total: 1689200000 },
    { month: 'Apr', cny: 8500000, mwk: 1580000000, total: 1588500000 },
    { month: 'May', cny: 9500000, mwk: 1820000000, total: 1829500000 },
    { month: 'Jun', cny: 11200000, mwk: 2150000000, total: 2161200000 },
  ];

  // Helper for currency formatting
  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `¥${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `¥${(value / 1000000).toFixed(1)}M`;
    return `¥${value.toLocaleString()}`;
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
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                  color: 'var(--color-foreground)'
                }}
                formatter={(value: number) => [formatCurrency(value), 'Volume']}
              />
              
              {/* Using Area instead of Line for a "sleeker" filled look */}
              <Area
                type="monotone"
                dataKey={currencyFilter === 'total' ? 'total' : currencyFilter}
                stroke="var(--color-primary)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorPrimary)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Footer Metrics */}
        <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Daily</p>
            <p className="text-xl font-bold">¥32.4M</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Peak</p>
            <p className="text-xl font-bold">¥48.7M</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Growth</p>
            <div className="flex items-center gap-1 text-primary">
              <p className="text-xl font-bold">+12.5%</p>
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
