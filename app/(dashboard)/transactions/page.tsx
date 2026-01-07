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
        
        // Map backend transactions to frontend format
        const mapped: Transaction[] = txs.map((t: any) => {
          const amt = t.amount && typeof t.amount === 'object' ? t.amount.amount : t.amount;
          const cur = t.amount && typeof t.amount === 'object' ? t.amount.currency : t.currency;
          const senderId = String(t.sender_id || t.senderId || '').trim();
          const receiverId = String(t.receiver_id || t.receiverId || '').trim();
          const fallbackSender = senderId ? `User-${senderId.slice(0, 8)}` : 'Unknown';
          const fallbackReceiver = receiverId ? `User-${receiverId.slice(0, 8)}` : 'Unknown';
          return {
            id: t.id || t.transaction_id || '',
            customer: t.sender_name || t.sender_email || fallbackSender,
            merchant: t.receiver_name || t.receiver_email || fallbackReceiver,
            senderType: String(t.sender_user_type || '').toLowerCase() || undefined,
            receiverType: String(t.receiver_user_type || '').toLowerCase() || undefined,
            rawAmount: parseFloat(amt || 0),
            currency: cur || 'MWK',
            status: mapStatus(t.status),
            date: new Date(t.created_at || t.timestamp || Date.now()),
            flagged: t.flagged || false,
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
      return matchesSearch && matchesStatus && matchesCurrency;
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
        onSearchChange={(value) => setFilters({ ...filters, search: value })}
        onStatusChange={(value) => setFilters({ ...filters, status: value })}
        onCurrencyChange={(value) => setFilters({ ...filters, currency: value })}
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
