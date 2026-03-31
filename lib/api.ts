// Centralized API service for admin operations
import { API_BASE } from './constants';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  validation_errors?: Record<string, string>;
}

// Get CSRF token from cookie
function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )csrf_token=([^;]+)'));
  return match ? match[2] : null;
}

// Base fetch function with auth
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      Object.assign(headers, options.headers);
    }
  }

  // CSRF Handling
  if (typeof document !== 'undefined') {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
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
      if (typeof window !== 'undefined') {
        window.location.href = '/login?expired=true';
      }
      return {
        error: 'Session expired. Please login again.',
      };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        validation_errors: errorData.validation_errors,
      };
    }

    const data = await response.json();
    return { data };
  } catch (error: unknown) {
    // Handle CORS and network errors more gracefully
    if (error instanceof Error && (error.message.includes('CORS') || error.message.includes('Failed to fetch'))) {
      return {
        error: 'Cannot connect to API gateway. Please ensure the backend services are running on port 9000.',
      };
    }
    if (error instanceof Error) {
      return {
        error: error.message || 'Network error occurred',
      };
    }
    return { error: 'Network error occurred' };
  }
}

export interface SecurityEvent {
  id: string;
  type: string;
  severity: string;
  description: string;
  source_ip: string;
  user_id?: string;
  created_at: string;
  reference?: string;
  flag_reason?: string;
}

export interface ExchangeRate {
  id: string;
  base_currency: string;
  target_currency: string;
  rate: string;
  buy_rate: string;
  sell_rate: string;
  spread: string;
  provider: string;
  valid_from: string;
  valid_to?: string;
  created_at: string;
}

// ============================================================================
// COMPLIANCE API
// ============================================================================

