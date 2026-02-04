export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';
export type SecurityStatus = 'open' | 'investigating' | 'resolved' | 'false_positive';
export type SecurityEventType = 
  | 'brute_force_attempt' 
  | 'suspicious_ip' 
  | 'velocity_limit_exceeded' 
  | 'admin_login_failed' 
  | 'multiple_failed_kyc' 
  | 'blacklisted_device_detected';

export interface SecurityEvent {
  id: string;
  event_type: SecurityEventType;
  severity: SecuritySeverity;
  user_id?: string;
  user_email?: string; // Enriched
  ip_address?: string;
  details: Record<string, any>;
  status: SecurityStatus;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

export interface SystemHealthMetric {
  metric: string;
  value: number | string;
  status: 'healthy' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
  change?: string;
}

export interface BlocklistEntry {
  id: string;
  type: 'ip' | 'email' | 'device' | 'wallet';
  value: string;
  reason: string;
  created_by?: string;
  created_at: string;
  expires_at?: string;
}
