import { apiFetch } from '@/lib/api';
import { SecurityEvent, BlocklistEntry, SystemHealthMetric, RiskConfig, RiskStatus, RiskUsageMetrics } from '@/components/security/types';

export const SecurityService = {
  getEvents: async (limit = 10, offset = 0) => {
    return apiFetch<{ events: SecurityEvent[], total: number }>(`/admin/security/events?limit=${limit}&offset=${offset}`);
  },
  
  updateEventStatus: async (id: string, status: string) => {
    return apiFetch(`/admin/security/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  getBlocklist: async () => {
    return apiFetch<BlocklistEntry[]>('/admin/security/blocklist');
  },

  addToBlocklist: async (entry: Partial<BlocklistEntry>) => {
    return apiFetch<BlocklistEntry>('/admin/security/blocklist', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  },

  removeFromBlocklist: async (id: string) => {
    return apiFetch(`/admin/security/blocklist/${id}`, {
      method: 'DELETE',
    });
  },

  getSystemHealth: async () => {
    return apiFetch<SystemHealthMetric[]>('/admin/security/health');
  },

  getRiskConfig: async () => {
    return apiFetch<RiskConfig>('/admin/security/risk/config');
  },

  getRiskStatus: async () => {
    return apiFetch<RiskStatus>('/admin/security/risk/status');
  },

  updateRiskConfig: async (payload: Partial<RiskConfig> & { global_system_pause?: boolean }) => {
    return apiFetch<RiskStatus>('/admin/security/risk/config', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  getRiskUsageMetrics: async () => {
    return apiFetch<RiskUsageMetrics>('/admin/risk/metrics');
  }
};
