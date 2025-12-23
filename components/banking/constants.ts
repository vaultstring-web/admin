
import React from 'react';
import { 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  Activity, 
  ArrowUpRight, 
  ArrowDownLeft,
  Settings,
  RefreshCw,
  Search,
  Download,
  AlertTriangle,
  ChevronRight,
  Database,
  Briefcase
} from 'lucide-react';
import { BankIntegration, Corridor, HealthStatus, SettlementBatch, FailedTransaction } from './types';

export const COLORS = {
  success: '#448a33',
  info: '#3b5a65',
  warning: '#d97706',
  error: '#dc2626',
};

export const ICONS = {
  ShieldCheck,
  AlertCircle,
  Clock,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  Settings,
  RefreshCw,
  Search,
  Download,
  AlertTriangle,
  ChevronRight,
  Database,
  Briefcase
};

export const getStatusColor = (status: HealthStatus) => {
  switch (status) {
    case HealthStatus.HEALTHY: return 'text-primary bg-primary/10 border-primary/20 dark:bg-primary/20 dark:text-primary';
    case HealthStatus.WARNING: return 'text-semantic-warning-light bg-semantic-warning-light/5 border-semantic-warning-light/20 dark:bg-semantic-warning-dark/10 dark:text-semantic-warning-dark dark:border-semantic-warning-dark/20';
    case HealthStatus.ERROR: return 'text-destructive bg-destructive/5 border-destructive/20 dark:bg-destructive/10 dark:text-destructive dark:border-destructive/20';
  }
};


export const MOCK_INTEGRATIONS: BankIntegration[] = [
  {
    id: '1',
    name: 'Standard Bank MW',
    provider: 'Bank',
    corridor: Corridor.MALAWI,
    status: HealthStatus.HEALTHY,
    lastSync: '2m ago',
    availability: 99.9,
    endpoint: 'https://api.standardbank.mw/v1',
    lastChecked: '2024-05-20T14:30:00Z',
    latency: 120,
  },
  {
    id: '2',
    name: 'Airtel Money MW',
    provider: 'MoMo',
    corridor: Corridor.MALAWI,
    status: HealthStatus.HEALTHY,
    lastSync: '5m ago',
    availability: 98.4,
    endpoint: 'https://api.airtel.mw/v1',
    lastChecked: '2024-05-20T14:28:00Z',
    latency: 180,
  },
  {
    id: '3',
    name: 'TNM Mpamba MW',
    provider: 'MoMo',
    corridor: Corridor.MALAWI,
    status: HealthStatus.DEGRADED,
    lastSync: '12m ago',
    availability: 95.1,
    endpoint: 'https://api.tnmpamba.mw/v1',
    lastChecked: '2024-05-20T14:20:00Z',
    latency: 450,
  },
  {
    id: '4',
    name: 'ICBC China',
    provider: 'Bank',
    corridor: Corridor.CHINA,
    status: HealthStatus.HEALTHY,
    lastSync: '1m ago',
    availability: 100.0,
    endpoint: 'https://api.icbc.cn/v1',
    lastChecked: '2024-05-20T14:32:00Z',
    latency: 95,
  },
  {
    id: '5',
    name: 'Alipay Global',
    provider: 'MoMo',
    corridor: Corridor.CHINA,
    status: HealthStatus.HEALTHY,
    lastSync: '3m ago',
    availability: 99.8,
    endpoint: 'https://api.alipay.com/v1',
    lastChecked: '2024-05-20T14:30:00Z',
    latency: 110,
  },
  {
    id: '6',
    name: 'Bank of China',
    provider: 'Bank',
    corridor: Corridor.CHINA,
    status: HealthStatus.HEALTHY,
    lastSync: '2m ago',
    availability: 99.7,
    endpoint: 'https://api.boc.cn/v1',
    lastChecked: '2024-05-20T14:31:00Z',
    latency: 105,
  },
  {
    id: '7',
    name: 'Ecobank MW',
    provider: 'Bank',
    corridor: Corridor.MALAWI,
    status: HealthStatus.MAINTENANCE,
    lastSync: '1h ago',
    availability: 97.5,
    endpoint: 'https://api.ecobank.mw/v1',
    lastChecked: '2024-05-20T13:30:00Z',
    latency: 220,
  },
  {
    id: '8',
    name: 'WeChat Pay',
    provider: 'MoMo',
    corridor: Corridor.CHINA,
    status: HealthStatus.HEALTHY,
    lastSync: '4m ago',
    availability: 99.9,
    endpoint: 'https://api.wechatpay.com/v1',
    lastChecked: '2024-05-20T14:29:00Z',
    latency: 100,
  },
];

