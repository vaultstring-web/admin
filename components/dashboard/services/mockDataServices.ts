
import { DashboardData, TimeRange, Alert } from '../types';

const INITIAL_ALERTS: Alert[] = [
  {
    id: '1',
    severity: 'Critical',
    category: 'Transaction',
    message: 'High failure rate detected in MWK-CNY gateway',
    timestamp: new Date().toISOString(),
    isRead: false,
  },
  {
    id: '2',
    severity: 'Warning',
    category: 'Forex',
    message: 'Forex feed latency higher than usual (4.2s)',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    isRead: false,
  }
];

export const generateMockData = (range: TimeRange): DashboardData => {
  const multiplier = range === 'Today' ? 1 : range === '7d' ? 7 : 30;
  
  return {
    transactions: {
      current: 12450 * multiplier + Math.floor(Math.random() * 100),
      previous: 11800 * multiplier,
      trend: 5.5,
    },
    users: {
      customers: {
        current: 85200 + Math.floor(Math.random() * 50),
        previous: 82100,
        trend: 3.8,
      },
      merchants: {
        current: 4120 + Math.floor(Math.random() * 5),
        previous: 4050,
        trend: 1.7,
      }
    },
    volume: {
      mwk: {
        current: 1250000000 * multiplier + Math.random() * 1000000,
        previous: 1180000000 * multiplier,
        trend: 5.9,
      },
      cny: {
        current: 5000000 * multiplier + Math.random() * 5000,
        previous: 4720000 * multiplier,
        trend: 5.9,
      }
    },
    health: {
      uptime24h: 99.98,
      uptime30d: 99.95,
      avgLatencyMs: 142 + Math.random() * 20,
      errorRate: 0.04 + Math.random() * 0.02,
      processingLatencyMs: 850 + Math.random() * 100,
    },
    forex: {
      pair: 'MWK/CNY',
      rate: 0.00412,
      status: 'Live',
      lastUpdated: new Date().toISOString(),
      trend: Math.random() > 0.5 ? 'up' : 'down',
    },
    alerts: INITIAL_ALERTS,
    lastRefresh: new Date().toISOString(),
  };
};
