import { SecurityEvent, SystemHealthMetric, BlocklistEntry } from './types';

export const MOCK_SECURITY_EVENTS: SecurityEvent[] = [
  {
    id: 'evt-001',
    event_type: 'brute_force_attempt',
    severity: 'high',
    user_email: 'attacker@example.com',
    ip_address: '192.168.1.105',
    details: { attempts: 15, timeframe: '30s' },
    status: 'open',
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
  },
  {
    id: 'evt-002',
    event_type: 'velocity_limit_exceeded',
    severity: 'medium',
    user_id: 'usr-123',
    user_email: 'john.doe@example.com',
    ip_address: '45.22.19.11',
    details: { amount: 500000, limit: 100000, currency: 'MWK' },
    status: 'investigating',
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
  },
  {
    id: 'evt-003',
    event_type: 'suspicious_ip',
    severity: 'critical',
    user_email: 'admin@vaultstring.com',
    ip_address: '89.10.11.12',
    details: { location: 'Unknown Region', user_agent: 'curl/7.64.1' },
    status: 'resolved',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    resolved_at: new Date().toISOString(),
    resolved_by: 'SuperAdmin',
  }
];

export const MOCK_SYSTEM_HEALTH: SystemHealthMetric[] = [
  { metric: 'API Latency', value: '45ms', status: 'healthy', trend: 'stable' },
  { metric: 'Error Rate', value: '0.02%', status: 'healthy', trend: 'down', change: '-0.01%' },
  { metric: 'Failed Logins (1h)', value: 24, status: 'warning', trend: 'up', change: '+12%' },
  { metric: 'Active Threats', value: 3, status: 'critical', trend: 'up' },
];

export const MOCK_BLOCKLIST: BlocklistEntry[] = [
  {
    id: 'blk-001',
    type: 'ip',
    value: '102.11.23.44',
    reason: 'DDOS Attempt',
    created_by: 'System Firewall',
    created_at: new Date().toISOString(),
  },
  {
    id: 'blk-002',
    type: 'email',
    value: 'fraud@badactor.com',
    reason: 'Confirmed Fraudster',
    created_by: 'Risk Team',
    created_at: new Date().toISOString(),
  }
];
