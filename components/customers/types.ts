// app/types/index.ts

export enum KYCStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
}

export interface AuditLog {
  id: string;
  action: string;
  adminId: string;
  timestamp: string;
  reason?: string;
  details?: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  registrationDate: string;
  kycStatus: KYCStatus;
  accountStatus: AccountStatus;
  riskScore: number; // 0-100
  avatarUrl?: string;
  kycDocuments: {
    type: string;
    url: string;
    status: 'verified' | 'unverified';
    submittedAt: string;
  }[];
  auditLogs: AuditLog[];
  address: {
    street: string;
    city: string;
    country: string;
    zip: string;
  };
}

export type ViewState = 'LIST' | 'DETAIL';

export interface ViewContextType {
  currentView: ViewState;
  selectedCustomerId: string | null;
  navigateToDetail: (id: string) => void;
  navigateToList: () => void;
}