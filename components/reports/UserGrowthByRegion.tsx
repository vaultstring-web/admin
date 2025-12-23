'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Globe, Users, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const UserGrowthByRegion = () => {
  // Mapping to your CSS variable chart colors
  const regionData = [
    { region: 'East Asia', users: 1850, growth: 25, color: 'var(--color-chart-1)' },
    { region: 'Southeast Asia', users: 1420, growth: 32, color: 'var(--color-chart-2)' },
    { region: 'Southern Africa', users: 1230, growth: 38, color: 'var(--color-chart-3)' },
    { region: 'West Africa', users: 980, growth: 12, color: 'var(--color-chart-4)' },
    { region: 'Europe', users: 750, growth: 8, color: 'var(--color-chart-5)' },
  ];

  return (
    <Card className="border-none shadow-sm bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <div className="p-2 rounded-md bg-secondary/10 text-secondary">
                <Globe className="h-5 w-5" />
              </div>
              Regional Distribution
            </CardTitle>
            <CardDescription>User base growth and acquisition</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">6,230</p>
            <p className="text-xs text-muted-foreground">Total Active Users</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={regionData} 
              layout="vertical" 
              margin={{ left: -20, right: 30, top: 0, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis 
                dataKey="region" 
                type="category" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'var(--color-foreground)', fontSize: 12, fontWeight: 500 }}
                width={100}
              />
              <Tooltip
                cursor={{ fill: 'var(--color-muted)', opacity: 0.4 }}
                contentStyle={{ 
                  backgroundColor: 'var(--color-card)', 
                  borderColor: 'var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                }}
              />
              <Bar 
                dataKey="users" 
                radius={[0, 4, 4, 0]} 
                barSize={24}
              >
                {regionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid gap-3 mt-6">
          {regionData.map((region, index) => (
            <div 
              key={index} 
              className="group flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-1.5 h-8 rounded-full" 
                  style={{ backgroundColor: region.color }} 
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{region.region}</span>
                  <span className="text-xs text-muted-foreground">{region.users.toLocaleString()} users</span>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 text-primary text-sm font-medium">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>{region.growth}%</span>
                </div>
                <span className="text-[10px] text-muted-foreground uppercase">MoM Growth</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};