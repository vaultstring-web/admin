'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const CurrencySpreadAnalysis = () => {
  const spreadData = [
    { date: 'Jan 1', cnySpread: 0.85, mwkSpread: 1.25, avgSpread: 1.05 },
    { date: 'Jan 8', cnySpread: 0.92, mwkSpread: 1.32, avgSpread: 1.12 },
    { date: 'Jan 15', cnySpread: 0.88, mwkSpread: 1.28, avgSpread: 1.08 },
    { date: 'Jan 22', cnySpread: 0.95, mwkSpread: 1.35, avgSpread: 1.15 },
    { date: 'Jan 29', cnySpread: 0.91, mwkSpread: 1.30, avgSpread: 1.10 },
    { date: 'Feb 5', cnySpread: 0.98, mwkSpread: 1.38, avgSpread: 1.18 },
  ];

  const currencyPairs = [
    { pair: 'USD/CNY', spread: 0.92, profit: 14200, trend: 'up' },
    { pair: 'CNY/MWK', spread: 1.32, profit: 18500, trend: 'up' },
    { pair: 'EUR/CNY', spread: 0.88, profit: 9200, trend: 'down' },
    { pair: 'GBP/MWK', spread: 1.45, profit: 12400, trend: 'up' },
  ];

  return (
    <Card className="border-none shadow-sm bg-card overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <div className="p-2 rounded-md bg-primary/10 text-primary">
                <ArrowRightLeft className="h-5 w-5" />
              </div>
              Spread Analysis
            </CardTitle>
            <CardDescription>Real-time conversion margin tracking</CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded text-[10px] font-bold uppercase tracking-tighter">
              <div className="w-2 h-2 rounded-full bg-primary" /> CNY
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded text-[10px] font-bold uppercase tracking-tighter">
              <div className="w-2 h-2 rounded-full bg-secondary" /> AVG
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-56 w-full mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spreadData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCny" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-card)', 
                  borderColor: 'var(--color-border)',
                  borderRadius: 'var(--radius-md)' 
                }}
              />
              <Area 
                type="stepAfter" // High-tech trading look
                dataKey="avgSpread" 
                stroke="var(--color-secondary)" 
                strokeWidth={2}
                fill="url(#colorAvg)" 
                name="Avg Spread"
              />
              <Area 
                type="stepAfter" 
                dataKey="cnySpread" 
                stroke="var(--color-primary)" 
                strokeWidth={2}
                fill="url(#colorCny)" 
                name="CNY Spread"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3">Profitability by Pair</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {currencyPairs.map((pair, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-xl border border-border bg-background/40 hover:bg-muted/30 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center text-[8px] font-bold">{pair.pair.split('/')[0]}</div>
                    <div className="w-6 h-6 rounded-full bg-secondary/20 border-2 border-card flex items-center justify-center text-[8px] font-bold">{pair.pair.split('/')[1]}</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold">{pair.pair}</div>
                    <div className="text-[10px] text-muted-foreground">{pair.spread}% Margin</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold group-hover:text-primary transition-colors">¥{pair.profit.toLocaleString()}</div>
                  <div className="flex items-center justify-end gap-1">
                    {pair.trend === 'up' ? 
                      <TrendingUp className="h-3 w-3 text-brand-green" /> : 
                      <TrendingDown className="h-3 w-3 text-destructive" />
                    }
                    <span className="text-[10px] text-muted-foreground uppercase">MoM</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 mt-6">
           <div className="flex-1 p-3 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Yield</p>
              <p className="text-xl font-bold text-primary">1.12%</p>
           </div>
           <div className="flex-1 p-3 rounded-xl bg-secondary/5 border border-secondary/10">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Rev</p>
              <p className="text-xl font-bold text-secondary">¥61.2K</p>
           </div>
        </div>
      </CardContent>
    </Card>
  );
};
