import { apiFetch } from '@/lib/api';
import { SecurityEvent, BlocklistEntry, SystemHealthMetric } from '@/components/security/types';

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
  }
};
