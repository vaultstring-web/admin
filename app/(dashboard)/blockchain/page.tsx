// app/(dashboard)/blockchain/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { BlockchainHeader, NetworkStatus } from '@/components/blockchain/Header';
import { BlockchainNetworkList } from '@/components/blockchain/BlockchainNetworkList';
import { TransactionTable } from '@/components/blockchain/TransactionTable';
import { WalletTable } from '@/components/blockchain/WalletTable';
import { SearchSection } from '@/components/blockchain/SearchSection';
import { VerificationSection, VerificationProtocolPanel } from '@/components/blockchain/VerificationSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getBlockchainNetworks,
  getBlockchainTransactions,
  getWalletAddresses,
  getWalletTransactions,
  addBlockchainNetwork,
  updateBlockchainNetwork,
  deleteBlockchainNetwork,
  type BlockchainNetwork,
  type BlockchainTransaction,
  type WalletAddress,
  type Transaction,
} from '@/lib/api';
import { useSession } from '@/hooks/useSession';

type SearchResult = {
  txId: string;
  blockNumber: number;
  creatorMsp: string;
  status: string;
  timestamp: string;
  chaincode: string;
  channel: string;
  payload?: {
    blockHash: string;
    dataHash: string;
    transactionCount: number;
    channel: string;
  };
};

type NetworkFormData = {
  name: string;
  type: 'public' | 'testnet' | 'private';
  rpcUrl: string;
  chainId: string;
  symbol: string;
};

