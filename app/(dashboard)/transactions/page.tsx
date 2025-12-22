// app/(dashboard)/transactions/page.tsx


'use client';

import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { AlertCircle, Search, Flag, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Mock data
const mockTransactions = Array.from({ length: 200 }, (_, i) => ({
  id: `TXN-${String(100000 + i).padStart(6, '0')}`,
  customer: `Customer ${i + 1}`,
  merchant: `Merchant ${Math.floor(i / 10) + 1}`,
  rawAmount: Math.random() * 10000000 + 100000,
  currency: Math.random() > 0.5 ? 'MWK' : 'CNY',
  status: ['Completed', 'Pending', 'Failed'][Math.floor(Math.random() * 3)],
  date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
  flagged: Math.random() > 0.95,
}));

export default function TransactionMonitoringList() {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    currency: 'all',
  });
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [flagOpen, setFlagOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter(tx => {
      const matchesSearch = tx.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        tx.customer.toLowerCase().includes(filters.search.toLowerCase()) ||
        tx.merchant.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = filters.status === 'all' || tx.status === filters.status;
      const matchesCurrency = filters.currency === 'all' || tx.currency === filters.currency;
      return matchesSearch && matchesStatus && matchesCurrency;
    });
  }, [filters]);

  const formatAmount = (amount: number) => {
    if (!mounted) return amount.toFixed(2);
    return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-[#448a33] mb-8">Transaction Monitoring</h1>

      {/* Filters */}
      <Card className="mb-6 p-4 bg-white dark:bg-[#1e293b]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <Input 
              placeholder="Search ID, customer, merchant..." 
              value={filters.search} 
              onChange={e => setFilters({ ...filters, search: e.target.value })} 
              className="pl-10 bg-white dark:bg-[#334155]" 
            />
          </div>
          <Select value={filters.status} onValueChange={v => setFilters({ ...filters, status: v })}>
            <SelectTrigger className="bg-white dark:bg-[#334155]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#1e293b]">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.currency} onValueChange={v => setFilters({ ...filters, currency: v })}>
            <SelectTrigger className="bg-white dark:bg-[#334155]">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#1e293b]">
              <SelectItem value="all">All Currencies</SelectItem>
              <SelectItem value="MWK">MWK</SelectItem>
              <SelectItem value="CNY">CNY</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card className="bg-white dark:bg-[#1e293b]">
        <div className="rounded-lg overflow-hidden">
          <div className="bg-gray-50 dark:bg-[#334155] px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider grid grid-cols-[8rem_12rem_12rem_10rem_2rem_8rem_10rem_8rem] border-b border-gray-200 dark:border-[#334155]">
            <div>ID</div>
            <div>Customer</div>
            <div>Merchant</div>
            <div className="text-right">Amount</div>
            <div></div> {/* Spacer column */}
            <div>Status</div>
            <div>Date</div>
            <div className="text-right">Actions</div>
          </div>
          <div className="max-h-150 overflow-y-auto">
            {filteredTransactions.map(tx => (
              <div key={tx.id} className="border-b border-gray-200 dark:border-[#334155] hover:bg-gray-50 dark:hover:bg-[#2d3748] transition-colors">
                <div className="flex items-center px-4 py-3 text-sm grid grid-cols-[8rem_12rem_12rem_10rem_2rem_8rem_10rem_8rem]">
                  <div className="font-semibold">{tx.id}</div>
                  <div>{tx.customer}</div>
                  <div>{tx.merchant}</div>
                  <div className="text-right font-bold">
                    {tx.currency === 'MWK' ? 'MWK' : '¥'} {formatAmount(tx.rawAmount)}
                  </div>
                  <div></div> {/* Spacer */}
                  <div>
                    <Badge variant={tx.status === 'Completed' ? 'default' : tx.status === 'Pending' ? 'secondary' : 'destructive'}>
                      {tx.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    {format(tx.date, 'dd MMM yyyy HH:mm')}
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    {tx.flagged && <Badge variant="destructive"><AlertCircle size={14} /> Flagged</Badge>}
                    <Button size="sm" variant="ghost" onClick={() => setSelectedTx(tx)}>
                      View <ChevronRight size={16} />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setSelectedTx(tx); setFlagOpen(true); }}>
                      <Flag size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Flag Modal */}
      <Dialog open={flagOpen} onOpenChange={setFlagOpen}>
        <DialogContent className="bg-white dark:bg-[#1e293b]">
          <DialogHeader>
            <DialogTitle>Flag Transaction as Suspicious</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Transaction ID</Label>
              <p className="font-mono">{selectedTx?.id}</p>
            </div>
            <div>
              <Label>Reason (required)</Label>
              <Textarea value={flagReason} onChange={e => setFlagReason(e.target.value)} placeholder="Describe the suspicious activity..." className="bg-white dark:bg-[#334155]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFlagOpen(false)}>Cancel</Button>
            <Button style={{ backgroundColor: '#dc2626' }}>Flag Transaction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}