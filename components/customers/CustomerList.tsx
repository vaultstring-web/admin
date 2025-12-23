// app/components/CustomerList.tsx
'use client';

import { useState, useMemo } from 'react';
import { Customer, KYCStatus, AccountStatus } from './types';
import { Search, Filter, ChevronDown, ChevronUp, User as UserIcon, ArrowUpDown } from 'lucide-react';
import { Badge } from './Badge';
import { Button } from './Button';

interface CustomerListProps {
  customers: Customer[];
  onSelectCustomer: (id: string) => void;
}

export const CustomerList = ({ customers, onSelectCustomer }: CustomerListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [kycFilter, setKycFilter] = useState<KYCStatus | 'ALL'>('ALL');
  const [accountFilter, setAccountFilter] = useState<AccountStatus | 'ALL'>('ALL');
  const [sortField, setSortField] = useState<'registrationDate' | 'lastName' | 'riskScore'>('registrationDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = 
        c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesKyc = kycFilter === 'ALL' || c.kycStatus === kycFilter;
      const matchesAccount = accountFilter === 'ALL' || c.accountStatus === accountFilter;

      return matchesSearch && matchesKyc && matchesAccount;
    }).sort((a, b) => {
      let valA, valB;
      
      switch(sortField) {
        case 'lastName':
          valA = a.lastName;
          valB = b.lastName;
          break;
        case 'riskScore':
          valA = a.riskScore;
          valB = b.riskScore;
          break;
        case 'registrationDate':
        default:
          valA = new Date(a.registrationDate).getTime();
          valB = new Date(b.registrationDate).getTime();
          break;
      }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [customers, searchTerm, kycFilter, accountFilter, sortField, sortDir]);

  const handleSort = (field: 'registrationDate' | 'lastName' | 'riskScore') => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-20" />;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header & Metrics */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-light-heading dark:text-neutral-dark-heading">Customers</h1>
          <p className="text-sm text-neutral-light-text dark:text-neutral-dark-text mt-1">Manage compliance, KYC, and risk.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" leftIcon={<Filter className="w-4 h-4"/>}>Export List</Button>
          <Button variant="primary" leftIcon={<UserIcon className="w-4 h-4"/>}>Add Customer</Button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="p-4 bg-white dark:bg-neutral-dark-surface border border-neutral-light-border dark:border-neutral-dark-border rounded-lg shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-neutral-light-text dark:text-neutral-dark-text" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-neutral-light-border dark:border-neutral-dark-border rounded-md leading-5 bg-white dark:bg-neutral-dark-surface text-neutral-light-heading dark:text-neutral-dark-heading placeholder-neutral-light-text dark:placeholder-neutral-dark-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-brand-green sm:text-sm transition-shadow"
            placeholder="Search by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search customers"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select 
            className="block w-full lg:w-auto pl-3 pr-10 py-2 text-sm border border-neutral-light-border dark:border-neutral-dark-border bg-white dark:bg-neutral-dark-surface text-neutral-light-heading dark:text-neutral-dark-heading focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-brand-green rounded-md"
            value={kycFilter}
            onChange={(e) => setKycFilter(e.target.value as KYCStatus | 'ALL')}
            aria-label="Filter by KYC status"
          >
            <option value="ALL">All KYC Statuses</option>
            <option value={KYCStatus.PENDING}>Pending</option>
            <option value={KYCStatus.APPROVED}>Approved</option>
            <option value={KYCStatus.REJECTED}>Rejected</option>
          </select>

          <select 
            className="block w-full lg:w-auto pl-3 pr-10 py-2 text-sm border border-neutral-light-border dark:border-neutral-dark-border bg-white dark:bg-neutral-dark-surface text-neutral-light-heading dark:text-neutral-dark-heading focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-brand-green rounded-md"
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value as AccountStatus | 'ALL')}
            aria-label="Filter by account status"
          >
            <option value="ALL">All Accounts</option>
            <option value={AccountStatus.ACTIVE}>Active</option>
            <option value={AccountStatus.BLOCKED}>Blocked</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-neutral-dark-surface border border-neutral-light-border dark:border-neutral-dark-border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-light-border dark:divide-neutral-dark-border">
            <thead className="bg-neutral-light-bg dark:bg-neutral-dark-bg">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-semibold text-neutral-light-text dark:text-neutral-dark-text uppercase tracking-wider cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                  onClick={() => handleSort('lastName')}
                  aria-sort={sortField === 'lastName' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  <div className="flex items-center">
                    Customer 
                    <span aria-hidden="true">
                      <SortIcon field="lastName" />
                    </span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-neutral-light-text dark:text-neutral-dark-text uppercase tracking-wider">
                  Contact
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-semibold text-neutral-light-text dark:text-neutral-dark-text uppercase tracking-wider cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                  onClick={() => handleSort('registrationDate')}
                  aria-sort={sortField === 'registrationDate' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  <div className="flex items-center">
                    Registered 
                    <span aria-hidden="true">
                      <SortIcon field="registrationDate" />
                    </span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-neutral-light-text dark:text-neutral-dark-text uppercase tracking-wider">
                  KYC Status
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-semibold text-neutral-light-text dark:text-neutral-dark-text uppercase tracking-wider cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                  onClick={() => handleSort('riskScore')}
                  aria-sort={sortField === 'riskScore' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  <div className="flex items-center">
                    Risk Score 
                    <span aria-hidden="true">
                      <SortIcon field="riskScore" />
                    </span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-neutral-light-text dark:text-neutral-dark-text uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-dark-surface divide-y divide-neutral-light-border dark:divide-neutral-dark-border">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-neutral-light-text dark:text-neutral-dark-text">
                    <div className="flex flex-col items-center gap-2">
                      <p className="font-medium">No customers found</p>
                      <p className="text-xs">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr 
                    key={customer.id} 
                    className="hover:bg-neutral-light-bg dark:hover:bg-neutral-dark-bg/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-neutral-light-bg dark:bg-neutral-dark-bg border border-neutral-light-border dark:border-neutral-dark-border text-neutral-light-text dark:text-neutral-dark-text">
                          <UserIcon className="w-5 h-5" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-neutral-light-heading dark:text-neutral-dark-heading">
                            {customer.firstName} {customer.lastName}
                          </div>
                          <div className="text-xs text-neutral-light-text dark:text-neutral-dark-text font-mono">
                            {customer.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-light-heading dark:text-neutral-dark-heading">
                        {customer.email}
                      </div>
                      <div className="text-xs text-neutral-light-text dark:text-neutral-dark-text">
                        {customer.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-light-text dark:text-neutral-dark-text">
                        {new Date(customer.registrationDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-start">
                        <Badge status={customer.kycStatus} type="kyc" />
                        <Badge status={customer.accountStatus} type="account" />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge status={customer.riskScore.toString()} type="risk" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onSelectCustomer(customer.id)}
                        aria-label={`View details for ${customer.firstName} ${customer.lastName}`}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-neutral-light-border dark:border-neutral-dark-border flex items-center justify-between">
          <span className="text-sm text-neutral-light-text dark:text-neutral-dark-text">
            Showing <span className="font-semibold">{filteredCustomers.length}</span> {filteredCustomers.length === 1 ? 'result' : 'results'}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
};