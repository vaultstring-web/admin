// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { CustomerDetail } from '@/components/customers/CustomerDetail';
import { CustomerList } from '@/components/customers/CustomerList';
import { KYCStatus, AccountStatus, type Customer } from '@/components/customers/types';
import { useSession } from '@/hooks/useSession';
import {
  getUsers,
  getUserById,
  updateUserStatus,
  updateKYCStatus,
  getUserActivity,
  deleteUser,
  updateUserRole,
  updateUserProfile,
  type User,
  type AuditLog,
} from '@/lib/api';
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function UsersPage() {
  const { isAuthenticated, isLoading: sessionLoading } = useSession();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'directory' | 'detail' | 'insights'>('directory');

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [total, setTotal] = useState(0);

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
        const response = await getUsers(limit, offset);
        
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
  }, [sessionLoading, isAuthenticated, page, limit]);

  // Find the selected customer or fetch it
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!selectedCustomerId) {
      setSelectedCustomer(null);
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
            auditLogs: auditLogs.map((log) => ({
              id: log.id || `LOG-${Date.now()}`,
              action: log.action || 'UNKNOWN',
              adminId: log.user_email || 'SYSTEM',
              timestamp: log.created_at || new Date().toISOString(),
              reason:
                log.action === 'LOGIN_SUCCESS'
                  ? `Login from ${log.ip_address || 'unknown IP'} via ${log.user_agent || 'unknown device'}`
                  : log.action === 'LOGIN_FAILED'
                  ? `Failed login from ${log.ip_address || 'unknown IP'} via ${log.user_agent || 'unknown device'}${log.error_message ? ` (${log.error_message})` : ''}`
                  : log.reason ||
                    (log.new_values && JSON.stringify(log.new_values)) ||
                    log.error_message ||
                    log.request_id ||
                    '',
            })),
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
        setActiveTab('directory');
      }
    } catch (err: unknown) {
      console.error('Failed to delete user:', err);
      const message =
        err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to delete user: ${message}`);
    }
  };

  // Handle back from detail view
  const handleBackToList = () => {
    setSelectedCustomerId(null);
    setActiveTab('directory');
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
    <div className="min-h-screen bg-neutral-light-bg dark:bg-neutral-dark-bg text-neutral-light-text dark:text-neutral-dark-text transition-colors">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 font-medium">Error: {error}</p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-6">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-xl bg-neutral-100/60 dark:bg-neutral-900/60 p-1.5 border border-neutral-light-border/60 dark:border-neutral-dark-border/60">
            <TabsTrigger
              value="directory"
              className="px-4 sm:px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:text-brand-green data-[state=active]:shadow-sm text-xs sm:text-sm font-semibold"
            >
              Directory
            </TabsTrigger>
            <TabsTrigger
              value="detail"
              className="px-4 sm:px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:text-brand-green data-[state=active]:shadow-sm text-xs sm:text-sm font-semibold"
            >
              User detail
            </TabsTrigger>
            <TabsTrigger
              value="insights"
              className="px-4 sm:px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:text-brand-green data-[state=active]:shadow-sm text-xs sm:text-sm font-semibold"
            >
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="directory" className="space-y-6">
            <CustomerList
              customers={customers}
              onSelectCustomer={(id) => {
                setSelectedCustomerId(id);
                setActiveTab('detail');
              }}
              loading={loading}
              page={page}
              total={total}
              limit={limit}
              onPageChange={setPage}
            />
          </TabsContent>

          <TabsContent value="detail" className="space-y-6">
            {loadingDetail && selectedCustomerId ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#448a33] mb-4" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Loading user details...</p>
                </div>
              </div>
            ) : selectedCustomer ? (
              <CustomerDetail
                customer={selectedCustomer}
                onBack={handleBackToList}
                onUpdateStatus={handleUpdateStatus}
                onUpdateRole={handleUpdateRole}
                onUpdateProfile={handleUpdateProfile}
                onDelete={handleDeleteUser}
              />
            ) : (
              <div className="flex items-center justify-center min-h-[240px]">
                <p className="text-sm text-neutral-light-text/80 dark:text-neutral-dark-text/80">
                  Select a user from the directory tab to view full details.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="mt-4 pt-4 border-t border-neutral-light-border dark:border-neutral-dark-border">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-neutral-dark-surface p-4 rounded-lg border border-neutral-light-border dark:border-neutral-dark-border shadow-sm">
                  <div className="text-2xl font-bold text-neutral-light-heading dark:text-neutral-dark-heading">
                    {total}
                  </div>
                  <div className="text-sm text-neutral-light-text dark:text-neutral-dark-text">
                    Total Customers
                  </div>
                </div>
                <div className="bg-white dark:bg-neutral-dark-surface p-4 rounded-lg border border-neutral-light-border dark:border-neutral-dark-border shadow-sm">
                  <div className="text-2xl font-bold text-brand-green">
                    {customers.filter((c) => c.kycStatus === KYCStatus.APPROVED).length}
                  </div>
                  <div className="text-sm text-neutral-light-text dark:text-neutral-dark-text">
                    KYC Approved
                  </div>
                </div>
                <div className="bg-white dark:bg-neutral-dark-surface p-4 rounded-lg border border-neutral-light-border dark:border-neutral-dark-border shadow-sm">
                  <div className="text-2xl font-bold text-amber-600">
                    {customers.filter((c) => c.kycStatus === KYCStatus.PENDING).length}
                  </div>
                  <div className="text-sm text-neutral-light-text dark:text-neutral-dark-text">
                    Pending Review
                  </div>
                </div>
                <div className="bg-white dark:bg-neutral-dark-surface p-4 rounded-lg border border-neutral-light-border dark:border-neutral-dark-border shadow-sm">
                  <div className="text-2xl font-bold text-red-600">
                    {customers.filter((c) => c.accountStatus === AccountStatus.BLOCKED).length}
                  </div>
                  <div className="text-sm text-neutral-light-text dark:text-neutral-dark-text">
                    Blocked Accounts
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center text-xs text-neutral-light-text dark:text-neutral-dark-text">
                <p>Compliance Dashboard • Last updated: {new Date().toLocaleDateString()}</p>
                <p className="mt-1">Showing {customers.length} customers • Auto-refresh every 5 minutes</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
