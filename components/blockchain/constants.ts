
import { Block, Transaction } from './types';

export const MOCK_BLOCKS: Block[] = [
  {
    blockNumber: 42901,
    timestamp: '2023-10-27 14:30:05',
    txCount: 3,
    blockHash: '0x7e3a9c...1d2f',
    dataHash: '0x8f4b1d...5e6a',
    channelId: 'fintech-ledger-v1'
  },
  {
    blockNumber: 42900,
    timestamp: '2023-10-27 14:28:12',
    txCount: 1,
    blockHash: '0x2d1a3c...9b8c',
    dataHash: '0x5e2f1a...4d3c',
    channelId: 'fintech-ledger-v1'
  },
  {
    blockNumber: 42899,
    timestamp: '2023-10-27 14:25:55',
    txCount: 12,
    blockHash: '0x9c8b7a...6d5e',
    dataHash: '0x1a2b3c...4d5e',
    channelId: 'fintech-ledger-v1'
  },
  {
    blockNumber: 42898,
    timestamp: '2023-10-27 14:22:10',
    txCount: 2,
    blockHash: '0x4f3e2d...1a0b',
    dataHash: '0x9e8d7c...6b5a',
    channelId: 'fintech-ledger-v1'
  },
  {
    blockNumber: 42897,
    timestamp: '2023-10-27 14:18:45',
    txCount: 8,
    blockHash: '0xbd9c8b...7a6d',
    dataHash: '0x3e4f5a...6b7c',
    channelId: 'fintech-ledger-v1'
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    txId: 'tx_8f4b1d5e6a2c1b3d',
    blockNumber: 42901,
    creatorMsp: 'BankAMSP',
    status: 'VALID',
    timestamp: '2023-10-27 14:30:00',
    chaincode: 'payment-service:1.2.0',
    payload: {
      amount: 50000,
      currency: 'USD',
      sender: 'ACC-123',
      receiver: 'ACC-456'
    }
  }
];