export default function BlockchainPage() {
  const { isAuthenticated, isLoading: sessionLoading } = useSession();
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [searchError, setSearchError] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [networks, setNetworks] = useState<BlockchainNetwork[]>([]);
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [txPage, setTxPage] = useState(1);
  const [txTotal, setTxTotal] = useState(0);
  const txLimit = 10;

  const [wallets, setWallets] = useState<WalletAddress[]>([]);
  const [walletPage, setWalletPage] = useState(1);
  const [walletTotal, setWalletTotal] = useState(0);
  const walletLimit = 10;

  const [selectedWallet, setSelectedWallet] = useState<WalletAddress | null>(null);
  const [walletTransactions, setWalletTransactions] = useState<Transaction[]>([]);
  const [walletTxPage, setWalletTxPage] = useState(1);
  const [walletTxTotal, setWalletTxTotal] = useState(0);
  const walletTxLimit = 10;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      const offset = (txPage - 1) * txLimit;
      const txsRes = await getBlockchainTransactions(txLimit, offset);
      
      if (txsRes.data?.transactions) {
        setTransactions(txsRes.data.transactions);
        setTxTotal(txsRes.data.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch blockchain transactions", err);
    }
  }, [txPage]);

  const fetchWallets = useCallback(async () => {
    try {
      const offset = (walletPage - 1) * walletLimit;
      const walletsRes = await getWalletAddresses(walletLimit, offset);
      
      if (walletsRes.data?.addresses) {
        const normalized = walletsRes.data.addresses.map((w) => ({
          ...w,
          address: w.address ?? w.wallet_address ?? '',
          network: w.network ?? 'local-ledger',
        }));
        setWallets(normalized);
        setWalletTotal(walletsRes.data.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch wallets", err);
    }
  }, [walletPage]);

  const fetchWalletTransactions = useCallback(async () => {
    if (!selectedWallet) return;
    try {
      const offset = (walletTxPage - 1) * walletTxLimit;
      const res = await getWalletTransactions(selectedWallet.id, walletTxLimit, offset);
      if (res.data?.transactions) {
        setWalletTransactions(res.data.transactions);
        setWalletTxTotal(res.data.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch wallet transactions", err);
    }
  }, [selectedWallet, walletTxPage]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  useEffect(() => {
    if (selectedWallet) {
      fetchWalletTransactions();
    }
  }, [selectedWallet, fetchWalletTransactions]);

  useEffect(() => {
    if (sessionLoading || !isAuthenticated) {
      return;
    }

    const fetchBlockchainData = async () => {
      setLoading(true);
      setError(null);

      try {
        await Promise.all([
          fetchTransactions(),
          fetchWallets(),
          getBlockchainNetworks().then(res => {
            if (res.data?.networks) {
              setNetworks(res.data.networks);
            }
          })
        ]);
      } catch (err: unknown) {
        console.error('Failed to fetch blockchain data:', err);
        const message =
          err instanceof Error ? err.message : 'Failed to load blockchain data';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlockchainData();
  }, [sessionLoading, isAuthenticated, fetchTransactions, fetchWallets]);

  const handleAddNetwork = async (network: NetworkFormData) => {
    try {
      const response = await addBlockchainNetwork({
        name: network.name,
        channel: network.type === 'private' ? 'default' : 'public',
        rpc_url: network.rpcUrl,
        chain_id: network.chainId,
        symbol: network.symbol,
      });
      
      if (response.data) {
         setNetworks(prev => [...prev, response.data!]);
      } else {
         throw new Error(response.error || 'Failed to add network');
      }
    } catch (err) {
      console.error('Failed to add network:', err);
      throw err; 
    }
  };

  const handleUpdateNetwork = async (id: string, network: NetworkFormData) => {
    try {
      const response = await updateBlockchainNetwork(id, {
           name: network.name,
           channel: network.type === 'private' ? 'default' : 'public',
           rpc_url: network.rpcUrl,
           chain_id: network.chainId,
           symbol: network.symbol,
      });
      
      if (response.data) {
           setNetworks(prev => prev.map(n => n.network_id === id ? response.data! : n));
      } else {
           throw new Error(response.error || 'Failed to update network');
      }
    } catch (err) {
      console.error('Failed to update network:', err);
      throw err;
    }
  };

  const handleDeleteNetwork = async (id: string) => {
    try {
      const response = await deleteBlockchainNetwork(id);
      if (response.error) {
        throw new Error(response.error);
      }
      setNetworks(prev => prev.filter(n => n.network_id !== id));
    } catch (err) {
       console.error('Failed to delete network:', err);
       throw err;
    }
  };

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setSearchError('');
    setSearchResult(null);

    try {
      // Check if query is a block number
      const blockNumber = parseInt(query);
      if (!isNaN(blockNumber)) {
        // Search in transactions for block number
        const foundTx = transactions.find(tx => tx.block_number === blockNumber);
        if (foundTx) {
          setSearchResult({
            txId: foundTx.tx_id,
            blockNumber: foundTx.block_number,
            creatorMsp: 'System',
            status: foundTx.status,
            timestamp: foundTx.timestamp,
            chaincode: foundTx.chaincode || 'system',
            channel: foundTx.channel || 'main',
            payload: {
              blockHash: `hash_${foundTx.block_number}`,
              dataHash: `data_${foundTx.block_number}`,
              transactionCount: transactions.filter(t => t.block_number === blockNumber).length,
              channel: foundTx.channel || 'main',
            }
          });
        } else {
          setSearchError(`Block #${blockNumber} not found.`);
        }
        return;
      }

      // Check if query is a transaction ID
      if (query.toLowerCase().includes('tx_') || query.toLowerCase().includes('0x') || query.length > 20) {
        const foundTx = transactions.find(tx => 
          tx.tx_id.toLowerCase() === query.toLowerCase() ||
          tx.tx_id.toLowerCase().includes(query.toLowerCase())
        );
        
        if (foundTx) {
          setSearchResult({
            txId: foundTx.tx_id,
            blockNumber: foundTx.block_number,
            creatorMsp: 'System',
            status: foundTx.status,
            timestamp: foundTx.timestamp,
            chaincode: foundTx.chaincode || 'system',
            channel: foundTx.channel || 'main',
          });
        } else {
          setSearchError('Transaction not found. Please check the ID and try again.');
        }
        return;
      }

      // Default error
      setSearchError('Please enter a valid block number or transaction ID');
    } catch (error) {
      setSearchError('An error occurred during the search. Please try again.');
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const walletTxTotalPages = Math.ceil(walletTxTotal / walletTxLimit || 1);

  // Calculate current height from latest network or transaction
  const currentHeight = networks[0]?.height || transactions[0]?.block_number || 0;
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate last update time
  const getLastUpdateTime = () => {
    if (!mounted) return 'Loading...';
    
    const latestNetwork = networks[0];
    if (!latestNetwork?.last_block_time) return '2 minutes ago';
    
    const blockTime = new Date(latestNetwork.last_block_time);
    const now = new Date();
    const diffMs = now.getTime() - blockTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  if (sessionLoading || loading) {
    return (
      <div className="p-6 space-y-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#448a33] mb-4"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading blockchain data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-8">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 font-medium">Error: {error}</p>
        </div>
      </div>
    );
  }

  const networkStatus = networks[0]?.status === 'healthy' 
    ? NetworkStatus.HEALTHY 
    : networks[0]?.status === 'degraded'
    ? NetworkStatus.DEGRADED
    : NetworkStatus.OFFLINE;

  return (
    <div className="p-6 space-y-8">
      <BlockchainHeader
        status={networkStatus}
        height={currentHeight}
        peerCount={networks[0]?.peer_count || 4}
        lastUpdate={getLastUpdateTime()}
      />

      <Tabs defaultValue="explorer" className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-xl bg-muted/40 p-1.5 border border-border/40">
            <TabsTrigger
              value="explorer"
              className="px-4 sm:px-6 rounded-lg data-[state=active]:bg-background data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm text-xs sm:text-sm font-semibold"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="integrity"
              className="px-4 sm:px-6 rounded-lg data-[state=active]:bg-background data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm text-xs sm:text-sm font-semibold"
            >
              Integrity audit
            </TabsTrigger>
            <TabsTrigger
              value="protocol"
              className="px-4 sm:px-6 rounded-lg data-[state=active]:bg-background data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm text-xs sm:text-sm font-semibold"
            >
              Verification protocol
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="explorer" className="space-y-8">
          <BlockchainNetworkList
            networks={networks}
            onAddNetwork={handleAddNetwork}
            onUpdateNetwork={handleUpdateNetwork}
            onDeleteNetwork={handleDeleteNetwork}
          />

          <div className="space-y-8">
            <SearchSection
              onSearch={handleSearch}
              isLoading={isSearching}
              error={searchError}
              result={searchResult}
            />
            <TransactionTable
              transactions={transactions}
              page={txPage}
              total={txTotal}
              limit={txLimit}
              onPageChange={setTxPage}
            />
            <WalletTable
              wallets={wallets}
              page={walletPage}
              total={walletTotal}
              limit={walletLimit}
              onPageChange={setWalletPage}
              onWalletClick={(wallet) => {
                setSelectedWallet(wallet);
                setWalletTxPage(1);
              }}
            />

            {selectedWallet && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold text-slate-600 mb-2">
                  Wallet Activity –{' '}
                  {selectedWallet.address ||
                    selectedWallet.wallet_address ||
                    selectedWallet.id}
                </h2>
                <div className="overflow-x-auto rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
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
                          <td
                            colSpan={6}
                            className="px-3 py-4 text-center text-xs text-slate-500"
                          >
                            No transactions for this wallet
                          </td>
                        </tr>
                      ) : (
                        walletTransactions.map((tx) => {
                          const created = tx.created_at
                            ? new Date(tx.created_at)
                            : null;
                          const amount =
                            typeof tx.amount === 'object' && tx.amount !== null
                              ? (tx.amount as { amount?: string | number }).amount ?? ''
                              : tx.amount;
                          const currency =
                            typeof tx.amount === 'object' && tx.amount !== null
                              ? (tx.amount as { currency?: string }).currency ??
                                tx.currency
                              : tx.currency;
                          return (
                            <tr
                              key={tx.id}
                              className="border-t border-slate-100 dark:border-slate-800"
                            >
                              <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
                                {created ? created.toLocaleString() : '-'}
                              </td>
                              <td className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200">
                                {tx.transaction_type || 'payment'}
                              </td>
                              <td className="px-3 py-2 text-xs text-slate-600">
                                {tx.sender_id === (selectedWallet.user_id || '')
                                  ? 'Debit'
                                  : 'Credit'}
                              </td>
                              <td className="px-3 py-2 text-xs text-right font-mono text-slate-800 dark:text-slate-100">
                                {amount} {currency}
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
                  {walletTxTotal > walletTxLimit && (
                    <div className="flex items-center justify-between px-3 py-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                      <span>
                        Showing{' '}
                        {Math.min(walletTxLimit, walletTransactions.length)} of{' '}
                        {walletTxTotal} transactions
                      </span>
                      <div className="space-x-2">
                        <button
                          disabled={walletTxPage <= 1}
                          className={`px-2 py-1 rounded border text-xs ${
                            walletTxPage <= 1
                              ? 'opacity-40 cursor-default border-slate-200'
                              : 'border-slate-300 hover:bg-slate-50'
                          }`}
                          onClick={() =>
                            walletTxPage > 1 &&
                            setWalletTxPage(walletTxPage - 1)
                          }
                        >
                          Prev
                        </button>
                        <span className="font-mono">
                          {walletTxPage}/{walletTxTotalPages || 1}
                        </span>
                        <button
                          disabled={walletTxPage >= walletTxTotalPages}
                          className={`px-2 py-1 rounded border text-xs ${
                            walletTxPage >= walletTxTotalPages
                              ? 'opacity-40 cursor-default border-slate-200'
                              : 'border-slate-300 hover:bg-slate-50'
                          }`}
                          onClick={() =>
                            walletTxPage < walletTxTotalPages &&
                            setWalletTxPage(walletTxPage + 1)
                          }
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="integrity" className="space-y-8">
          <div className="max-w-5xl">
            <VerificationSection />
          </div>
        </TabsContent>

        <TabsContent value="protocol" className="space-y-8">
          <div className="max-w-3xl">
            <VerificationProtocolPanel />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
