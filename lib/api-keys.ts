import { apiFetch, ApiResponse } from './api';

export interface APIKey {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  is_active: boolean;
  created_at: string;
  last_used_at?: string;
  expires_at?: string;
  revoked_at?: string;
  created_by?: string;
}

export interface CreateAPIKeyResponse {
  api_key: APIKey;
  secret: string;
}

export async function getAPIKeys(): Promise<ApiResponse<APIKey[]>> {
  return apiFetch<APIKey[]>('/admin/api-keys');
}

export async function createAPIKey(name: string, scopes: string[], expiryDays: number = 365): Promise<ApiResponse<CreateAPIKeyResponse>> {
  return apiFetch<CreateAPIKeyResponse>('/admin/api-keys', {
    method: 'POST',
    body: JSON.stringify({ name, scopes }),
  });
}

export async function revokeAPIKey(id: string): Promise<ApiResponse<{ status: string }>> {
  return apiFetch<{ status: string }>(`/admin/api-keys/${id}`, {
    method: 'DELETE',
  });
}
