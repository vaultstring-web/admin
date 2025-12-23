// app/(dashboard)/blockchain/page.tsx
'use client';

import { useState } from 'react';
import { BlockchainHeader, NetworkStatus } from '@/components/blockchain/Header';
import { BlockTable } from '@/components/blockchain/BlockTable';
import { SearchSection } from '@/components/blockchain/SearchSection';
import { VerificationSection } from '@/components/blockchain/VerificationSection';
import { MOCK_BLOCKS, MOCK_TRANSACTIONS } from '@/components/blockchain/constants';

export default function BlockchainPage() {
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchError, setSearchError] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setSearchError('');
    setSearchResult(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Check if query is a block number
      const blockNumber = parseInt(query);
      if (!isNaN(blockNumber)) {
        const foundBlock = MOCK_BLOCKS.find(block => block.blockNumber === blockNumber);
        if (foundBlock) {
          setSearchResult({
            txId: `block_${foundBlock.blockNumber}`,
            blockNumber: foundBlock.blockNumber,
            creatorMsp: 'System',
            status: 'VALID',
            timestamp: foundBlock.timestamp,
            chaincode: 'system',
            channel: foundBlock.channelId,
            payload: {
              blockHash: foundBlock.blockHash,
              dataHash: foundBlock.dataHash,
              transactionCount: foundBlock.txCount,
              channel: foundBlock.channelId
            }
          });
        } else {
          setSearchError(`Block #${blockNumber} not found. Try a number between ${MOCK_BLOCKS[MOCK_BLOCKS.length-1].blockNumber} and ${MOCK_BLOCKS[0].blockNumber}`);
        }
        return;
      }

      // Check if query is a transaction ID
      if (query.toLowerCase().includes('tx_') || query.toLowerCase().includes('0x')) {
        const foundTx = MOCK_TRANSACTIONS.find(tx => 
          tx.txId.toLowerCase() === query.toLowerCase() ||
          tx.txId.toLowerCase().includes(query.toLowerCase())
        );
        
        if (foundTx) {
          setSearchResult(foundTx);
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

  // Calculate current height from latest block
  const currentHeight = MOCK_BLOCKS[0]?.blockNumber || 42901;
  
  // Calculate last update time
  const getLastUpdateTime = () => {
    const latestBlock = MOCK_BLOCKS[0];
    if (!latestBlock) return '2 minutes ago';
    
    const blockTime = new Date(latestBlock.timestamp);
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

  return (
    <div className="p-6 space-y-8">
      <BlockchainHeader
        status={NetworkStatus.HEALTHY}
        height={currentHeight}
        lastUpdate={getLastUpdateTime()}
        peerCount={4}
        channel="fintech-ledger-v1"
      />

      <div className="space-y-6">
        <SearchSection 
          onSearch={handleSearch}
          result={searchResult}
          error={searchError}
          isLoading={isSearching}
        />
        
        <BlockTable blocks={MOCK_BLOCKS} />
        
        <VerificationSection />
      </div>
    </div>
  );
}