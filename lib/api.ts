// Centralized API service for admin operations
import { API_BASE } from './constants';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Get authentication token
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('vs_token');
}

// Check if we need to redirect to login
function checkAuthAndRedirect() {
  const token = getAuthToken();
  if (!token && typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

// Base fetch function with auth
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
      mode: 'cors', // Explicitly enable CORS
    });

    // Handle 401 Unauthorized - session expired
    // Only clear auth on explicit 401, not on other errors
    if (response.status === 401) {
      // Don't auto-redirect here - let the component handle it
      // This prevents immediate logout on temporary issues
      return {
        error: 'Session expired. Please login again.',
      };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return { data };
  } catch (error: any) {
    // Handle CORS and network errors more gracefully
    if (error.message?.includes('CORS') || error.message?.includes('Failed to fetch')) {
      return {
        error: 'Cannot connect to API gateway. Please ensure the backend services are running on port 9000.',
      };
    }
    return {
      error: error.message || 'Network error occurred',
    };
  }
}

// ============================================================================
// USER MANAGEMENT API
// ============================================================================

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  user_type?: string;
  is_active?: boolean;
  kyc_status?: string;
  risk_score?: number;
  country_code?: string;
  created_at: string;
  updated_at?: string;
}

export interface UsersResponse {
  users: User[];
  total?: number;
  limit?: number;
  offset?: number;
}

export async function getUsers(limit = 50, offset = 0): Promise<ApiResponse<UsersResponse>> {
  return apiFetch<UsersResponse>(`/admin/users?limit=${limit}&offset=${offset}`);
}

export async function getUserById(id: string): Promise<ApiResponse<User>> {
  return apiFetch<User>(`/admin/users/${id}`);
}

export async function updateUserStatus(
  id: string,
  isActive: boolean,
  reason?: string
): Promise<ApiResponse<{ message: string }>> {
  return apiFetch(`/admin/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: isActive, reason }),
  });
}

export async function updateKYCStatus(
  userId: string,
  status: string,
  reason?: string
): Promise<ApiResponse<{ message: string }>> {
  return apiFetch(`/admin/users/${userId}/kyc`, {
    method: 'PATCH',
    body: JSON.stringify({ kyc_status: status, reason }),
  });
}

export async function updateUserRole(
  userId: string,
  role: string,
  reason?: string
): Promise<ApiResponse<{ message: string }>> {
  return apiFetch(`/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ user_type: role, reason }),
  });
}

export interface AuditLog {
  id: string;
  action: string;
  admin_id?: string;
  user_id?: string;
  timestamp: string;
  reason?: string;
  details?: string;
}

export async function getUserActivity(
  userId: string,
  limit = 50,
  offset = 0
): Promise<ApiResponse<{ logs: AuditLog[]; total?: number }>> {
  return apiFetch<{ logs: AuditLog[]; total?: number }>(
    `/admin/users/${userId}/activity?limit=${limit}&offset=${offset}`
  );
}

export async function deleteUser(id: string, reason?: string): Promise<ApiResponse<{ message: string }>> {
  return apiFetch(`/admin/users/${id}`, {
    method: 'DELETE',
    body: JSON.stringify({ reason }),
  });
}