export const MOCK_SETTLEMENTS: SettlementBatch[] = [
  {
    id: 'BATCH-001',
    date: '2024-05-20',
    corridor: Corridor.CHINA,
    volume: 1250000.50,
    currency: 'CNY',
    status: 'Completed',
    transactionsCount: 245,
    processedAt: '2024-05-20T10:30:00Z',
  },
  {
    id: 'BATCH-002',
    date: '2024-05-20',
    corridor: Corridor.MALAWI,
    volume: 45000000,
    currency: 'MWK',
    status: 'Completed',
    transactionsCount: 189,
    processedAt: '2024-05-20T11:15:00Z',
  },
  {
    id: 'BATCH-003',
    date: '2024-05-19',
    corridor: Corridor.CHINA,
    volume: 890000,
    currency: 'CNY',
    status: 'Pending',
    transactionsCount: 156,
    processedAt: '2024-05-20T12:00:00Z',
  },
  {
    id: 'BATCH-004',
    date: '2024-05-19',
    corridor: Corridor.MALAWI,
    volume: 12000000,
    currency: 'MWK',
    status: 'Failed',
    transactionsCount: 78,
    processedAt: '2024-05-20T09:45:00Z',
  },
  {
    id: 'BATCH-005',
    date: '2024-05-18',
    corridor: Corridor.CHINA,
    volume: 2100000,
    currency: 'CNY',
    status: 'Completed',
    transactionsCount: 312,
    processedAt: '2024-05-18T16:20:00Z',
  },
  {
    id: 'BATCH-006',
    date: '2024-05-18',
    corridor: Corridor.MALAWI,
    volume: 68000000,
    currency: 'MWK',
    status: 'Completed',
    transactionsCount: 421,
    processedAt: '2024-05-18T15:10:00Z',
  },
  {
    id: 'BATCH-007',
    date: '2024-05-17',
    corridor: Corridor.CHINA,
    volume: 1560000,
    currency: 'CNY',
    status: 'Completed',
    transactionsCount: 278,
    processedAt: '2024-05-17T14:30:00Z',
  },
  {
    id: 'BATCH-008',
    date: '2024-05-17',
    corridor: Corridor.MALAWI,
    volume: 32000000,
    currency: 'MWK',
    status: 'Completed',
    transactionsCount: 195,
    processedAt: '2024-05-17T13:45:00Z',
  },
];

export const MOCK_FAILED_TRANSACTIONS: FailedTransaction[] = [
  {
    id: 'TX-982',
    ref: 'C2B-X892J',
    amount: 4500.00,
    currency: 'USD',
    type: 'Payout',
    category: 'Compliance',
    timestamp: '2024-05-20 14:22:01',
    diagnostic: 'Sanction list match - False Positive Investigation Required',
  },
  {
    id: 'TX-983',
    ref: 'B2B-P002K',
    amount: 12000.00,
    currency: 'CNY',
    type: 'Settlement',
    category: 'API Timeout',
    timestamp: '2024-05-20 13:05:45',
    diagnostic: 'Bank gateway timeout at ICBC end. Please retry.',
  },
  {
    id: 'TX-984',
    ref: 'C2B-X893M',
    amount: 850.50,
    currency: 'MWK',
    type: 'Payout',
    category: 'Insufficient Funds',
    timestamp: '2024-05-20 12:30:15',
    diagnostic: 'Merchant account balance insufficient for payout.',
  },
  {
    id: 'TX-985',
    ref: 'B2C-Z112L',
    amount: 2300.00,
    currency: 'USD',
    type: 'Refund',
    category: 'Customer Dispute',
    timestamp: '2024-05-20 11:45:22',
    diagnostic: 'Customer initiated dispute for unauthorized transaction.',
  },
  {
    id: 'TX-986',
    ref: 'B2B-P003N',
    amount: 18500.00,
    currency: 'CNY',
    type: 'Settlement',
    category: 'Currency Mismatch',
    timestamp: '2024-05-20 10:15:33',
    diagnostic: 'Settlement currency does not match transaction currency.',
  },
  {
    id: 'TX-987',
    ref: 'C2B-X894P',
    amount: 6200.00,
    currency: 'USD',
    type: 'Payout',
    category: 'KYC Verification',
    timestamp: '2024-05-20 09:30:18',
    diagnostic: 'Beneficiary KYC documents expired. Requires re-verification.',
  },
];