export interface KYCApplication {
  id: string;
  user_id: string;
  name?: string;
  email?: string;
  submitted_at: string;
  status: string;
  risk_score?: number;
  documents?: unknown[];
  reviewer_id?: string;
  reviewed_at?: string;
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
  return apiFetch<{ message: string }>(`/admin/compliance/kyc/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, reason }),
  });
}

export interface ComplianceReport {
  id: string;
  title: string;
  type: string;
  generated_at: string;
  url: string;
  status: string;
}

export async function getComplianceReports(
  limit = 50,
  offset = 0
): Promise<ApiResponse<{ reports: ComplianceReport[]; total?: number }>> {
  return apiFetch<{ reports: ComplianceReport[]; total?: number }>(
    `/admin/compliance/reports?limit=${limit}&offset=${offset}`
  );
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
  password?: string; // For updates only
}

export interface UsersResponse {
  users: User[];
  total?: number;
  limit?: number;
  offset?: number;
}

export interface UsersFilters {
  kycStatus?: string;
  userType?: string;
}

export async function getUsers(limit = 50, offset = 0, filters?: UsersFilters): Promise<ApiResponse<UsersResponse>> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });

  if (filters?.kycStatus) params.append('kyc_status', filters.kycStatus);
  if (filters?.userType) params.append('user_type', filters.userType);

  return apiFetch<UsersResponse>(`/admin/users?${params.toString()}`);
}

export async function getUserById(id: string): Promise<ApiResponse<User>> {
  return apiFetch<User>(`/admin/users/${id}`);
}

export type UserOverview = {
  user: User;
  wallets?: { items: unknown[]; total: number; limit?: number; offset?: number };
  transactions?: { items: unknown[]; total: number; limit?: number; offset?: number };
  audit_logs?: { items: unknown[]; total: number; limit?: number; offset?: number };
  security_events?: { items: unknown[]; total: number; limit?: number; offset?: number };
  risk?: Record<string, unknown>;
};

export async function getUserOverview(id: string): Promise<ApiResponse<UserOverview>> {
  return apiFetch<UserOverview>(`/admin/users/${id}/overview`);
}

export type CaseStatus = 'open' | 'investigating' | 'resolved' | 'false_positive';
export type CasePriority = 'low' | 'medium' | 'high' | 'critical';
export type CaseEntityType = 'user' | 'transaction' | 'wallet' | 'ip';

export type Case = {
  id: string;
  title: string;
  description?: string | null;
  status: CaseStatus;
  priority: CasePriority;
  entity_type: CaseEntityType;
  entity_id: string;
  created_by?: string | null;
  assigned_to?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type CaseEvent = {
  id: string;
  case_id: string;
  event_type: 'note' | 'status_change' | 'assignment' | 'link';
  message?: string | null;
  metadata?: Record<string, unknown>;
  created_by?: string | null;
  created_at: string;
};

export type CasesFilters = {
  status?: CaseStatus;
  priority?: CasePriority;
  entity_type?: CaseEntityType;
  entity_id?: string;
  q?: string;
};

export async function getCases(limit = 50, offset = 0, filters: CasesFilters = {}): Promise<ApiResponse<{ items: Case[]; total: number; limit: number; offset: number }>> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== '') params.set(k, String(v));
  });
  return apiFetch(`/admin/cases?${params.toString()}`);
}

export async function createCase(payload: {
  title: string;
  description?: string;
  priority?: CasePriority;
  entity_type: CaseEntityType;
  entity_id: string;
  assigned_to?: string;
  note?: string;
}): Promise<ApiResponse<Case>> {
  return apiFetch(`/admin/cases`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateCase(id: string, payload: Partial<Pick<Case, 'title' | 'description' | 'status' | 'priority'>> & { assigned_to?: string; note?: string }): Promise<ApiResponse<Case>> {
  return apiFetch(`/admin/cases/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function getCaseEvents(caseId: string, limit = 50, offset = 0): Promise<ApiResponse<{ items: CaseEvent[]; total: number; limit: number; offset: number }>> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return apiFetch(`/admin/cases/${caseId}/events?${params.toString()}`);
}

export async function updateUserStatus(
  id: string,
  isActive: boolean,
  reason?: string
): Promise<ApiResponse<{ message: string }>> {
  // Use dedicated block/unblock endpoints for proper audit trail
  if (isActive) {
    return unblockUser(id, reason);
  } else {
    return blockUser(id, reason);
  }
}

export async function blockUser(
  id: string,
  reason?: string
): Promise<ApiResponse<{ status?: string; user_id?: string }>> {
  return apiFetch(`/admin/users/${id}/block`, {
    method: 'POST',
    body: reason ? JSON.stringify({ reason }) : undefined,
  });
}

export async function unblockUser(
  id: string,
  reason?: string
): Promise<ApiResponse<{ status?: string; user_id?: string }>> {
  return apiFetch(`/admin/users/${id}/unblock`, {
    method: 'POST',
    body: reason ? JSON.stringify({ reason }) : undefined,
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
  user_id?: string;
  user_email?: string;
  entity_type?: string;
  entity_id?: string;
  ip_address?: string;
  user_agent?: string;
  status_code?: number;
  error_message?: string;
  created_at: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  request_id?: string;
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
  updates: Partial<Pick<User, 'first_name' | 'last_name' | 'email' | 'phone' | 'country_code' | 'password'>>
): Promise<ApiResponse<{ message: string }>> {
  return apiFetch(`/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

// ============================================================================
// ANALYTICS & STATS API
// ============================================================================

export interface SystemStats {
  total_transactions: number;
  completed: number;
  pending: number;
  pending_approvals: number;
  flagged: number;
  total_volume: number; // Decimal string or number
  total_fees: number;   // Decimal string or number
  active_users: number;
}

export async function getSystemStats(): Promise<ApiResponse<SystemStats>> {
  return apiFetch<SystemStats>('/admin/analytics/metrics');
}

export interface TransactionVolume {
  period: string;
  cny: number;
  mwk: number;
  zmw: number;
  total: number;
}

export async function getTransactionVolume(months = 6): Promise<ApiResponse<TransactionVolume[]>> {
  return apiFetch<TransactionVolume[]>(`/admin/analytics/volume?months=${months}`);
}

export interface RiskAlert {
  id: string;
  reference: string;
  amount: string;
  currency: string;
  reason: string;
  risk_score: number;
  created_at: string;
  flag_reason?: string;
}

export async function getRiskAlerts(limit = 50, offset = 0): Promise<ApiResponse<{ alerts: RiskAlert[]; total?: number }>> {
  return apiFetch<{ alerts: RiskAlert[]; total?: number }>(
    `/admin/risk/alerts?limit=${limit}&offset=${offset}`
  );
}

export interface AuditLogEntry {
  id: string;
  user_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  ip_address?: string;
  created_at: string;
}

export interface APIKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  status: string;
  expires_at: string;
  created_at: string;
  last_used?: string;
  key?: string; // Only present on creation
}

export async function getAPIKeys(): Promise<ApiResponse<{ keys: APIKey[] }>> {
  return apiFetch<{ keys: APIKey[] }>('/admin/api-keys');
}

export async function createAPIKey(
  name: string,
  scopes: string[],
  expiresInDays: number
): Promise<ApiResponse<APIKey>> {
  return apiFetch<APIKey>('/admin/api-keys', {
    method: 'POST',
    body: JSON.stringify({ name, scopes, expires_in_days: expiresInDays }),
  });
}

export async function revokeAPIKey(id: string): Promise<ApiResponse<{ message: string }>> {
  return apiFetch<{ message: string }>(`/admin/api-keys/${id}`, {
    method: 'DELETE',
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

export async function reverseTransaction(
  id: string,
  reason: string
): Promise<ApiResponse<{ message: string }>> {
  return apiFetch(`/admin/transactions/${id}/reverse`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function getWalletTransactions(
  walletId: string,
  limit = 50,
  offset = 0
): Promise<ApiResponse<TransactionsResponse>> {
  return apiFetch<TransactionsResponse>(
    `/admin/wallets/${walletId}/transactions?limit=${limit}&offset=${offset}`
  );
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
  offset = 0,
  filters: { status?: string; currency?: string; network?: string } = {}
): Promise<ApiResponse<{ settlements: Settlement[]; total?: number }>> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== '') params.set(k, String(v));
  });
  return apiFetch<{ settlements: Settlement[]; total?: number }>(`/admin/banking/settlements?${params.toString()}`);
}

export async function retrySettlement(id: string): Promise<ApiResponse<{ settlement: Settlement }>> {
  return apiFetch(`/admin/banking/settlements/${id}/retry`, { method: 'POST' });
}

export async function reconcileSettlement(id: string, reconciliation_id?: string): Promise<ApiResponse<{ settlement: Settlement }>> {
  return apiFetch(`/admin/banking/settlements/${id}/reconcile`, {
    method: 'POST',
    body: reconciliation_id ? JSON.stringify({ reconciliation_id }) : undefined,
  });
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
  rpc_url?: string;
  chain_id?: string;
  symbol?: string;
}

export interface BlockchainTransaction {
  tx_id: string;
  block_number?: number;
  status: string;
  timestamp: string;
  channel?: string;
  chaincode?: string;
  blockchain_tx_hash?: string;
  blockchain_status?: string;
}

export interface WalletAddress {
  id: string;
  // Normalized fields used by newer UI components
  address?: string;
  network?: string;
  balance?: number;
  currency?: string;
  user_id?: string;
  created_at?: string;
  // Raw fields coming directly from the backend wallets endpoint
  wallet_address?: string | null;
  status?: string;
}

export type Wallet = WalletAddress;

export async function getUserWallets(userId: string): Promise<ApiResponse<{ addresses: Wallet[] }>> {
  return apiFetch<{ addresses: Wallet[] }>(`/admin/blockchain/wallets?user_id=${userId}`);
}

export async function getBlockchainNetworks(): Promise<ApiResponse<{ networks: BlockchainNetwork[] }>> {
  return apiFetch<{ networks: BlockchainNetwork[] }>('/admin/blockchain/networks');
}

export async function addBlockchainNetwork(network: Partial<BlockchainNetwork>): Promise<ApiResponse<BlockchainNetwork>> {
  return apiFetch<BlockchainNetwork>('/admin/blockchain/networks', {
    method: 'POST',
    body: JSON.stringify(network),
  });
}

export async function updateBlockchainNetwork(
  id: string,
  network: Partial<BlockchainNetwork>
): Promise<ApiResponse<BlockchainNetwork>> {
  return apiFetch<BlockchainNetwork>(`/admin/blockchain/networks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(network),
  });
}

export async function deleteBlockchainNetwork(id: string): Promise<ApiResponse<{ message: string }>> {
  return apiFetch<{ message: string }>(`/admin/blockchain/networks/${id}`, {
    method: 'DELETE',
  });
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
  offset = 0,
  filters?: { user_id?: string; currency?: string; q?: string }
): Promise<ApiResponse<{ addresses: WalletAddress[]; total?: number }>> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  if (filters?.user_id) params.set('user_id', filters.user_id);
  if (filters?.currency) params.set('currency', filters.currency);
  if (filters?.q) params.set('q', filters.q);
  return apiFetch<{ addresses: WalletAddress[]; total?: number }>(
    `/admin/blockchain/wallets?${params.toString()}`
  );
}

// ============================================================================
// ANALYTICS & REPORTS API
// ============================================================================

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

