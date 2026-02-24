// app/(dashboard)/transactions/page.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { FlagTransactionDialog } from '@/components/transactions/FlagTransactionDialog';
import { TransactionStats } from '@/components/transactions/TransactionStats';
import { type Transaction } from '@/components/transactions/types';
import { getTransactions, flagTransaction, type Transaction as ApiTransaction } from '@/lib/api';
import { useSession } from '@/hooks/useSession';
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type MoneyField = number | string | { amount?: number | string; currency?: string };

type ExtendedApiTransaction = ApiTransaction & {
  amount?: MoneyField;
  fee?: MoneyField;
  net_amount?: MoneyField;
  sender_wallet_number?: string;
  receiver_wallet_number?: string;
  sender_user_type?: string;
  receiver_user_type?: string;
  timestamp?: string;
  blockchain_status?: string;
};

export default function TransactionMonitoringPage() {
  const { isAuthenticated, isLoading: sessionLoading } = useSession();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('tx') ?? '';

  const [filters, setFilters] = useState({
    search: initialSearch,
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

  const mapStatus = (status: string): 'Completed' | 'Pending' | 'Failed' => {
    const s = (status || '').toLowerCase();
    if (s.includes('completed') || s.includes('settled')) return 'Completed';
    if (s.includes('failed') || s.includes('error')) return 'Failed';
    return 'Pending';
  };

  useEffect(() => {
    if (sessionLoading || !isAuthenticated) {
      return;
    }

    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const offset = (page - 1) * limit;
        const response = await getTransactions(limit, offset, {
          status: filters.status !== 'all' ? filters.status : undefined,
          currency: filters.currency !== 'all' ? filters.currency : undefined,
        });

        if (response.error) {
          throw new Error(response.error);
        }

        const data = response.data;
        const txs = (data?.transactions || []) as ExtendedApiTransaction[];
        
        if (data?.total !== undefined) {
          setTotal(data.total);
        } else if (data?.count !== undefined) {
          setTotal(data.count); 
        }
        
        const mapped: Transaction[] = txs.map((t) => {
          const amountField = t.amount;
          const amt =
            typeof amountField === 'number' || typeof amountField === 'string'
              ? amountField
              : amountField?.amount;
          const cur =
            amountField && typeof amountField === 'object'
              ? amountField.currency
              : t.currency;

          const feeField = t.fee;
          const feeAmtRaw =
            typeof feeField === 'number' || typeof feeField === 'string'
              ? feeField
              : feeField?.amount;

          const netField = t.net_amount;
          const netAmtRaw =
            typeof netField === 'number' || typeof netField === 'string'
              ? netField
              : netField?.amount;
          
          const senderId = String(t.sender_id || '').trim();
          const receiverId = String(t.receiver_id || '').trim();
          const fallbackSender = senderId ? `User-${senderId.slice(0, 8)}` : 'Unknown';
          const fallbackReceiver = receiverId ? `User-${receiverId.slice(0, 8)}` : 'Unknown';
          
          const txType = String(t.transaction_type || '').toLowerCase();
          const dir: 'sent' | 'received' =
            txType === 'deposit' ? 'received' : 'sent';
          
          const senderWalletNumber =
            t.sender_wallet_number ||
            (senderId
              ? `VS-${senderId.slice(0, 8)}-${String(cur || '').toUpperCase()}`
              : undefined);
          const receiverWalletNumber =
            t.receiver_wallet_number ||
            (receiverId
              ? `VS-${receiverId.slice(0, 8)}-${String(cur || '').toUpperCase()}`
              : undefined);
          
          const amountNum = parseFloat(String(amt || 0));
          const highThreshold = cur === 'MWK' ? 1000000 : 10000;
          const mediumThreshold = cur === 'MWK' ? 100000 : 1000;
          const riskLevel: 'Low' | 'Medium' | 'High' =
            amountNum >= highThreshold ? 'High' :
            amountNum >= mediumThreshold ? 'Medium' : 'Low';
          const riskScore = riskLevel === 'High' ? 90 : riskLevel === 'Medium' ? 50 : 10;
          
          const blockchainStatusRaw = t.blockchain_status;
          let blockchainStatus: 'confirmed' | 'pending' | 'failed' | 'none' | undefined;
          if (blockchainStatusRaw) {
            const b = blockchainStatusRaw.toLowerCase();
            if (b === 'confirmed') blockchainStatus = 'confirmed';
            else if (b === 'failed') blockchainStatus = 'failed';
            else if (b === 'pending') blockchainStatus = 'pending';
            else blockchainStatus = 'none';
          }

          return {
            id: t.id || t.transaction_id || '',
            customer: t.sender_name || t.sender_email || fallbackSender,
            merchant: t.receiver_name || t.receiver_email || fallbackReceiver,
            senderType:
              String(t.sender_user_type || '').toLowerCase() || undefined,
            receiverType:
              String(t.receiver_user_type || '').toLowerCase() || undefined,
            senderWalletNumber,
            receiverWalletNumber,
            riskLevel,
            riskScore,
            rawAmount: amountNum,
            feeAmount: feeAmtRaw !== undefined ? parseFloat(String(feeAmtRaw || 0)) : undefined,
            netAmount: netAmtRaw !== undefined ? parseFloat(String(netAmtRaw || 0)) : undefined,
            currency: cur || 'MWK',
            status: mapStatus(t.status),
            blockchainStatus,
            date: new Date(t.created_at || t.timestamp || Date.now()),
            flagged: t.flagged || false,
            transactionType: txType,
            direction: dir,
            reference: String(t.reference || ''),
          };
        });

        setTransactions(mapped);
      } catch (err: unknown) {
        console.error('Failed to fetch transactions:', err);
        const message =
          err instanceof Error ? err.message : 'Failed to load transactions';
        setError(message);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [sessionLoading, isAuthenticated, page, limit, filters]);

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

  const handleFlagConfirm = async () => {
    if (selectedTx && flagReason.trim()) {
      try {
        await flagTransaction(selectedTx.id, flagReason);
        // Update the local state to reflect the flagged status
        setTransactions(prev => prev.map(t => 
          t.id === selectedTx.id ? { ...t, flagged: true } : t
        ));
        toast.success(`Transaction ${selectedTx.id} has been flagged.`);
      } catch (err) {
        console.error('Failed to flag transaction:', err);
        toast.error('Failed to flag transaction');
      }
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

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-xl bg-muted/40 p-1.5 border border-border/40">
          <TabsTrigger
            value="overview"
            className="px-4 sm:px-6 rounded-lg data-[state=active]:bg-background data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm text-xs sm:text-sm font-semibold"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="filters"
            className="px-4 sm:px-6 rounded-lg data-[state=active]:bg-background data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm text-xs sm:text-sm font-semibold"
          >
            Filters
          </TabsTrigger>
          <TabsTrigger
            value="flagged"
            className="px-4 sm:px-6 rounded-lg data-[state=active]:bg-background data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm text-xs sm:text-sm font-semibold"
          >
            Flagging
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <TransactionStats transactions={filteredTransactions} />

          <TransactionList
            transactions={filteredTransactions}
            onSelectTransaction={handleSelectTransaction}
            onFlagTransaction={handleFlagTransaction}
            formatAmount={formatAmount}
          />

          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) setPage((p) => p - 1);
                    }}
                    className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>

                <PaginationItem>
                  <PaginationLink href="#" onClick={(e) => e.preventDefault()} isActive>
                    {page}
                  </PaginationLink>
                </PaginationItem>

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page * limit < total) setPage((p) => p + 1);
                    }}
                    className={page * limit >= total ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <div className="text-center text-sm text-muted-foreground mt-2">
              Showing {Math.min(total, (page - 1) * limit + 1)} to {Math.min(total, page * limit)} of {total} results
            </div>
          </div>
        </TabsContent>

        <TabsContent value="filters" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="flagged" className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Select a transaction from the overview tab to flag it for compliance review. Use the dialog
            below to record why the transaction is suspicious.
          </p>
        </TabsContent>
      </Tabs>

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
