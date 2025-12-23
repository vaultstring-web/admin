'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, ArrowUpRight, Wallet } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';

export const RevenueFromFees = () => {
  const feeData = [
    { name: 'Transaction Fees', value: 4200000, color: 'var(--color-chart-1)' }, // Brand Green
    { name: 'Currency Conversion', value: 2800000, color: 'var(--color-chart-2)' }, // Brand Blue
    { name: 'Withdrawal Fees', value: 1850000, color: 'var(--color-chart-3)' },
    { name: 'Subscriptions', value: 950000, color: 'var(--color-chart-4)' },
    { name: 'Other', value: 450000, color: 'var(--color-chart-5)' },
  ];

  const totalRevenue = feeData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="border-none shadow-sm bg-card overflow-hidden">
      <CardHeader className="pb-0">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <div className="p-2 rounded-md bg-brand-green/10 text-brand-green">
              <Wallet className="h-5 w-5" />
            </div>
            Fee Revenue
          </CardTitle>
          <CardDescription>Breakdown by service category</CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative h-70 w-full">
          {/* Centered Total Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Total</span>
            <span className="text-2xl font-bold tracking-tight">
              MK {(totalRevenue / 1000000).toFixed(1)}M
            </span>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={feeData}
                cx="50%"
                cy="50%"
                innerRadius={70} // Creates the doughnut effect
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {feeData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-card)', 
                  borderColor: 'var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                }}
                itemStyle={{ color: 'var(--color-foreground)' }}
                formatter={(value) => [`MK ${Number(value).toLocaleString()}`, 'Revenue']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Sleek Legend Grid */}
        <div className="grid grid-cols-1 gap-2 mt-2">
          {feeData.map((item, index) => (
            <div key={index} className="flex items-center justify-between group">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: item.color }} 
                />
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">
                  {((item.value / totalRevenue) * 100).toFixed(0)}%
                </span>
                <span className="text-xs text-muted-foreground w-20 text-right">
                  MK {(item.value / 1000000).toFixed(1)}M
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Stats Section */}
        <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Avg per User</p>
            <p className="text-lg font-bold">MK 2,850</p>
          </div>
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-[10px] font-bold text-primary uppercase tracking-tight">Growth</p>
            <div className="flex items-center gap-1">
              <p className="text-lg font-bold text-primary">+8.4%</p>
              <ArrowUpRight className="h-4 w-4 text-primary" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};