  return apiFetch<{ logs: AuditLog[]; total?: number }>(`/admin/audit-logs?${params.toString()}`);
}

export async function getSystemMetrics(): Promise<ApiResponse<SystemMetrics>> {
  // Map /admin/analytics/metrics to SystemMetrics
  const response = await apiFetch<SystemStats>('/admin/analytics/metrics');
  if (response.error || !response.data) {
    return { error: response.error };
  }
  
  const stats = response.data;
  return {
    data: {
      total_users: stats.active_users,
      active_users: stats.active_users,
      total_transactions: stats.total_transactions,
      total_volume: stats.total_volume,
      total_earnings: stats.total_fees,
      failed_transactions: stats.flagged,
      pending_transactions: stats.pending,
      last_updated: new Date().toISOString()
    }
  };
}

export async function getEarningsReport(
  startDate?: string,
  endDate?: string
): Promise<ApiResponse<{ reports: EarningsReport[] }>> {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  return apiFetch<{ reports: EarningsReport[] }>(`/admin/analytics/earnings?${params.toString()}`);
}

// ============================================================================
// SYSTEM STATUS API
// ============================================================================

export interface ServiceStatus {
  id: string;
  name: string;
  description: string;
  status: string;
  lastUpdated: string;
  uptime: number;
  latency_ms?: number;
}

