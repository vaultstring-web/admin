// app/(dashboard)/blockchain/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { BlockchainHeader, NetworkStatus } from '@/components/blockchain/Header';
import { BlockTable } from '@/components/blockchain/BlockTable';
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
  const [wallets, setWallets] = useState<WalletAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionLoading || !isAuthenticated) {
      return;
    }

    const fetchBlockchainData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [networksRes, txsRes, walletsRes] = await Promise.all([
          getBlockchainNetworks(),
          getBlockchainTransactions(50, 0),
          getWalletAddresses(50, 0),
        ]);

        if (networksRes.data?.networks) {
          setNetworks(networksRes.data.networks);
        }

        if (txsRes.data?.transactions) {
          setTransactions(txsRes.data.transactions);
        }

        if (walletsRes.data?.addresses) {
          setWallets(walletsRes.data.addresses);
        }
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
        lastUpdate={getLastUpdateTime()}
        peerCount={networks[0]?.peer_count || 0}
        channel={networks[0]?.channel || 'fintech-ledger-v1'}
      />

      <div className="space-y-6">
        <SearchSection 
          onSearch={handleSearch}
          result={searchResult}
          error={searchError}
          isLoading={isSearching}
        />
        
        <BlockTable blocks={blocks.length > 0 ? blocks : []} />
        
        <VerificationSection />
      </div>
    </div>
  );
}