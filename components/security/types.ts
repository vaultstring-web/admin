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
  details: Record<string, unknown>;
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

export interface RiskConfig {
  enable_circuit_breaker: boolean;
  max_daily_limit: number;
  high_value_threshold: number;
  max_velocity_per_hour: number;
  max_velocity_per_day: number;
  suspicious_location_alert: string;
  global_system_pause: boolean;
  admin_approval_threshold: number;
  restricted_countries: string[];
  enable_dispute_resolution: boolean;
}

export interface RiskStatus {
  global_system_pause: boolean;
  circuit_breaker_open: boolean;
  failure_count: number;
  last_failure?: string;
  threshold: number;
  reset_duration_seconds: number;
}

export interface RiskUsageMetrics {
  daily_volume: string;
  max_daily_limit: number;
  daily_usage_ratio: number;
  max_velocity_per_hour: number;
  max_velocity_per_day: number;
  global_system_pause: boolean;
  circuit_breaker_open: boolean;
  failure_count: number;
  threshold: number;
  cool_off_users: number;
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