export interface SystemStatusResponse {
  services: ServiceStatus[];
}

export async function getSystemStatus(): Promise<ApiResponse<SystemStatusResponse>> {
  return apiFetch<SystemStatusResponse>('/admin/system/status');
}

export async function getForexRates(): Promise<ApiResponse<unknown>> {
  return apiFetch<unknown>('/forex/rates');
}

// ============================================================================
// NOTIFICATIONS API
// ============================================================================

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  status: string;
  timestamp: string;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  readAt?: string;
}

type BackendAdminNotification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
};

export async function getNotifications(
  limit = 50,
  offset = 0
): Promise<ApiResponse<{ notifications: Notification[]; total?: number }>> {
  const res = await apiFetch<{ notifications: BackendAdminNotification[]; total?: number }>(
    `/admin/notifications?limit=${limit}&offset=${offset}`
  );
  if (!res.data) return res as unknown as ApiResponse<{ notifications: Notification[]; total?: number }>;
  const mapped: Notification[] = (res.data.notifications || []).map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    type: String(n.type || 'system').toLowerCase(),
    status: n.is_read ? 'read' : 'unread',
    timestamp: n.created_at,
    metadata: n.data,
    userId: n.user_id,
  }));
  return { data: { notifications: mapped, total: res.data.total } };
}

export async function markNotificationRead(id: string): Promise<ApiResponse<{ message: string }>> {
  return apiFetch(`/admin/notifications/${id}/read`, { method: 'POST' });
}

export async function markAllNotificationsRead(): Promise<ApiResponse<{ message: string }>> {
  return apiFetch(`/admin/notifications/read-all`, { method: 'POST' });
}

export async function archiveNotification(id: string): Promise<ApiResponse<{ message: string }>> {
  return apiFetch(`/admin/notifications/${id}`, { method: 'DELETE' });
}
