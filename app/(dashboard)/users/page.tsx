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
  type User,
} from '@/lib/api';

export default function UsersPage() {
  const { isAuthenticated, isLoading: sessionLoading } = useSession();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const response = await getUsers(100, 0);
        
        if (response.error) {
          setError(response.error);
          setCustomers([]);
          return;
        }

        if (response.data?.users) {
          const mapped: Customer[] = response.data.users.map((u: User) => ({
            id: u.id,
            firstName: u.first_name || '',
            lastName: u.last_name || '',
            email: u.email,
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
      } catch (err: any) {
        console.error('Failed to fetch users:', err);
        setError(err?.message || 'Failed to load users');
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [sessionLoading, isAuthenticated]);

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
          const auditLogs = activityResponse.data?.logs || [];

          const customerDetail: Customer = {
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
            auditLogs: auditLogs.map((log: any) => ({
              id: log.id || `LOG-${Date.now()}`,
              action: log.action || 'UNKNOWN',
              adminId: log.admin_id || 'SYSTEM',
              timestamp: log.timestamp || new Date().toISOString(),
              reason: log.details || log.reason,
            })),
            address: {
              street: '',
              city: '',
              country: u.country_code || '',
              zip: '',
            },
          };

          setSelectedCustomer(customerDetail);
        }
      } catch (err: any) {
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
        alert(`Failed to update status: ${response.error}`);
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
        
        // If this is the selected customer, update it
        if (selectedCustomerId === id) {
          // Will be handled by CustomerDetail component refresh
        }
      }
    } catch (err: any) {
      console.error('Failed to update status:', err);
      alert(`Failed to update status: ${err?.message || 'Unknown error'}`);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (id: string, reason?: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await deleteUser(id, reason);
      if (response.error) {
        alert(`Failed to delete user: ${response.error}`);
        return;
      }

      // Remove from list
      setCustomers(prev => prev.filter(c => c.id !== id));
      
      // If viewing this user, go back to list
      if (selectedCustomerId === id) {
        setSelectedCustomerId(null);
      }
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      alert(`Failed to delete user: ${err?.message || 'Unknown error'}`);
    }
  };

  // Handle back from detail view
  const handleBackToList = () => {
    setSelectedCustomerId(null);
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
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 font-medium">Error: {error}</p>
          </div>
        )}
        
        {loadingDetail && selectedCustomerId ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#448a33] mb-4"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading user details...</p>
            </div>
          </div>
        ) : selectedCustomer ? (
          <CustomerDetail 
            customer={selectedCustomer}
            onBack={handleBackToList}
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDeleteUser}
          />
        ) : (
          <CustomerList 
            customers={customers}
            onSelectCustomer={setSelectedCustomerId}
            loading={loading}
          />
        )}

        {/* Stats Footer */}
        <div className="mt-12 pt-8 border-t border-neutral-light-border dark:border-neutral-dark-border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-neutral-dark-surface p-4 rounded-lg border border-neutral-light-border dark:border-neutral-dark-border shadow-sm">
              <div className="text-2xl font-bold text-neutral-light-heading dark:text-neutral-dark-heading">
                {customers.length}
              </div>
              <div className="text-sm text-neutral-light-text dark:text-neutral-dark-text">
                Total Customers
              </div>
            </div>
            <div className="bg-white dark:bg-neutral-dark-surface p-4 rounded-lg border border-neutral-light-border dark:border-neutral-dark-border shadow-sm">
              <div className="text-2xl font-bold text-brand-green">
                {customers.filter(c => c.kycStatus === KYCStatus.APPROVED).length}
              </div>
              <div className="text-sm text-neutral-light-text dark:text-neutral-dark-text">
                KYC Approved
              </div>
            </div>
            <div className="bg-white dark:bg-neutral-dark-surface p-4 rounded-lg border border-neutral-light-border dark:border-neutral-dark-border shadow-sm">
              <div className="text-2xl font-bold text-amber-600">
                {customers.filter(c => c.kycStatus === KYCStatus.PENDING).length}
              </div>
              <div className="text-sm text-neutral-light-text dark:text-neutral-dark-text">
                Pending Review
              </div>
            </div>
            <div className="bg-white dark:bg-neutral-dark-surface p-4 rounded-lg border border-neutral-light-border dark:border-neutral-dark-border shadow-sm">
              <div className="text-2xl font-bold text-red-600">
                {customers.filter(c => c.accountStatus === AccountStatus.BLOCKED).length}
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
      </div>
    </div>
  );
}
