'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from '@/hooks/useSession';
import { WalletTable } from '@/components/blockchain/WalletTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getWalletAddresses, getWalletTransactions, type WalletAddress, type Transaction } from '@/lib/api';
import { MonitoringLayout } from '@/components/monitoring/MonitoringLayout';
import { DetailDrawer } from '@/components/monitoring/DetailDrawer';

export default function ActiveWalletsPage() {
  const { isAuthenticated, isLoading: sessionLoading } = useSession();

  const [wallets, setWallets] = useState<WalletAddress[]>([]);
  const [walletPage, setWalletPage] = useState(1);
  const [walletTotal, setWalletTotal] = useState(0);
  const walletLimit = 10;

  const [selectedWallet, setSelectedWallet] = useState<WalletAddress | null>(null);
  const [walletTransactions, setWalletTransactions] = useState<Transaction[]>([]);
  const [walletTxPage, setWalletTxPage] = useState(1);
  const walletTxLimit = 10;

  const [q, setQ] = useState('');
  const [currency, setCurrency] = useState('');
  const [userId, setUserId] = useState('');

  const filters = useMemo(() => {
    return {
      q: q.trim() || undefined,
      currency: currency.trim() || undefined,
      user_id: userId.trim() || undefined,
    };
  }, [q, currency, userId]);

  const fetchWallets = useCallback(async (pageParam: number = walletPage) => {
    const offset = (pageParam - 1) * walletLimit;
    const walletsRes = await getWalletAddresses(walletLimit, offset, filters);
    if (walletsRes.data?.addresses) {
      const normalized = walletsRes.data.addresses.map((w) => ({
        ...w,
        address: w.address ?? w.wallet_address ?? '',
        network: w.network ?? 'local-ledger',
      }));
      setWallets(normalized);
      setWalletTotal(walletsRes.data.total || 0);
    } else {
      setWallets([]);
      setWalletTotal(0);
    }
  }, [walletLimit, walletPage, filters]);

  const fetchWalletTransactions = useCallback(async () => {
    if (!selectedWallet) return;
    const offset = (walletTxPage - 1) * walletTxLimit;
    const res = await getWalletTransactions(selectedWallet.id, walletTxLimit, offset);
    if (res.data?.transactions) {
      setWalletTransactions(res.data.transactions);
    } else {
      setWalletTransactions([]);
    }
  }, [selectedWallet, walletTxPage]);

  useEffect(() => {
    if (sessionLoading || !isAuthenticated) return;
    const t = setTimeout(() => {
      void fetchWallets(walletPage);
    }, 0);
    return () => clearTimeout(t);
  }, [sessionLoading, isAuthenticated, filters, fetchWallets, walletPage]);

  useEffect(() => {
    const t = setTimeout(() => {
      void fetchWalletTransactions();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchWalletTransactions]);

  return (
    <>
      <MonitoringLayout
        title="Active Wallets"
        subtitle="Filter wallets and drill into transaction history and suspicious patterns."
        filters={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setWalletPage(1);
                fetchWallets(1);
              }}
            >
              Refresh
            </Button>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="walletSearch">Address search</Label>
                  <Input
                    id="walletSearch"
                    placeholder="e.g. 1234 5678 or partial"
                    value={q}
                    onChange={(e) => {
                      setQ(e.target.value);
                      setWalletPage(1);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="walletCurrency">Currency</Label>
                  <Input
                    id="walletCurrency"
                    placeholder="MWK / CNY / ZMW"
                    value={currency}
                    onChange={(e) => {
                      setCurrency(e.target.value);
                      setWalletPage(1);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="walletUserId">User ID</Label>
                  <Input
                    id="walletUserId"
                    placeholder="UUID"
                    value={userId}
                    onChange={(e) => {
                      setUserId(e.target.value);
                      setWalletPage(1);
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </>
        }
      >
        <WalletTable
          wallets={wallets}
          page={walletPage}
          total={walletTotal}
          limit={walletLimit}
          onPageChange={(page) => {
            setWalletPage(page);
            fetchWallets(page);
          }}
          onWalletClick={(w) => {
            setSelectedWallet(w);
            setWalletTxPage(1);
          }}
        />
      </MonitoringLayout>

      <DetailDrawer
        open={!!selectedWallet}
        onOpenChange={(open) => {
          if (!open) setSelectedWallet(null);
        }}
        title={selectedWallet ? `Wallet ${selectedWallet.currency}` : 'Wallet drilldown'}
        description={selectedWallet?.address}
        widthClassName="sm:max-w-3xl"
      >
        {selectedWallet ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{selectedWallet.currency}</Badge>
              <Badge variant="secondary">{selectedWallet.network || 'local-ledger'}</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr>
                    <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider">
                      Direction
                    </th>
                    <th className="px-3 py-2 text-right text-[10px] font-black uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider">
                      Reference
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {walletTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-4 text-center text-xs text-slate-500">
                        No transactions for this wallet
                      </td>
                    </tr>
                  ) : (
                    walletTransactions.map((tx) => {
                      const created = tx.created_at ? new Date(tx.created_at) : null;
                      const amount =
                        typeof tx.amount === 'object' && tx.amount !== null
                          ? (tx.amount as { amount?: string | number }).amount ?? ''
                          : tx.amount;
                      const txCurrency =
                        typeof tx.amount === 'object' && tx.amount !== null
                          ? (tx.amount as { currency?: string }).currency ?? tx.currency
                          : tx.currency;
                      const direction =
                        tx.sender_id === (selectedWallet.user_id || '') ? 'Debit' : 'Credit';

                      return (
                        <tr key={tx.id} className="border-t border-slate-100 dark:border-slate-800">
                          <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
                            {created ? created.toLocaleString() : '-'}
                          </td>
                          <td className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200">
                            {tx.transaction_type || 'payment'}
                          </td>
                          <td className="px-3 py-2 text-xs text-slate-600">
                            {direction}
                          </td>
                          <td className="px-3 py-2 text-xs text-right font-mono text-slate-800 dark:text-slate-100">
                            {amount} {txCurrency}
                          </td>
                          <td className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                            {tx.status}
                          </td>
                          <td className="px-3 py-2 text-xs text-slate-600">
                            {tx.reference || '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </DetailDrawer>
    </>
  );
}