export async function updateUserProfile(
  id: string,
  updates: Partial<Pick<User, 'first_name' | 'last_name' | 'email' | 'phone' | 'country_code' >>
): Promise<ApiResponse<{ message: string }>> {
  return apiFetch(`/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

// ============================================================================
// TRANSACTION MANAGEMENT API
// ============================================================================

export interface Transaction {
  id: string;
  transaction_id?: string;
  sender_id: string;
  receiver_id: string;
  sender_name?: string;
  sender_email?: string;
  receiver_name?: string;
  receiver_email?: string;
  amount: string | number;
  currency: string;
  fee?: { amount: string | number; currency: string } | string | number;
  net_amount?: { amount: string | number; currency: string } | string | number;
  status: string;
  transaction_type?: string;
  status_reason?: string;
  reference?: string;
  created_at: string;
  updated_at?: string;
  flagged?: boolean;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  total?: number;
  limit?: number;
  offset?: number;
  count?: number;
}

export async function getTransactions(
  limit = 100,
  offset = 0,
  filters?: {
    status?: string;
    currency?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<ApiResponse<TransactionsResponse>> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });
  
  if (filters?.status) params.append('status', filters.status);
  if (filters?.currency) params.append('currency', filters.currency);
  if (filters?.startDate) params.append('start_date', filters.startDate);
  if (filters?.endDate) params.append('end_date', filters.endDate);

  return apiFetch<TransactionsResponse>(`/admin/transactions?${params.toString()}`);
}

export async function getTransactionById(id: string): Promise<ApiResponse<Transaction>> {
  return apiFetch<Transaction>(`/admin/transactions/${id}`);
}

export async function flagTransaction(
  id: string,
  reason: string
): Promise<ApiResponse<{ message: string }>> {
  return apiFetch(`/admin/transactions/${id}/flag`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

// ============================================================================
// BANKING & PAYMENT GATEWAY API
// ============================================================================

export interface BankAccount {
  id: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  currency: string;
  balance?: number;
  status: string;
  connected_at?: string;
}

export interface PaymentGateway {
  id: string;
  name: string;
  provider: string;
  status: string;
  api_key?: string;
  webhook_url?: string;
  last_sync?: string;
}

export interface Settlement {
  id: string;
  batch_id?: string;
  amount: number;
  currency: string;
  status: string;
  transaction_count: number;
  created_at: string;
  completed_at?: string;
}

export async function getBankAccounts(): Promise<ApiResponse<{ accounts: BankAccount[] }>> {
  return apiFetch<{ accounts: BankAccount[] }>('/admin/banking/accounts');
}

export async function getPaymentGateways(): Promise<ApiResponse<{ gateways: PaymentGateway[] }>> {
  return apiFetch<{ gateways: PaymentGateway[] }>('/admin/banking/gateways');
}

export async function getSettlements(
  limit = 50,
  offset = 0
): Promise<ApiResponse<{ settlements: Settlement[]; total?: number }>> {
  return apiFetch<{ settlements: Settlement[]; total?: number }>(
    `/admin/banking/settlements?limit=${limit}&offset=${offset}`
  );
}

// ============================================================================
// BLOCKCHAIN API
// ============================================================================

export interface BlockchainNetwork {
  network_id: string;
  name: string;
  status: string;
  height?: number;
  peer_count?: number;
  last_block_time?: string;
  channel?: string;
}

export interface BlockchainTransaction {
  tx_id: string;
  block_number?: number;
  status: string;
  timestamp: string;
  channel?: string;
  chaincode?: string;
}

export interface WalletAddress {
  id: string;
  address: string;
  network: string;
  balance?: number;
  currency?: string;
  user_id?: string;
  created_at?: string;
}

export async function getBlockchainNetworks(): Promise<ApiResponse<{ networks: BlockchainNetwork[] }>> {
  return apiFetch<{ networks: BlockchainNetwork[] }>('/admin/blockchain/networks');
}

export async function getBlockchainTransactions(
  limit = 50,
  offset = 0
): Promise<ApiResponse<{ transactions: BlockchainTransaction[]; total?: number }>> {
  return apiFetch<{ transactions: BlockchainTransaction[]; total?: number }>(
    `/admin/blockchain/transactions?limit=${limit}&offset=${offset}`
  );
}

export async function getWalletAddresses(
  limit = 50,
  offset = 0
): Promise<ApiResponse<{ addresses: WalletAddress[]; total?: number }>> {
  return apiFetch<{ addresses: WalletAddress[]; total?: number }>(
    `/admin/blockchain/wallets?limit=${limit}&offset=${offset}`
  );
}

// ============================================================================
// ANALYTICS & REPORTS API
// ============================================================================

export interface AuditLog {
  id: string;
  action: string;
  admin_id?: string;
  user_id?: string;
  resource_type?: string;
  resource_id?: string;
  details?: string;
  ip_address?: string;
  timestamp: string;
}

export interface SystemMetrics {
  total_users: number;
  active_users: number;
  total_transactions: number;
  total_volume: number;
  total_earnings: number;
  failed_transactions: number;
  pending_transactions: number;
  last_updated: string;
}

export interface EarningsReport {
  period: string;
  total_earnings: number;
  transaction_count: number;
  average_earnings_per_transaction: number;
  currency: string;
}

export async function getAuditLogs(
  limit = 100,
  offset = 0,
  filters?: {
    action?: string;
    user_id?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<ApiResponse<{ logs: AuditLog[]; total?: number }>> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });
  
  if (filters?.action) params.append('action', filters.action);
  if (filters?.user_id) params.append('user_id', filters.user_id);
  if (filters?.startDate) params.append('start_date', filters.startDate);
  if (filters?.endDate) params.append('end_date', filters.endDate);

  return apiFetch<{ logs: AuditLog[]; total?: number }>(`/admin/audit/logs?${params.toString()}`);
}

export async function getSystemMetrics(): Promise<ApiResponse<SystemMetrics>> {
  return apiFetch<SystemMetrics>('/admin/analytics/metrics');
}

export async function getEarningsReport(
  startDate: string,
  endDate: string,
  currency = 'USD'
): Promise<ApiResponse<{ reports: EarningsReport[] }>> {
  return apiFetch<{ reports: EarningsReport[] }>(
    `/admin/analytics/earnings?start_date=${startDate}&end_date=${endDate}&currency=${currency}`
  );
}

// ============================================================================
// FOREX API
// ============================================================================

export interface ForexRate {
  from_currency: string;
  to_currency: string;
  rate: number;
  updated_at: string;
}

export async function getForexRates(): Promise<ApiResponse<{ rates: ForexRate[] }>> {
  return apiFetch<{ rates: ForexRate[] }>('/forex/rates');
}

export async function getForexRate(from: string, to: string): Promise<ApiResponse<ForexRate>> {
  return apiFetch<ForexRate>(`/forex/rates/${from}/${to}`);
}

// ============================================================================
// COMPLIANCE API
// ============================================================================

export interface KYCApplication {
  id: string;
  user_id: string;
  status: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewer_id?: string;
  documents?: any[];
}

export interface ComplianceReport {
  id: string;
  report_type: string;
  period: string;
  generated_at: string;
  status: string;
  file_url?: string;
}

export async function getKYCApplications(
  status?: string,
  limit = 50,
  offset = 0
): Promise<ApiResponse<{ applications: KYCApplication[]; total?: number }>> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });
  if (status) params.append('status', status);

  return apiFetch<{ applications: KYCApplication[]; total?: number }>(
    `/admin/compliance/kyc?${params.toString()}`
  );
}

export async function updateKYCApplicationStatus(
  id: string,
  status: string,
  reason?: string
): Promise<ApiResponse<{ message: string }>> {
  return apiFetch(`/admin/compliance/kyc/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, reason }),
  });
}

export async function getComplianceReports(
  limit = 50,
  offset = 0
): Promise<ApiResponse<{ reports: ComplianceReport[]; total?: number }>> {
  return apiFetch<{ reports: ComplianceReport[]; total?: number }>(
    `/admin/compliance/reports?limit=${limit}&offset=${offset}`
  );
}

