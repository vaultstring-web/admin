
export enum HealthStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning',
  ERROR = 'error',
  DEGRADED = 'Degraded',
  OFFLINE = 'Offline',
  MAINTENANCE = 'Maintenance',
}

export enum Corridor {
  MALAWI = 'MALAWI',
  CHINA = 'CHINA',
  EUROPE = 'EUROPE',
  USA = 'USA',
}

export interface BankIntegration {
  id: string;
  name: string;
  provider: string;
  corridor: Corridor;
  status: HealthStatus;
  lastSync: string;
  availability: number;
  endpoint?: string;
  lastChecked?: string;
  latency?: number;
}

export interface SettlementBatch {
  id: string;
  date: string;
  corridor: Corridor;
  volume: number;
  currency: string;
  status: 'Completed' | 'Pending' | 'Failed';
  transactionsCount?: number;
  processedAt?: string;
}

export interface FailedTransaction {
  id: string;
  ref: string;
  amount: number;
  currency: string;
  type: string;
  category: string;
  timestamp: string;
  diagnostic: string;
}

export interface ReconciliationStats {
  matched: number;
  unmatched: number;
  total: number;
  health: number;
}


