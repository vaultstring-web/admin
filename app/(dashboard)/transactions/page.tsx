// app/(dashboard)/transactions/page.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { FlagTransactionDialog } from '@/components/transactions/FlagTransactionDialog';
import { ReverseTransactionDialog } from '@/components/transactions/ReverseTransactionDialog';
import { TransactionStats } from '@/components/transactions/TransactionStats';
import { type Transaction } from '@/components/transactions/types';
import { createCase, getTransactions, flagTransaction, reverseTransaction, type Transaction as ApiTransaction } from '@/lib/api';
import { linkOrCreateCaseAndAppendNote } from '@/lib/caseLinking';
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
import { MonitoringLayout } from '@/components/monitoring/MonitoringLayout';
import { DetailDrawer } from '@/components/monitoring/DetailDrawer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { downloadCsv } from '@/lib/csv';

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
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [flagOpen, setFlagOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [reverseOpen, setReverseOpen] = useState(false);
  const [reverseReason, setReverseReason] = useState('');
  const [reversing, setReversing] = useState(false);
  const [caseOpen, setCaseOpen] = useState(false);
  const [caseTitle, setCaseTitle] = useState('');
  const [casePriority, setCasePriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [caseNote, setCaseNote] = useState('');
  const [creatingCase, setCreatingCase] = useState(false);
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
      const matchesFlagged = !flaggedOnly || !!tx.flagged;
      return matchesSearch && matchesStatus && matchesCurrency && matchesType && matchesFlagged;
    });
  }, [transactions, filters, flaggedOnly]);

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

  const handleOpenReverse = () => {
    if (!selectedTx) return;
    setReverseReason('Customer requested reversal');
    setReverseOpen(true);
  };

  const handleOpenCreateCase = () => {
    if (!selectedTx) return;
    setCaseTitle(`Transaction review: ${selectedTx.reference ?? selectedTx.id}`);
    setCasePriority('medium');
    setCaseNote('');
    setCaseOpen(true);
  };

  const handleCreateCaseConfirm = async () => {
    if (!selectedTx) return;
    if (!caseTitle.trim()) {
      toast.error('Case title is required');
      return;
    }
    setCreatingCase(true);
    try {
      const res = await createCase({
        title: caseTitle.trim(),
        description: `Created from transaction ${selectedTx.id}`,
        priority: casePriority,
        entity_type: 'transaction',
        entity_id: selectedTx.id,
        note: caseNote.trim() || undefined,
      });
      if (res.data?.id) {
        toast.success('Case created.');
        setCaseOpen(false);
      } else {
        toast.error('Failed to create case');
      }
    } catch (err) {
      console.error('Failed to create case:', err);
      toast.error('Failed to create case');
    } finally {
      setCreatingCase(false);
    }
  };

  const handleReverseConfirm = async () => {
    if (!selectedTx || !reverseReason.trim()) return;
    setReversing(true);
    try {
      await reverseTransaction(selectedTx.id, reverseReason);
      await linkOrCreateCaseAndAppendNote({
        entityType: 'transaction',
        entityId: selectedTx.id,
        title: `Transaction reversal: ${selectedTx.reference || selectedTx.id}`,
        note: `Admin reversal executed.\n\nReason: ${reverseReason.trim()}`,
        priority: 'high',
      });
      setTransactions((prev) =>
        prev.map((t) => (t.id === selectedTx.id ? { ...t, status: 'reversed' } : t))
      );
      setSelectedTx((prev) => (prev ? { ...prev, status: 'reversed' } : prev));
      toast.success('Transaction reversed.');
      setReverseOpen(false);
    } catch (err) {
      console.error('Failed to reverse transaction:', err);
      toast.error('Failed to reverse transaction');
    } finally {
      setReversing(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      currency: 'all',
      type: 'all',
    });
    setFlaggedOnly(false);
  };

  const exportTransactionsCsv = () => {
    const rows = filteredTransactions.map((tx) => ({
      id: tx.id,
      reference: tx.reference ?? '',
      status: tx.status,
      currency: tx.currency,
      amount: tx.amount,
      fee: tx.fee,
      net_amount: tx.netAmount,
      direction: tx.direction,
      customer: tx.customer,
      merchant: tx.merchant,
      sender_wallet: tx.senderWalletNumber ?? '',
      receiver_wallet: tx.receiverWalletNumber ?? '',
      flagged: tx.flagged ? 'true' : 'false',
      timestamp: tx.timestamp,
    }))

    downloadCsv(
      rows,
      [
        { key: 'id', header: 'ID' },
        { key: 'reference', header: 'Reference' },
        { key: 'status', header: 'Status' },
        { key: 'currency', header: 'Currency' },
        { key: 'amount', header: 'Amount' },
        { key: 'fee', header: 'Fee' },
        { key: 'net_amount', header: 'Net amount' },
        { key: 'direction', header: 'Direction' },
        { key: 'customer', header: 'Customer' },
        { key: 'merchant', header: 'Merchant' },
        { key: 'sender_wallet', header: 'Sender wallet' },
        { key: 'receiver_wallet', header: 'Receiver wallet' },
        { key: 'flagged', header: 'Flagged' },
        { key: 'timestamp', header: 'Timestamp' },
      ],
      `transactions-${new Date().toISOString().slice(0, 10)}.csv`
    )
  }

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
    <>
      <MonitoringLayout
        title="Transaction Monitoring"
        subtitle={`Monitor and review transactions for suspicious activity • ${total} total`}
        filters={
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
            presets={[
              {
                id: 'preset-flagged',
                label: 'Flagged queue',
                onClick: () => {
                  setFilters({ search: '', status: 'all', currency: 'all', type: 'all' });
                  setFlaggedOnly(true);
                },
              },
              {
                id: 'preset-failed',
                label: 'Failed',
                onClick: () => {
                  setFlaggedOnly(false);
                  setFilters({ ...filters, status: 'Failed' });
                },
              },
              {
                id: 'preset-pending',
                label: 'Pending',
                onClick: () => {
                  setFlaggedOnly(false);
                  setFilters({ ...filters, status: 'Pending' });
                },
              },
              {
                id: 'preset-reversed',
                label: 'Reversed',
                onClick: () => {
                  setFlaggedOnly(false);
                  setFilters({ ...filters, search: 'reversed' });
                },
              },
            ]}
          />
        }
      >
        <div className="flex items-center justify-between gap-2">
          <TransactionStats transactions={filteredTransactions} />
          <Button variant="outline" size="sm" onClick={exportTransactionsCsv} disabled={filteredTransactions.length === 0}>
            Export CSV
          </Button>
        </div>

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
            Showing {Math.min(total, (page - 1) * limit + 1)} to {Math.min(total, page * limit)} of {total}{' '}
            results
          </div>
        </div>
      </MonitoringLayout>

      <DetailDrawer
        open={!!selectedTx}
        onOpenChange={(open) => {
          if (!open) setSelectedTx(null);
        }}
        title={selectedTx?.reference ? `Transaction ${selectedTx.reference}` : 'Transaction detail'}
        description="Compliance detail view with quick actions."
        widthClassName="sm:max-w-2xl"
      >
        {selectedTx ? (
          <div className="space-y-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">Summary</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-mono">{selectedTx.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-mono">{selectedTx.amount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Currency</span>
                  <span className="font-mono">{selectedTx.currency}</span>
                </div>
                <div className="pt-3 flex flex-wrap gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={String(selectedTx.status).toLowerCase() === 'reversed'}
                    onClick={handleOpenReverse}
                  >
                    Reverse transaction
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleOpenCreateCase}>
                    Create case
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">Raw payload</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs whitespace-pre-wrap wrap-break-word">{JSON.stringify(selectedTx, null, 2)}</pre>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </DetailDrawer>

      <FlagTransactionDialog
        open={flagOpen}
        onOpenChange={setFlagOpen}
        transaction={selectedTx}
        reason={flagReason}
        onReasonChange={setFlagReason}
        onFlag={handleFlagConfirm}
      />

      <ReverseTransactionDialog
        open={reverseOpen}
        onOpenChange={setReverseOpen}
        transaction={selectedTx}
        reason={reverseReason}
        onReasonChange={setReverseReason}
        onReverse={handleReverseConfirm}
        isReversing={reversing}
      />

      <Dialog open={caseOpen} onOpenChange={setCaseOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create case</DialogTitle>
            <DialogDescription>
              Create an investigation case linked to this transaction for bank-style support workflows.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="caseTitle">Title</Label>
              <Input
                id="caseTitle"
                value={caseTitle}
                onChange={(e) => setCaseTitle(e.target.value)}
                placeholder="Case title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="casePriority">Priority</Label>
              <Input
                id="casePriority"
                value={casePriority}
                onChange={(e) => setCasePriority(e.target.value as typeof casePriority)}
                placeholder="low / medium / high / critical"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="caseNote">Initial note (optional)</Label>
              <Textarea
                id="caseNote"
                value={caseNote}
                onChange={(e) => setCaseNote(e.target.value)}
                placeholder="e.g., Customer claims wrong recipient; requested reversal; verify receiver balance + settlement status."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCaseOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCaseConfirm} disabled={creatingCase || !caseTitle.trim()}>
              Create case
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