// Dashboard statistics
export const DASHBOARD_STATS = {
  activeIntegrations: MOCK_INTEGRATIONS.filter(i => 
    i.status === HealthStatus.HEALTHY || i.status === HealthStatus.DEGRADED
  ).length,
  settlementHealth: 98.5, // Percentage
  reconHealth: 99.2, // Percentage
  failedCount: MOCK_FAILED_TRANSACTIONS.length,
  totalVolume: MOCK_SETTLEMENTS
    .filter(s => s.status === 'Completed')
    .reduce((sum, s) => sum + s.volume, 0),
  totalTransactions: MOCK_SETTLEMENTS
    .filter(s => s.status === 'Completed')
    .reduce((sum, s) => sum + (s.transactionsCount || 0), 0),
  averageLatency: Math.round(
    MOCK_INTEGRATIONS
      .filter(i => i.latency)
      .reduce((sum, i) => sum + (i.latency || 0), 0) / 
    MOCK_INTEGRATIONS.filter(i => i.latency).length
  ),
};

// Helper functions
export const getIntegrationsByCorridor = (corridor: Corridor): BankIntegration[] => {
  return MOCK_INTEGRATIONS.filter(integration => integration.corridor === corridor);
};

export const getIntegrationsByStatus = (status: HealthStatus): BankIntegration[] => {
  return MOCK_INTEGRATIONS.filter(integration => integration.status === status);
};

export const getSettlementsByStatus = (status: string): SettlementBatch[] => {
  return MOCK_SETTLEMENTS.filter(settlement => settlement.status === status);
};

export const getSettlementsByCorridor = (corridor: Corridor): SettlementBatch[] => {
  return MOCK_SETTLEMENTS.filter(settlement => settlement.corridor === corridor);
};

export const getRecentSettlements = (count: number = 5): SettlementBatch[] => {
  return [...MOCK_SETTLEMENTS]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
};

export const getFailedTransactionsByCategory = (category: string): FailedTransaction[] => {
  return MOCK_FAILED_TRANSACTIONS.filter(transaction => transaction.category === category);
};

// Additional utility data
export const WEEKLY_VOLUME_DATA = [
  { name: 'Mon', volume: 4500000, currency: 'USD' },
  { name: 'Tue', volume: 3800000, currency: 'USD' },
  { name: 'Wed', volume: 5100000, currency: 'USD' },
  { name: 'Thu', volume: 4200000, currency: 'USD' },
  { name: 'Fri', volume: 5800000, currency: 'USD' },
  { name: 'Sat', volume: 2100000, currency: 'USD' },
  { name: 'Sun', volume: 1500000, currency: 'USD' },
];

export const RECONCILIATION_DATA = {
  matched: 9820,
  unmatched: 180,
  total: 10000,
  percentage: 98.2,
};

export const RECENT_DISCREPANCIES = [
  { id: 'REC-0012', description: 'MTN MW mismatch: $450.00', type: 'Warning' },
  { id: 'REC-0015', description: 'ICBC duplicate entry check', type: 'Info' },
  { id: 'REC-0018', description: 'Airtel Money reconciliation pending', type: 'Warning' },
  { id: 'REC-0021', description: 'WeChat Pay batch verification required', type: 'Info' },
];