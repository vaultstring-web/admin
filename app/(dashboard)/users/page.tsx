// app/page.tsx
'use client';

import { useState } from 'react';
import { CustomerDetail } from '@/components/customers/CustomerDetail';
import { CustomerList } from '@/components/customers/CustomerList';
import { MOCK_CUSTOMERS } from '@/components/customers/constants';
import { KYCStatus, AccountStatus } from '@/components/customers/types';

export default function UsersPage() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);

  // Find the selected customer
  const selectedCustomer = selectedCustomerId 
    ? customers.find(c => c.id === selectedCustomerId) 
    : null;

  // Handle status updates
  const handleUpdateStatus = (id: string, newStatus: KYCStatus | AccountStatus, reason?: string) => {
    setCustomers(prev => prev.map(customer => {
      if (customer.id === id) {
        // Determine if this is a KYC or Account status update
        const isKYC = Object.values(KYCStatus).includes(newStatus as KYCStatus);
        const isAccount = Object.values(AccountStatus).includes(newStatus as AccountStatus);
        
        const updatedCustomer = { ...customer };
        
        if (isKYC) {
          updatedCustomer.kycStatus = newStatus as KYCStatus;
        }
        
        if (isAccount) {
          updatedCustomer.accountStatus = newStatus as AccountStatus;
        }
        
        // Add audit log
        const action = isKYC 
          ? `KYC_${newStatus.toUpperCase()}`
          : `ACCOUNT_${newStatus.toUpperCase()}`;
        
        updatedCustomer.auditLogs = [
          ...updatedCustomer.auditLogs,
          {
            id: `LOG-${Date.now()}`,
            action,
            adminId: 'CURRENT_ADMIN',
            timestamp: new Date().toISOString(),
            reason: reason || 'No reason provided'
          }
        ];
        
        return updatedCustomer;
      }
      return customer;
    }));
  };

  // Handle back from detail view
  const handleBackToList = () => {
    setSelectedCustomerId(null);
  };

  return (
    <div className="min-h-screen bg-neutral-light-bg dark:bg-neutral-dark-bg text-neutral-light-text dark:text-neutral-dark-text transition-colors">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {selectedCustomer ? (
          <CustomerDetail 
            customer={selectedCustomer}
            onBack={handleBackToList}
            onUpdateStatus={handleUpdateStatus}
          />
        ) : (
          <CustomerList 
            customers={customers}
            onSelectCustomer={setSelectedCustomerId}
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