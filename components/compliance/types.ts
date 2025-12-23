export enum KYCStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  UNDER_REVIEW = 'under_review'
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface KYCApplication {
  id: string;
  customerId: string;
  customerName: string;
  customerType: 'individual' | 'business';
  submittedAt: string;
  status: KYCStatus;
  riskLevel: RiskLevel;
  riskScore: number;
  documents: Array<{
    type: string;
    status: 'verified' | 'pending' | 'rejected';
    url?: string;
  }>;
  assignedTo?: string;
  lastReviewedAt?: string;
  notes?: string;
}


export interface FlaggedTransaction {
  id: string;
  transactionId: string;
  customerId: string;
  customerName: string;
  amount: number;
  currency: string;
  timestamp: string;
  flagReason: string;
  riskScore: number;
  riskFactors: string[];
  status: 'pending_review' | 'investigating' | 'resolved' | 'escalated';
  assignedTo?: string;
  notes?: string[];
  auditTrail: Array<{
    action: string;
    userId: string;
    timestamp: string;
    note?: string;
  }>;
}

export enum AuditAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  EXPORT = 'EXPORT',
  VIEW = 'VIEW',
  ASSIGN = 'ASSIGN'
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  userRole: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  timestamp: string;
  ipAddress: string;
  userAgent?: string;
  changes?: Record<string, { old: any; new: any }>;
  metadata?: Record<string, any>;
}

export enum ReportType {
  KYC_SUMMARY = 'kyc_summary',
  TRANSACTION_MONITORING = 'transaction_monitoring',
  SAR_FILING = 'sar_filing',
  CTR_FILING = 'ctr_filing',
  RISK_ASSESSMENT = 'risk_assessment',
  COMPLIANCE_REVIEW = 'compliance_review'
}

export interface ComplianceReport {
  id: string;
  type: ReportType;
  title: string;
  period: {
    start: string;
    end: string;
  };
  generatedBy: string;
  generatedAt: string;
  status: 'draft' | 'generated' | 'submitted' | 'archived';
  downloadUrl?: string;
  metrics: Record<string, number>;
  findings?: string[];
  recommendations?: string[];
}