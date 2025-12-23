// app/(dashboard)/transactions/page.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { FlagTransactionDialog } from '@/components/transactions/FlagTransactionDialog';
import { TransactionStats } from '@/components/transactions/TransactionStats';
import { MOCK_TRANSACTIONS } from '@/components/transactions/constants';
import { type Transaction } from '@/components/transactions/types';

export default function TransactionMonitoringPage() {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    currency: 'all',
  });
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [flagOpen, setFlagOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const filteredTransactions = useMemo(() => {
    return MOCK_TRANSACTIONS.filter((tx: { id: string; customer: string; merchant: string; status: string; currency: string; }) => {
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

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Transaction Monitoring</h1>
        <p className="mt-2 text-muted-foreground">
          Monitor and review transactions for suspicious activity
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