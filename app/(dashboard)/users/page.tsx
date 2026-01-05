'use client';

import { useState, useCallback } from 'react';
import { CustomerList } from '@/components/customers/CustomerList';
import { CustomerDetail } from '@/components/customers/CustomerDetail';
import { MOCK_CUSTOMERS } from '@/components/customers/constants';
import { Customer, KYCStatus, AccountStatus, AuditLog } from '@/components/customers/types';

export default function Home() {
  const [currentView, setCurrentView] = useState<'LIST' | 'DETAIL'>('LIST');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);

  // Derived state for the currently selected customer
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const handleSelectCustomer = useCallback((id: string) => {
    setSelectedCustomerId(id);
    setCurrentView('DETAIL');
    window.scrollTo(0, 0);
  }, []);

  const handleBackToList = useCallback(() => {
    setCurrentView('LIST');
    setSelectedCustomerId(null);
  }, []);

  const handleUpdateStatus = useCallback((id: string, newStatus: KYCStatus | AccountStatus, reason?: string) => {
    setCustomers(prevCustomers => prevCustomers.map(cust => {
      if (cust.id !== id) return cust;

      const updatedCustomer = { ...cust };
      const newLog: AuditLog = {
        id: `LOG-${Date.now()}`,
        action: '',
        adminId: 'ADMIN-CURRENT', // In a real app, from auth context
        timestamp: new Date().toISOString(),
        reason: reason,
      };

      if (Object.values(KYCStatus).includes(newStatus as KYCStatus)) {
        updatedCustomer.kycStatus = newStatus as KYCStatus;
        newLog.action = `KYC_${newStatus}`;
      } else if (Object.values(AccountStatus).includes(newStatus as AccountStatus)) {
        updatedCustomer.accountStatus = newStatus as AccountStatus;
        newLog.action = `ACCOUNT_${newStatus}`;
      }

      updatedCustomer.auditLogs = [newLog, ...updatedCustomer.auditLogs];
      return updatedCustomer;
    }));
  }, []);

  return (
    <>
      {currentView === 'LIST' && (
        <CustomerList 
          customers={customers} 
          onSelectCustomer={handleSelectCustomer} 
        />
      )}
      {currentView === 'DETAIL' && selectedCustomer && (
        <CustomerDetail 
          customer={selectedCustomer} 
          onBack={handleBackToList}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </>
  );
}