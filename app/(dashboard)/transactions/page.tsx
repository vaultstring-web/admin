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
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [total, setTotal] = useState(0);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (sessionLoading || !isAuthenticated) {
      return;
    }

    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const offset = (page - 1) * limit;
        const res = await fetch(`${API_BASE}/admin/transactions?limit=${limit}&offset=${offset}`, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        
        if (!res.ok) {
          throw new Error('Failed to fetch transactions');
        }

        const data = await res.json();
        const txs = Array.isArray(data.transactions) ? data.transactions : [];
        
        if (typeof data.total === 'number') {
          setTotal(data.total);
        } else if (typeof data.count === 'number') {
           setTotal(data.count); 
        }
        
        const mapped: Transaction[] = txs.map((t: any) => {
          const amt = t.amount && typeof t.amount === 'object' ? t.amount.amount : t.amount;
          const cur = t.amount && typeof t.amount === 'object' ? t.amount.currency : t.currency;
          const feeAmtRaw = t.fee && typeof t.fee === 'object' ? t.fee.amount : t.fee;
          const netAmtRaw = t.net_amount && typeof t.net_amount === 'object' ? t.net_amount.amount : t.net_amount;
          const senderId = String(t.sender_id || t.senderId || '').trim();
          const receiverId = String(t.receiver_id || t.receiverId || '').trim();
          const fallbackSender = senderId ? `User-${senderId.slice(0, 8)}` : 'Unknown';
          const fallbackReceiver = receiverId ? `User-${receiverId.slice(0, 8)}` : 'Unknown';
          const txType = String(t.transaction_type || '').toLowerCase();
          const dir: 'sent' | 'received' =
            txType === 'deposit' ? 'received' : 'sent';
          
          const senderWalletNumber = t.sender_wallet_number || (senderId ? `VS-${senderId.slice(0, 8)}-${String(cur || '').toUpperCase()}` : undefined);
          const receiverWalletNumber = t.receiver_wallet_number || (receiverId ? `VS-${receiverId.slice(0, 8)}-${String(cur || '').toUpperCase()}` : undefined);
          
          const amountNum = parseFloat(amt || 0);
          const highThreshold = cur === 'MWK' ? 1000000 : 10000;
          const mediumThreshold = cur === 'MWK' ? 100000 : 1000;
          const riskLevel: 'Low' | 'Medium' | 'High' =
            amountNum >= highThreshold ? 'High' :
            amountNum >= mediumThreshold ? 'Medium' : 'Low';
          const riskScore = riskLevel === 'High' ? 90 : riskLevel === 'Medium' ? 50 : 10;
          return {
            id: t.id || t.transaction_id || '',
            customer: t.sender_name || t.sender_email || fallbackSender,
            merchant: t.receiver_name || t.receiver_email || fallbackReceiver,
            senderType: String(t.sender_user_type || '').toLowerCase() || undefined,
            receiverType: String(t.receiver_user_type || '').toLowerCase() || undefined,
            senderWalletNumber,
            receiverWalletNumber,
            riskLevel,
            riskScore,
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
  }, [sessionLoading, isAuthenticated, page, limit]);

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
        tx.merchant.toLowerCase().includes(filters.search.toLowerCase()) ||
        (tx.senderWalletNumber?.toLowerCase() || '').includes(filters.search.toLowerCase()) ||
        (tx.receiverWalletNumber?.toLowerCase() || '').includes(filters.search.toLowerCase());
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
      type: 'all',
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

      {/* Pagination Controls */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page * limit >= total || loading}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing <span className="font-medium">{Math.min(total, (page - 1) * limit + 1)}</span> to <span className="font-medium">{Math.min(total, page * limit)}</span> of{' '}
              <span className="font-medium">{total}</span> results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 dark:ring-gray-600 dark:hover:bg-gray-700"
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                disabled
                className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-offset-0 dark:text-white dark:ring-gray-600"
              >
                {page}
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * limit >= total || loading}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 dark:ring-gray-600 dark:hover:bg-gray-700"
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>

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
