// app/constants/merchants.ts
export type Merchant = {
  id: string;
  businessName: string;
  legalType: string;
  registrationNumber: string;
  taxId: string;
  address: string;
  contact: string;
  phone: string;
  email: string;
  category: string;
  registrationDate: string;
  verificationStatus: "pending" | "approved" | "rejected";
  accountStatus: "active" | "suspended";
  riskScore: number;
  transactionVolume: number;
  settlementBalance: number;
  documents: {
    type: string;
    url: string;
    status: "verified" | "unverified";
    submittedAt: string;
  }[];
  auditLogs: {
    id: string;
    action: string;
    adminId: string;
    timestamp: string;
    reason?: string;
  }[];
  owners: {
    name: string;
    email: string;
    phone: string;
    ownershipPercentage: number;
  }[];
  bankAccounts: {
    id: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    currency: string;
    isPrimary: boolean;
  }[];
};

export const MERCHANT_CATEGORIES = [
  "Retail",
  "Services", 
  "Food & Beverage",
  "Travel & Hospitality",
  "SaaS",
  "E-commerce",
  "Healthcare",
  "Education",
  "Entertainment",
  "Transportation"
] as const;

export const MERCHANT_LEGAL_TYPES = [
  "Sole Proprietorship",
  "Partnership",
  "Limited Liability Company (LLC)",
  "Private Limited Company",
  "Public Limited Company",
  "Corporation"
] as const;

export type SimplifiedMerchant = {
  id: string;
  businessName: string;
  registrationDate: string;
  verificationStatus: "pending" | "approved" | "rejected";
  accountStatus: "active" | "suspended";
  category: string;
  contact: string;
  email: string;
  phone: string;
  riskScore: number;
};
