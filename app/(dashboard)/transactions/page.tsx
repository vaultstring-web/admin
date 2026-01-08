// app/(dashboard)/transactions/page.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { FlagTransactionDialog } from '@/components/transactions/FlagTransactionDialog';
import { TransactionStats } from '@/components/transactions/TransactionStats';
import { type Transaction } from '@/components/transactions/types';
import { API_BASE } from '@/lib/constants';
import { useSession } from '@/hooks/useSession';

export default function TransactionMonitoringPage() {
  const { isAuthenticated, isLoading: sessionLoading } = useSession();
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    currency: 'all',
    type: 'all',
  });
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [flagOpen, setFlagOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [mounted, setMounted] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (sessionLoading || !isAuthenticated) {
      return;
    }

    const fetchTransactions = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('vs_token') : null;
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/admin/transactions?limit=100&offset=0`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (!res.ok) {
          throw new Error('Failed to fetch transactions');
        }

        const data = await res.json();
        const txs = Array.isArray(data.transactions) ? data.transactions : [];
        
        const ids = new Set<string>();
        for (const t of txs) {
          const s = String(t.sender_id || t.senderId || '').trim();
          const r = String(t.receiver_id || t.receiverId || '').trim();
          if (s) ids.add(s);
          if (r) ids.add(r);
        }
        const idList = Array.from(ids);
        const nameMap: Record<string, { name: string; email?: string; type?: string }> = {};
        const fetchUser = async (id: string) => {
          const r = await fetch(`${API_BASE}/admin/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: 'include',
          });
          if (r.ok) {
            const u = await r.json();
            const fullName = [u.first_name, u.last_name].filter(Boolean).join(' ').trim();
            nameMap[id] = {
              name: fullName || u.email || `User-${String(id).slice(0, 8)}`,
              email: u.email,
              type: String(u.user_type || '').toLowerCase(),
            };
          }
        };
        await Promise.all(idList.map(fetchUser));

        const mapped: Transaction[] = txs.map((t: any) => {
          const amt = t.amount && typeof t.amount === 'object' ? t.amount.amount : t.amount;
          const cur = t.amount && typeof t.amount === 'object' ? t.amount.currency : t.currency;
          const feeAmtRaw = t.fee && typeof t.fee === 'object' ? t.fee.amount : t.fee;
          const netAmtRaw = t.net_amount && typeof t.net_amount === 'object' ? t.net_amount.amount : t.net_amount;
          const senderId = String(t.sender_id || t.senderId || '').trim();
          const receiverId = String(t.receiver_id || t.receiverId || '').trim();
          const senderInfo = senderId ? nameMap[senderId] : undefined;
          const receiverInfo = receiverId ? nameMap[receiverId] : undefined;
          const fallbackSender = senderId ? `User-${senderId.slice(0, 8)}` : 'Unknown';
          const fallbackReceiver = receiverId ? `User-${receiverId.slice(0, 8)}` : 'Unknown';
          const txType = String(t.transaction_type || '').toLowerCase();
          const dir: 'sent' | 'received' =
            txType === 'deposit' ? 'received' : 'sent';
          return {
            id: t.id || t.transaction_id || '',
            customer: t.sender_name || (senderInfo?.name ?? t.sender_email) || fallbackSender,
            merchant: t.receiver_name || (receiverInfo?.name ?? t.receiver_email) || fallbackReceiver,
            senderType: (senderInfo?.type ?? String(t.sender_user_type || '')).toLowerCase() || undefined,
            receiverType: (receiverInfo?.type ?? String(t.receiver_user_type || '')).toLowerCase() || undefined,
            rawAmount: parseFloat(amt || 0),
            feeAmount: feeAmtRaw !== undefined ? parseFloat(feeAmtRaw || 0) : undefined,
            netAmount: netAmtRaw !== undefined ? parseFloat(netAmtRaw || 0) : undefined,
            currency: cur || 'MWK',
            status: mapStatus(t.status),
            date: new Date(t.created_at || t.timestamp || Date.now()),
            flagged: t.flagged || false,
            transactionType: txType,
            direction: dir,
            reference: String(t.reference || ''),
          };
        });

        setTransactions(mapped);
      } catch (err: any) {
        console.error('Failed to fetch transactions:', err);
        setError(err?.message || 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [sessionLoading, isAuthenticated]);

  const mapStatus = (status: string): 'Completed' | 'Pending' | 'Failed' => {
    const s = (status || '').toLowerCase();
    if (s.includes('completed') || s.includes('settled')) return 'Completed';
    if (s.includes('failed') || s.includes('error')) return 'Failed';
    return 'Pending';
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch = tx.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        tx.customer.toLowerCase().includes(filters.search.toLowerCase()) ||
        tx.merchant.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = filters.status === 'all' || tx.status.toLowerCase() === filters.status.toLowerCase();
      const matchesCurrency = filters.currency === 'all' || tx.currency === filters.currency;
      const matchesType =
        filters.type === 'all' ||
        (filters.type === 'sent' && (tx.direction === 'sent')) ||
        (filters.type === 'received' && (tx.direction === 'received'));
      return matchesSearch && matchesStatus && matchesCurrency && matchesType;
    });
  }, [transactions, filters]);

  const formatAmount = (amount: number) => {
    if (!mounted) return amount.toFixed(2);
    return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleSelectTransaction = (transaction: Transaction) => {
    setSelectedTx(transaction);
    // In a real app, you might navigate to a detail page or open a detail modal
    console.log('Selected transaction:', transaction);
  };

  const handleFlagTransaction = (transaction: Transaction) => {
    setSelectedTx(transaction);
    setFlagOpen(true);
  };

  const handleFlagConfirm = () => {
    if (selectedTx && flagReason.trim()) {
      // In a real app, you would update the transaction status via API
      console.log(`Flagged transaction ${selectedTx.id}: ${flagReason}`);
      alert(`Transaction ${selectedTx.id} has been flagged.`);
      setFlagOpen(false);
      setFlagReason('');
    }
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      currency: 'all',
    });
  };

  if (sessionLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#448a33] mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-600 dark:text-red-400 font-medium">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Transaction Monitoring</h1>
        <p className="mt-2 text-muted-foreground">
          Monitor and review transactions for suspicious activity • {transactions.length} total transactions
        </p>
      </div>

      <TransactionStats transactions={filteredTransactions} />

      <TransactionFilters
        search={filters.search}
        status={filters.status}
        currency={filters.currency}
        type={filters.type}
        onSearchChange={(value) => setFilters({ ...filters, search: value })}
        onStatusChange={(value) => setFilters({ ...filters, status: value })}
        onCurrencyChange={(value) => setFilters({ ...filters, currency: value })}
        onTypeChange={(value) => setFilters({ ...filters, type: value })}
        onClearFilters={handleClearFilters}
      />

      <TransactionList
        transactions={filteredTransactions}
        onSelectTransaction={handleSelectTransaction}
        onFlagTransaction={handleFlagTransaction}
        formatAmount={formatAmount}
      />

      <FlagTransactionDialog
        open={flagOpen}
        onOpenChange={setFlagOpen}
        transaction={selectedTx}
        reason={flagReason}
        onReasonChange={setFlagReason}
        onFlag={handleFlagConfirm}
      />
    </div>
  );
}
