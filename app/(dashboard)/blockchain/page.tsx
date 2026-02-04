// app/(dashboard)/blockchain/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { BlockchainHeader, NetworkStatus } from '@/components/blockchain/Header';
import { BlockTable } from '@/components/blockchain/BlockTable';
import { WalletTable } from '@/components/blockchain/WalletTable';
import { SearchSection } from '@/components/blockchain/SearchSection';
import { VerificationSection } from '@/components/blockchain/VerificationSection';
import {
  getBlockchainNetworks,
  getBlockchainTransactions,
  getWalletAddresses,
  type BlockchainNetwork,
  type BlockchainTransaction,
  type WalletAddress,
} from '@/lib/api';
import { useSession } from '@/hooks/useSession';

export default function BlockchainPage() {
  const { isAuthenticated, isLoading: sessionLoading } = useSession();
  const [searchResult, setSearchResult] = useState<any>(null);
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
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
  };

  const fetchWallets = async () => {
    try {
      const offset = (walletPage - 1) * walletLimit;
      const walletsRes = await getWalletAddresses(walletLimit, offset);
      
      if (walletsRes.data?.addresses) {
        setWallets(walletsRes.data.addresses);
        setWalletTotal(walletsRes.data.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch wallets", err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [txPage]);

  useEffect(() => {
    fetchWallets();
  }, [walletPage]);

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
      } catch (err: any) {
        console.error('Failed to fetch blockchain data:', err);
        setError(err?.message || 'Failed to load blockchain data');
      } finally {
        setLoading(false);
      }
    };

    fetchBlockchainData();
  }, [sessionLoading, isAuthenticated]);

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

  // Calculate current height from latest network or transaction
  const currentHeight = networks[0]?.height || transactions[0]?.block_number || 0;
  
  // Calculate last update time
  const getLastUpdateTime = () => {
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

  // Map transactions to blocks format for BlockTable
  const blocks = transactions.map((tx, index) => ({
    blockNumber: tx.block_number || index + 1,
    blockHash: `hash_${tx.block_number || index + 1}`,
    dataHash: `data_${tx.block_number || index + 1}`,
    timestamp: tx.timestamp,
    txCount: transactions.filter(t => t.block_number === tx.block_number).length || 1,
    channelId: tx.channel || 'main',
  })).sort((a, b) => b.blockNumber - a.blockNumber);

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
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <SearchSection 
            onSearch={handleSearch} 
            isSearching={isSearching}
            error={searchError}
            result={searchResult}
          />
          <BlockTable 
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
          />
        </div>
        
        <div className="space-y-8">
          <VerificationSection />
        </div>
      </div>
    </div>
  );
}