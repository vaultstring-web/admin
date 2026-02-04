
import type { TransactionVolume } from '@/lib/api';

export type TimeRange = 'Today' | '7d' | '30d';

export interface KPIValue {
  current: number;
  previous: number;
  trend: number;
}

export interface VolumeData {
  mwk: KPIValue;
  cny: KPIValue;
  zmw: KPIValue;
}

export interface UserMetrics {
  customers: KPIValue;
  merchants: KPIValue;
}

export interface HealthMetrics {
  uptime24h: number;
  uptime30d: number;
  avgLatencyMs: number;
  errorRate: number;
  processingLatencyMs: number;
}

export interface ForexRate {
  pair: string;
  rate: number;
  status: 'Live' | 'Delayed' | 'Stale' | 'Unavailable';
  lastUpdated: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface Alert {
  id: string;
  severity: 'Critical' | 'Warning' | 'Info';
  category: 'Transaction' | 'Forex' | 'System' | 'Compliance';
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface DashboardData {
  transactions: KPIValue;
  users: UserMetrics;
  volume: VolumeData;
  volumeHistory?: TransactionVolume[];
  recentTransactions?: Transaction[];
  earnings: {
    total: number;
    currency: string;
    trend: number;
  };
  health: HealthMetrics;
  forex: ForexRate;
  alerts: Alert[];
  lastRefresh: string;
}
