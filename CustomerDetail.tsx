// app/components/CustomerDetail.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Customer, KYCStatus, AccountStatus, AuditLog } from './types';
import { ArrowLeft, CheckCircle, XCircle, ShieldAlert, ShieldCheck, MapPin, Mail, Phone, Calendar, Clock, FileText, AlertTriangle } from 'lucide-react';
import { Badge } from './Badge';
import { Button } from './Button';
import { Modal } from './Modal';

interface CustomerDetailProps {
  customer: Customer;
  onBack: () => void;
  onUpdateStatus: (id: string, newStatus: KYCStatus | AccountStatus, reason?: string) => void;
}

export const CustomerDetail = ({ customer, onBack, onUpdateStatus }: CustomerDetailProps) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'kyc' | 'history'>('profile');
  
  // Modal States
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [reason, setReason] = useState('');

  const handleRejectKYC = () => {
    onUpdateStatus(customer.id, KYCStatus.REJECTED, reason);
    setIsRejectModalOpen(false);
    setReason('');
  };

  const handleBlockAccount = () => {
    onUpdateStatus(customer.id, AccountStatus.BLOCKED, reason);
    setIsBlockModalOpen(false);
    setReason('');
  };
  
  const handleApproveKYC = () => {
    if (window.confirm("Are you sure you want to approve this customer's KYC? This action will be logged.")) {
      onUpdateStatus(customer.id, KYCStatus.APPROVED);
    }
  };

  const handleUnblock = () => {
    if (window.confirm("Are you sure you want to unblock this account?")) {
      onUpdateStatus(customer.id, AccountStatus.ACTIVE);
    }
  };

  // Helper to get avatar URL
  const getAvatarUrl = () => {
    if (!customer.avatarUrl) return '/images/default-avatar.png';
    if (typeof customer.avatarUrl === 'string') return customer.avatarUrl;
    return '/images/default-avatar.png';
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
      
      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} leftIcon={<ArrowLeft className="w-4 h-4"/>}>
          Back to List
        </Button>
        <div className="flex gap-2">
          {customer.accountStatus === AccountStatus.ACTIVE && (
            <Button variant="danger" size="sm" leftIcon={<ShieldAlert className="w-4 h-4"/>} onClick={() => setIsBlockModalOpen(true)}>
              Block Account
            </Button>
          )}
          {customer.accountStatus === AccountStatus.BLOCKED && (
            <Button variant="secondary" size="sm" leftIcon={<ShieldCheck className="w-4 h-4"/>} onClick={handleUnblock}>
              Unblock Account
            </Button>
          )}
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-white dark:bg-neutral-dark-surface border border-neutral-light-border dark:border-neutral-dark-border rounded-lg p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center">
        <div className="relative w-24 h-24 rounded-full border-4 border-neutral-light-bg dark:border-neutral-dark-bg overflow-hidden">
          <Image
            src={getAvatarUrl()}
            alt={`${customer.firstName} ${customer.lastName} avatar`}
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-neutral-light-heading dark:text-neutral-dark-heading">
              {customer.firstName} {customer.lastName}
            </h1>
            <Badge status={customer.kycStatus} type="kyc" />
            <Badge status={customer.accountStatus} type="account" />
          </div>
          <p className="text-neutral-light-text dark:text-neutral-dark-text font-mono text-sm mt-1">ID: {customer.id}</p>
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-neutral-light-text dark:text-neutral-dark-text">
            <span className="flex items-center gap-1"><Mail className="w-4 h-4"/> {customer.email}</span>
            <span className="flex items-center gap-1"><Phone className="w-4 h-4"/> {customer.phone}</span>
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {customer.address.city}, {customer.address.country}</span>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> Joined {new Date(customer.registrationDate).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="text-right p-4 bg-neutral-light-bg dark:bg-neutral-dark-bg rounded-lg border border-neutral-light-border dark:border-neutral-dark-border">
          <div className="text-xs font-semibold text-neutral-light-text dark:text-neutral-dark-text uppercase tracking-wider mb-1">Risk Score</div>
          <div className={`text-3xl font-bold ${customer.riskScore > 70 ? 'text-red-600' : customer.riskScore > 30 ? 'text-yellow-600' : 'text-green-600'}`}>
            {customer.riskScore}/100
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-light-border dark:border-neutral-dark-border">
        <nav className="-mb-px flex space-x-8">
          {(['profile', 'kyc', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? 'border-brand-green text-brand-green'
                  : 'border-transparent text-neutral-light-text dark:text-neutral-dark-text hover:text-neutral-light-heading dark:hover:text-neutral-dark-heading hover:border-neutral-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors`}
            >
              {tab === 'kyc' ? 'KYC & Documents' : tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content (Left 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-neutral-dark-surface border border-neutral-light-border dark:border-neutral-dark-border rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-medium text-neutral-light-heading dark:text-neutral-dark-heading mb-4">Detailed Information</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                <div>
                  <dt className="text-sm font-medium text-neutral-light-text dark:text-neutral-dark-text">Full Legal Name</dt>
                  <dd className="mt-1 text-sm text-neutral-light-heading dark:text-neutral-dark-heading">{customer.firstName} {customer.lastName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-neutral-light-text dark:text-neutral-dark-text">Date of Birth</dt>
                  <dd className="mt-1 text-sm text-neutral-light-heading dark:text-neutral-dark-heading">Jan 12, 1985 (39 years old)</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-neutral-light-text dark:text-neutral-dark-text">Nationality</dt>
                  <dd className="mt-1 text-sm text-neutral-light-heading dark:text-neutral-dark-heading">{customer.address.country}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-neutral-light-text dark:text-neutral-dark-text">Full Address</dt>
                  <dd className="mt-1 text-sm text-neutral-light-heading dark:text-neutral-dark-heading">
                    {customer.address.street}<br/>
                    {customer.address.city}, {customer.address.zip}<br/>
                    {customer.address.country}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {activeTab === 'kyc' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-neutral-dark-surface border border-neutral-light-border dark:border-neutral-dark-border rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-neutral-light-heading dark:text-neutral-dark-heading">Submitted Documents</h3>
                  {customer.kycStatus === KYCStatus.PENDING && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="danger" onClick={() => setIsRejectModalOpen(true)}>Reject</Button>
                      <Button size="sm" variant="primary" onClick={handleApproveKYC}>Approve</Button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {customer.kycDocuments.length > 0 ? customer.kycDocuments.map((doc, idx) => (
                    <div key={idx} className="border border-neutral-light-border dark:border-neutral-dark-border rounded-lg overflow-hidden group">
                      <div className="relative bg-neutral-100 dark:bg-neutral-800 aspect-video flex items-center justify-center overflow-hidden">
                        <div className="relative w-full h-full">
                          <Image
                            src={doc.url}
                            alt={doc.type}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">Inspect</Button>
                        </div>
                      </div>
                      <div className="p-3 bg-neutral-light-bg dark:bg-neutral-dark-bg flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm text-neutral-light-heading dark:text-neutral-dark-heading">{doc.type}</p>
                          <p className="text-xs text-neutral-light-text dark:text-neutral-dark-text">{new Date(doc.submittedAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${doc.status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {doc.status}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-2 text-center py-8 text-neutral-light-text dark:text-neutral-dark-text bg-neutral-light-bg dark:bg-neutral-dark-bg rounded-lg border-2 border-dashed border-neutral-light-border dark:border-neutral-dark-border">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50"/>
                      No documents submitted yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white dark:bg-neutral-dark-surface border border-neutral-light-border dark:border-neutral-dark-border rounded-lg shadow-sm overflow-hidden">
              <ul className="divide-y divide-neutral-light-border dark:divide-neutral-dark-border">
                {customer.auditLogs.length === 0 ? (
                  <li className="px-6 py-8 text-center text-sm text-neutral-light-text dark:text-neutral-dark-text">
                    No audit history available.
                  </li>
                ) : customer.auditLogs.map((log) => (
                  <li key={log.id} className="px-6 py-4 hover:bg-neutral-light-bg dark:hover:bg-neutral-dark-bg/50 transition-colors">
                    <div className="flex justify-between">
                      <div className="flex gap-3">
                        <div className="mt-1">
                          {log.action.includes('REJECT') || log.action.includes('BLOCK') ? 
                            <XCircle className="w-5 h-5 text-red-500" /> : 
                            <CheckCircle className="w-5 h-5 text-brand-green" />
                          }
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-light-heading dark:text-neutral-dark-heading">
                            {log.action.replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs text-neutral-light-text dark:text-neutral-dark-text mt-1">
                            by {log.adminId} &bull; {log.reason && <span className="italic">"{log.reason}"</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-neutral-light-text dark:text-neutral-dark-text">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar (Right 1/3) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-dark-surface border border-neutral-light-border dark:border-neutral-dark-border rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-light-heading dark:text-neutral-dark-heading uppercase tracking-wider mb-4">Risk Indicators</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-light-text dark:text-neutral-dark-text">PEP Status</span>
                <span className="font-medium text-green-600 dark:text-green-400">Negative</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-light-text dark:text-neutral-dark-text">Sanctions List</span>
                <span className="font-medium text-green-600 dark:text-green-400">Clear</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-light-text dark:text-neutral-dark-text">Adverse Media</span>
                <span className="font-medium text-yellow-600 dark:text-yellow-400">1 Potential Match</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-light-text dark:text-neutral-dark-text">IP Consistency</span>
                <span className="font-medium text-green-600 dark:text-green-400">98% Match</span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-neutral-light-border dark:border-neutral-dark-border">
              <Button variant="outline" className="w-full text-xs" size="sm">Request Enhanced Due Diligence</Button>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Compliance Note</h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                  <p>Customer passed automated checks but has a high volume of transactions in the first week. Recommended to keep under monitoring.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject KYC Application"
        type="danger"
        footer={
          <>
            <Button variant="danger" onClick={handleRejectKYC} disabled={!reason}>Confirm Rejection</Button>
            <Button variant="ghost" onClick={() => setIsRejectModalOpen(false)} className="mr-3">Cancel</Button>
          </>
        }
      >
        <p className="mb-4">Please provide a mandatory reason for rejecting this customer's KYC application. This will be logged and visible to the audit team.</p>
        <textarea
          className="w-full border border-neutral-light-border dark:border-neutral-dark-border rounded-md p-2 bg-white dark:bg-neutral-dark-bg text-neutral-light-heading dark:text-neutral-dark-heading focus:ring-2 focus:ring-red-500 focus:outline-none"
          rows={4}
          placeholder="Enter rejection reason..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </Modal>

      <Modal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        title="Block Customer Account"
        type="danger"
        footer={
          <>
            <Button variant="danger" onClick={handleBlockAccount} disabled={!reason}>Block Account</Button>
            <Button variant="ghost" onClick={() => setIsBlockModalOpen(false)} className="mr-3">Cancel</Button>
          </>
        }
      >
        <p className="mb-4 font-bold text-red-600">Warning: This action will immediately prevent the customer from logging in or performing any transactions.</p>
        <p className="mb-4">Please provide a reason for this block.</p>
        <textarea
          className="w-full border border-neutral-light-border dark:border-neutral-dark-border rounded-md p-2 bg-white dark:bg-neutral-dark-bg text-neutral-light-heading dark:text-neutral-dark-heading focus:ring-2 focus:ring-red-500 focus:outline-none"
          rows={4}
          placeholder="Enter blocking reason..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};