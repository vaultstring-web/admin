// app/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { CustomerDetail } from '@/components/customers/CustomerDetail';
import { CustomerList } from '@/components/customers/CustomerList';
import { KYCStatus, AccountStatus, type Customer } from '@/components/customers/types';
import { useSession } from '@/hooks/useSession';
import {
  getUsers,
  getUserById,
  getUserOverview,
  updateUserStatus,
  updateKYCStatus,
  getUserActivity,
  deleteUser,
  updateUserRole,
  updateUserProfile,
  type User,
  type AuditLog,
} from '@/lib/api';
import { linkOrCreateCaseAndAppendNote } from '@/lib/caseLinking';
import { toast } from "sonner";
import { MonitoringLayout } from '@/components/monitoring/MonitoringLayout';
import { DetailDrawer } from '@/components/monitoring/DetailDrawer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function UsersPage() {
  const { isAuthenticated, isLoading: sessionLoading } = useSession();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [total, setTotal] = useState(0);

  const [filterUserType, setFilterUserType] = useState<string>('');
  const [filterKycStatus, setFilterKycStatus] = useState<string>('');

  const apiFilters = useMemo(() => {
    return {
      userType: filterUserType || undefined,
      kycStatus: filterKycStatus || undefined,
    };
  }, [filterUserType, filterKycStatus]);

  useEffect(() => {
    if (sessionLoading || !isAuthenticated) {
      setLoading(false);
      return;
    }

    const mapKYC = (status?: string): KYCStatus => {
      switch ((status || '').toLowerCase()) {
        case 'verified':
        case 'approved':
          return KYCStatus.APPROVED;
        case 'rejected':
          return KYCStatus.REJECTED;
        case 'processing':
        case 'pending':
        default:
          return KYCStatus.PENDING;
      }
    };

    const mapAccount = (isActive?: boolean): AccountStatus =>
      isActive ? AccountStatus.ACTIVE : AccountStatus.BLOCKED;

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const offset = (page - 1) * limit;
        const response = await getUsers(limit, offset, apiFilters);
        
        if (response.error) {
          setError(response.error);
          setCustomers([]);
          return;
        }

        if (response.data?.total !== undefined) {
           setTotal(response.data.total);
        }

        if (response.data?.users) {
          const mapped: Customer[] = response.data.users.map((u: User) => ({
            id: u.id,
            firstName: u.first_name || '',
            lastName: u.last_name || '',
            email: u.email,
            role: u.user_type || undefined,
            phone: u.phone || '',
            registrationDate: u.created_at,
            kycStatus: mapKYC(u.kyc_status),
            accountStatus: mapAccount(u.is_active),
            riskScore:
              typeof u.risk_score === 'string'
                ? Math.min(100, Math.max(0, parseFloat(u.risk_score)))
                : typeof u.risk_score === 'number'
                ? Math.min(100, Math.max(0, u.risk_score))
                : 0,
            avatarUrl: '/placeholder-user.jpg',
            kycDocuments: [],
            auditLogs: [],
            address: {
              street: '',
              city: '',
              country: u.country_code || '',
              zip: '',
            },
          }));
          setCustomers(mapped);
        } else {
          setCustomers([]);
        }
      } catch (err: unknown) {
        console.error('Failed to fetch users:', err);
        const message =
          err instanceof Error ? err.message : 'Failed to load users';
        setError(message);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [sessionLoading, isAuthenticated, page, limit, apiFilters]);

  // Find the selected customer or fetch it
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [overview, setOverview] = useState<{
    user?: User;
    walletsTotal?: number;
    transactionsTotal?: number;
    auditTotal?: number;
    securityTotal?: number;
    risk?: Record<string, unknown>;
  } | null>(null);

  useEffect(() => {
    if (!selectedCustomerId) {
      setSelectedCustomer(null);
      setOverview(null);
      setDrawerOpen(false);
      return;
    }

    const fetchCustomerDetail = async () => {
      setLoadingDetail(true);
      try {
        const response = await getUserById(selectedCustomerId);
        if (response.error) {
          console.error('Failed to fetch user detail:', response.error);
          // Try to use cached version
          const cached = customers.find(c => c.id === selectedCustomerId);
          if (cached) {
            setSelectedCustomer(cached);
          }
          return;
        }

        if (response.data) {
          const u = response.data;
          const mapKYC = (status?: string): KYCStatus => {
            switch ((status || '').toLowerCase()) {
              case 'verified':
              case 'approved':
                return KYCStatus.APPROVED;
              case 'rejected':
                return KYCStatus.REJECTED;
              default:
                return KYCStatus.PENDING;
            }
          };
          const mapAccount = (isActive?: boolean): AccountStatus =>
            isActive ? AccountStatus.ACTIVE : AccountStatus.BLOCKED;

          // Fetch activity logs
          const activityResponse = await getUserActivity(selectedCustomerId);
          const auditLogs: AuditLog[] = activityResponse.data?.logs || [];

          const loginSuccessLogs = auditLogs.filter(log => log.action === 'LOGIN_SUCCESS');
          const loginFailedLogs = auditLogs.filter(log => log.action === 'LOGIN_FAILED');
          const loginAttempts = loginSuccessLogs.length + loginFailedLogs.length;
          const failedLoginAttempts = loginFailedLogs.length;

          const lastLogin = loginSuccessLogs[0];
          const lastFailedLogin = loginFailedLogs[0];

          const ipSet = new Set<string>();
          auditLogs.forEach(log => {
            if (log.ip_address) {
              ipSet.add(log.ip_address);
            }
          });

          const customerDetail: Customer = {
            id: u.id,
            firstName: u.first_name || '',
            lastName: u.last_name || '',
            email: u.email,
            role: u.user_type || undefined,
            phone: u.phone || '',
            registrationDate: u.created_at,
            kycStatus: mapKYC(u.kyc_status),
            accountStatus: mapAccount(u.is_active),
            riskScore:
              typeof u.risk_score === 'number'
                ? Math.min(100, Math.max(0, u.risk_score))
                : 0,
            avatarUrl: '/placeholder-user.jpg',
            kycDocuments: [],
            auditLogs: auditLogs.map((log) => {
              const reasonFromNewValues =
                log.new_values && typeof log.new_values === 'object' && 'reason' in log.new_values
                  ? String((log.new_values as Record<string, unknown>).reason || '')
                  : log.new_values && typeof log.new_values === 'object'
                  ? JSON.stringify(log.new_values)
                  : '';
              return {
                id: log.id || `LOG-${Date.now()}`,
                action: log.action || 'UNKNOWN',
                adminId: log.user_email || 'SYSTEM',
                timestamp: log.created_at || new Date().toISOString(),
                reason:
                  log.action === 'LOGIN_SUCCESS'
                    ? `Login from ${log.ip_address || 'unknown IP'} via ${log.user_agent || 'unknown device'}`
                    : log.action === 'LOGIN_FAILED'
                    ? `Failed login from ${log.ip_address || 'unknown IP'} via ${log.user_agent || 'unknown device'}${log.error_message ? ` (${log.error_message})` : ''}`
                    : reasonFromNewValues ||
                      log.error_message ||
                      log.request_id ||
                      '',
              };
            }),
            loginAttempts,
            failedLoginAttempts,
            lastLoginAt: lastLogin?.created_at,
            lastLoginIP: lastLogin?.ip_address,
            lastFailedLoginAt: lastFailedLogin?.created_at,
            lastFailedLoginIP: lastFailedLogin?.ip_address,
            uniqueLoginIPs: ipSet.size || undefined,
            address: {
              street: '',
              city: '',
              country: u.country_code || '',
              zip: '',
            },
          };

          setSelectedCustomer(customerDetail);
        }
      } catch (err: unknown) {
        console.error('Failed to fetch customer detail:', err);
        // Try to use cached version
        const cached = customers.find(c => c.id === selectedCustomerId);
        if (cached) {
          setSelectedCustomer(cached);
        }
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchCustomerDetail();
  }, [selectedCustomerId, customers]);

  useEffect(() => {
    if (!selectedCustomerId) return;
    setDrawerOpen(true);
    const load = async () => {
      const res = await getUserOverview(selectedCustomerId);
      if (res.data) {
        setOverview({
          user: res.data.user,
          walletsTotal: res.data.wallets?.total,
          transactionsTotal: res.data.transactions?.total,
          auditTotal: res.data.audit_logs?.total,
          securityTotal: res.data.security_events?.total,
          risk: res.data.risk,
        });
      } else {
        setOverview(null);
      }
    };
    void load();
  }, [selectedCustomerId]);

  // Handle status updates - actually calls backend
  const handleUpdateStatus = async (id: string, newStatus: KYCStatus | AccountStatus, reason?: string) => {
    try {
      const isKYC = Object.values(KYCStatus).includes(newStatus as KYCStatus);
      const isAccount = Object.values(AccountStatus).includes(newStatus as AccountStatus);
      
      let response;
      if (isKYC) {
        const kycStatus = newStatus === KYCStatus.APPROVED ? 'approved' : 
                         newStatus === KYCStatus.REJECTED ? 'rejected' : 'pending';
        response = await updateKYCStatus(id, kycStatus, reason);
      } else if (isAccount) {
        const isActive = newStatus === AccountStatus.ACTIVE;
        response = await updateUserStatus(id, isActive, reason);
      }

      if (response?.error) {
        toast.error(`Failed to update status: ${response.error}`);
        return;
      }

      const statusLabel = String(newStatus);
      await linkOrCreateCaseAndAppendNote({
        entityType: 'user',
        entityId: id,
        title: `User status update: ${id}`,
        note: `Admin updated user status to "${statusLabel}".${reason ? `\n\nReason: ${reason}` : ''}`,
        priority: 'high',
      });

      // Refresh user data from backend
      const userResponse = await getUserById(id);
      if (userResponse.data) {
        const u = userResponse.data;
        const mapKYC = (status?: string): KYCStatus => {
          switch ((status || '').toLowerCase()) {
            case 'verified':
            case 'approved':
              return KYCStatus.APPROVED;
            case 'rejected':
              return KYCStatus.REJECTED;
            default:
              return KYCStatus.PENDING;
          }
        };
        const mapAccount = (isActive?: boolean): AccountStatus =>
          isActive ? AccountStatus.ACTIVE : AccountStatus.BLOCKED;

        const updatedCustomer: Customer = {
          id: u.id,
          firstName: u.first_name || '',
          lastName: u.last_name || '',
          email: u.email,
          phone: u.phone || '',
          registrationDate: u.created_at,
          kycStatus: mapKYC(u.kyc_status),
          accountStatus: mapAccount(u.is_active),
          riskScore: typeof u.risk_score === 'number' ? Math.min(100, Math.max(0, u.risk_score)) : 0,
          avatarUrl: '/placeholder-user.jpg',
          kycDocuments: [],
          auditLogs: [],
          address: {
            street: '',
            city: '',
            country: u.country_code || '',
            zip: '',
          },
        };

        // Update in list
        setCustomers(prev => prev.map(c => c.id === id ? updatedCustomer : c));
        
        // If this is the selected customer, update the detail view as well
        if (selectedCustomerId === id) {
          setSelectedCustomer(updatedCustomer);
        }
      }
    } catch (err: unknown) {
      console.error('Failed to update status:', err);
      const message =
        err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to update status: ${message}`);
    }
  };

  // Handle profile edits
  const handleUpdateProfile = async (id: string, updates: Partial<{ first_name: string; last_name: string; email: string; phone: string; country_code: string; password: string }>) => {
    try {
      const response = await updateUserProfile(id, updates);
      if (response.error) {
        toast.error(`Failed to update profile: ${response.error}`);
        return;
      }
      const userResponse = await getUserById(id);
      if (userResponse.data) {
        const u = userResponse.data;
        const mapKYC = (status?: string): KYCStatus => {
          switch ((status || '').toLowerCase()) {
            case 'verified':
            case 'approved':
              return KYCStatus.APPROVED;
            case 'rejected':
              return KYCStatus.REJECTED;
            default:
              return KYCStatus.PENDING;
          }
        };
        const mapAccount = (isActive?: boolean): AccountStatus =>
          isActive ? AccountStatus.ACTIVE : AccountStatus.BLOCKED;
        const updatedCustomer: Customer = {
          id: u.id,
          firstName: u.first_name || '',
          lastName: u.last_name || '',
          email: u.email,
          role: u.user_type || undefined,
          phone: u.phone || '',
          registrationDate: u.created_at,
          kycStatus: mapKYC(u.kyc_status),
          accountStatus: mapAccount(u.is_active),
          riskScore: typeof u.risk_score === 'number' ? Math.min(100, Math.max(0, u.risk_score)) : 0,
          avatarUrl: '/placeholder-user.jpg',
          kycDocuments: [],
          auditLogs: [],
          address: {
            street: '',
            city: '',
            country: u.country_code || '',
            zip: '',
          },
        };
        setCustomers(prev => prev.map(c => (c.id === id ? updatedCustomer : c)));
        if (selectedCustomerId === id) {
          setSelectedCustomer(updatedCustomer);
        }
      }
    } catch (err: unknown) {
      console.error('Failed to update profile:', err);
      const message =
        err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to update profile: ${message}`);
    }
  };

  // Handle role updates
  const handleUpdateRole = async (id: string, role: string, reason?: string) => {
    try {
      const response = await updateUserRole(id, role, reason);
      if (response?.error) {
        toast.error(`Failed to update role: ${response.error}`);
        return;
      }
      const userResponse = await getUserById(id);
      if (userResponse.data) {
        const u = userResponse.data;
        const mapKYC = (status?: string): KYCStatus => {
          switch ((status || '').toLowerCase()) {
            case 'verified':
            case 'approved':
              return KYCStatus.APPROVED;
            case 'rejected':
              return KYCStatus.REJECTED;
            default:
              return KYCStatus.PENDING;
          }
        };
        const mapAccount = (isActive?: boolean): AccountStatus =>
          isActive ? AccountStatus.ACTIVE : AccountStatus.BLOCKED;
        const updatedCustomer: Customer = {
          id: u.id,
          firstName: u.first_name || '',
          lastName: u.last_name || '',
          email: u.email,
          role: u.user_type || undefined,
          phone: u.phone || '',
          registrationDate: u.created_at,
          kycStatus: mapKYC(u.kyc_status),
          accountStatus: mapAccount(u.is_active),
          riskScore: typeof u.risk_score === 'number' ? Math.min(100, Math.max(0, u.risk_score)) : 0,
          avatarUrl: '/placeholder-user.jpg',
          kycDocuments: [],
          auditLogs: [],
          address: {
            street: '',
            city: '',
            country: u.country_code || '',
            zip: '',
          },
        };
        setCustomers(prev => prev.map(c => (c.id === id ? updatedCustomer : c)));
      }
    } catch (err: unknown) {
      console.error('Failed to update role:', err);
      const message =
        err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to update role: ${message}`);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (id: string, reason?: string) => {
    try {
      const response = await deleteUser(id, reason);
      if (response.error) {
        toast.error(`Failed to delete user: ${response.error}`);
        return;
      }

      // Remove from list
      setCustomers(prev => prev.filter(c => c.id !== id));
      
      // If viewing this user, go back to list
      if (selectedCustomerId === id) {
        setSelectedCustomerId(null);
        setSelectedCustomer(null);
      }
    } catch (err: unknown) {
      console.error('Failed to delete user:', err);
      const message =
        err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to delete user: ${message}`);
    }
  };

  if (loading && customers.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-light-bg dark:bg-neutral-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#448a33] mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <MonitoringLayout
        title="Users & Accounts"
        subtitle="Monitor customers like a bank: identity, KYC, risk, balances, and activity."
        filters={
          <>
            {error && (
              <Card className="border-rose-200 bg-rose-50/60">
                <CardHeader>
                  <CardTitle className="text-sm">Error</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-rose-700">{error}</CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="userType">User type</Label>
                  <Input
                    id="userType"
                    placeholder="customer / admin / merchant"
                    value={filterUserType}
                    onChange={(e) => {
                      setFilterUserType(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kycStatus">KYC status</Label>
                  <Input
                    id="kycStatus"
                    placeholder="pending / verified / rejected"
                    value={filterKycStatus}
                    onChange={(e) => {
                      setFilterKycStatus(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </>
        }
      >
        <CustomerList
          customers={customers}
          onSelectCustomer={(id) => {
            setSelectedCustomerId(id);
          }}
          loading={loading}
          page={page}
          total={total}
          limit={limit}
          onPageChange={setPage}
        />
      </MonitoringLayout>

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) {
            setSelectedCustomerId(null);
          }
        }}
        title={overview?.user?.email || 'User overview'}
        description="User 360: wallets, recent transactions, audit & security timeline."
        widthClassName="sm:max-w-3xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">Wallets</CardTitle>
              </CardHeader>
              <CardContent className="text-sm font-mono">{overview?.walletsTotal ?? '—'}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">Recent transactions</CardTitle>
              </CardHeader>
              <CardContent className="text-sm font-mono">{overview?.transactionsTotal ?? '—'}</CardContent>
            </Card>
          </div>

          {loadingDetail && selectedCustomerId ? (
            <div className="py-10 text-sm text-muted-foreground">Loading user details…</div>
          ) : selectedCustomer ? (
            <CustomerDetail
              customer={selectedCustomer}
              onBack={() => setDrawerOpen(false)}
              onUpdateStatus={handleUpdateStatus}
              onUpdateRole={handleUpdateRole}
              onUpdateProfile={handleUpdateProfile}
              onDelete={handleDeleteUser}
            />
          ) : (
            <div className="py-10 text-sm text-muted-foreground">Select a user to view details.</div>
          )}
        </div>
      </DetailDrawer>
    </>
  );
}
