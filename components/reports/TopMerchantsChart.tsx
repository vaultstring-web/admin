'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building, ArrowUpRight } from 'lucide-react';

export const TopMerchantsChart = () => {
  const merchants = [
    { rank: 1, name: 'Global Tech Solutions', volume: 12500000, transactions: 2450, growth: 15.2 },
    { rank: 2, name: 'Premium Retail Chain', volume: 9800000, transactions: 1890, growth: 8.7 },
    { rank: 3, name: 'Luxury Imports Ltd', volume: 8750000, transactions: 1250, growth: 22.4 },
    { rank: 4, name: 'Digital Services Inc', volume: 7200000, transactions: 3420, growth: 12.8 },
    { rank: 5, name: 'Manufacturing Corp', volume: 6500000, transactions: 890, growth: 5.6 },
    { rank: 6, name: 'Export Trading Co', volume: 5800000, transactions: 1120, growth: 18.3 },
    { rank: 7, name: 'Service Provider SA', volume: 5200000, transactions: 2560, growth: 9.1 },
    { rank: 8, name: 'Tech Distributors', volume: 4800000, transactions: 1780, growth: 14.7 },
  ];

  return (
    <Card className="border-none shadow-sm bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-6">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <div className="p-2 rounded-md bg-secondary/10 text-secondary">
              <Building className="h-5 w-5" />
            </div>
            Top Merchants
          </CardTitle>
          <CardDescription>Performance by sales volume</CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-xl border border-border bg-background/50 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="w-20 font-bold text-xs uppercase tracking-wider">Rank</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Merchant Name</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Volume</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase tracking-wider hidden md:table-cell">TXNS</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Growth</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {merchants.map((merchant) => (
                <TableRow key={merchant.rank} className="border-border group transition-colors">
                  <TableCell>
                    <span className="flex items-center justify-center w-7 h-7 rounded-md bg-secondary/10 text-secondary text-xs font-bold ring-1 ring-secondary/20">
                      {merchant.rank}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {merchant.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase">ID: MERCH-{1000 + merchant.rank}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-sm">
                    ¥{(merchant.volume / 1000000).toFixed(1)}M
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm hidden md:table-cell">
                    {merchant.transactions.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-brand-green/10 text-brand-green text-xs font-bold">
                      <ArrowUpRight className="h-3 w-3" />
                      {merchant.growth}%
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Dynamic Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {[
            { label: 'Total Volume', value: '¥60.8M', sub: 'Last 30 days' },
            { label: 'Avg Ticket', value: '¥4,850', sub: 'Per transaction' },
            { label: 'Active Partners', value: '342', sub: '+12 this month' }
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-xl border border-border bg-muted/20 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-2 opacity-5">
                 <Building className="h-12 w-12" />
               </div>
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
               <p className="text-xl font-extrabold mt-1">{stat.value}</p>
               <p className="text-[10px] text-brand-green font-medium mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
