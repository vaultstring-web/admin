// components/settings/types.ts
export interface SecuritySettings {
  jwtExpiryHours: number;
  refreshTokenExpiryDays: number;
  forceLogoutOnPasswordChange: boolean;
  minPasswordLength: number;
  requireUppercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  passwordExpiryDays: number;
  maxLoginAttempts: number;
  enableIpWhitelist: boolean;
  allowedIps: string[];
}

export interface ApiKey {
  id: string;
  name: string;
  service: 'bank' | 'forex' | 'sms' | 'payment';
  key: string;
  status: 'active' | 'inactive';
  created: string;
  lastUsed?: string;
  permissions: string[];
}

export interface ServiceStatus {
  id: string;
  name: string;
  description: string;
  status: 'operational' | 'degraded' | 'maintenance' | 'outage';
  enabled: boolean;
  lastUpdated: string;
  uptime: number;
}