import { 
  KYCApplication, 
  KYCStatus, 
  RiskLevel,
  FlaggedTransaction,
  AuditLog,
  AuditAction,
  ComplianceReport,
  ReportType
} from './types';

export const MOCK_KYC_APPLICATIONS: KYCApplication[] = [
  {
    id: 'KYC-001',
    customerId: 'CUST-1001',
    customerName: 'John Smith',
    customerType: 'individual',
    submittedAt: '2024-01-15T09:30:00Z',
    status: KYCStatus.PENDING,
    riskLevel: RiskLevel.HIGH,
    riskScore: 72,
    documents: [
      { type: 'passport', status: 'verified', url: 'https://example.com/doc1.pdf' },
      { type: 'proof_of_address', status: 'pending', url: 'https://example.com/doc2.pdf' },
      { type: 'bank_statement', status: 'pending' }
    ],
    assignedTo: 'Sarah Johnson',
    lastReviewedAt: '2024-01-16T14:20:00Z',
    notes: 'High-risk due to PEP status'
  },
  {
    id: 'KYC-002',
    customerId: 'CUST-1002',
    customerName: 'TechCorp Inc.',
    customerType: 'business',
    submittedAt: '2024-01-14T11:15:00Z',
    status: KYCStatus.PENDING,
    riskLevel: RiskLevel.MEDIUM,
    riskScore: 45,
    documents: [
      { type: 'certificate_of_incorporation', status: 'verified' },
      { type: 'articles_of_association', status: 'verified' },
      { type: 'director_ids', status: 'pending' }
    ],
    assignedTo: 'Mike Chen'
  },
  {
    id: 'KYC-003',
    customerId: 'CUST-1003',
    customerName: 'Maria Rodriguez',
    customerType: 'individual',
    submittedAt: '2024-01-13T16:45:00Z',
    status: KYCStatus.PENDING,
    riskLevel: RiskLevel.CRITICAL,
    riskScore: 88,
    documents: [
      { type: 'drivers_license', status: 'pending' },
      { type: 'utility_bill', status: 'rejected', url: 'https://example.com/doc3.pdf' }
    ],
    notes: 'Sanctions list match - requires escalation'
  },
  {
    id: 'KYC-004',
    customerId: 'CUST-1004',
    customerName: 'Global Trading LLC',
    customerType: 'business',
    submittedAt: '2024-01-12T10:20:00Z',
    status: KYCStatus.UNDER_REVIEW,
    riskLevel: RiskLevel.HIGH,
    riskScore: 75,
    documents: [
      { type: 'business_license', status: 'verified' },
      { type: 'tax_certificate', status: 'pending' },
      { type: 'ownership_structure', status: 'pending' },
      { type: 'financial_statements', status: 'pending' }
    ],
    assignedTo: 'Robert Kim',
    lastReviewedAt: '2024-01-13T09:15:00Z'
  },
  {
    id: 'KYC-005',
    customerId: 'CUST-1005',
    customerName: 'David Wilson',
    customerType: 'individual',
    submittedAt: '2024-01-11T14:30:00Z',
    status: KYCStatus.PENDING,
    riskLevel: RiskLevel.LOW,
    riskScore: 25,
    documents: [
      { type: 'passport', status: 'verified' },
      { type: 'proof_of_address', status: 'verified' }
    ]
  },
  {
    id: 'KYC-006',
    customerId: 'CUST-1006',
    customerName: 'EcoEnergy Solutions',
    customerType: 'business',
    submittedAt: '2024-01-10T08:45:00Z',
    status: KYCStatus.APPROVED,
    riskLevel: RiskLevel.LOW,
    riskScore: 18,
    documents: [
      { type: 'certificate_of_incorporation', status: 'verified' },
      { type: 'director_ids', status: 'verified' },
      { type: 'financial_statements', status: 'verified' }
    ],
    assignedTo: 'Sarah Johnson',
    lastReviewedAt: '2024-01-10T15:20:00Z'
  },
  {
    id: 'KYC-007',
    customerId: 'CUST-1007',
    customerName: 'Lisa Wong',
    customerType: 'individual',
    submittedAt: '2024-01-09T13:20:00Z',
    status: KYCStatus.REJECTED,
    riskLevel: RiskLevel.CRITICAL,
    riskScore: 92,
    documents: [
      { type: 'passport', status: 'verified' },
      { type: 'proof_of_address', status: 'rejected' }
    ],
    assignedTo: 'Mike Chen',
    lastReviewedAt: '2024-01-09T16:45:00Z',
    notes: 'Document forgery detected'
  }
];

export const MOCK_FLAGGED_TRANSACTIONS: FlaggedTransaction[] = [
  {
    id: 'TRX-001',
    transactionId: 'TXN-5X8Y9Z',
    customerId: 'CUST-2001',
    customerName: 'James Anderson',
    amount: 892500, // Approximately 125,000 USD to CNY
    currency: 'CNY',
    timestamp: '2024-01-15T08:45:00Z',
    flagReason: 'Unusual large transaction amount inconsistent with customer profile',
    riskScore: 85,
    riskFactors: ['High Amount', 'Unusual Pattern', 'Geographic Risk'],
    status: 'pending_review',
    assignedTo: 'Sarah Johnson',
    notes: ['Transaction to high-risk jurisdiction'],
    auditTrail: [
      {
        action: 'flagged_by_system',
        userId: 'system',
        timestamp: '2024-01-15T08:50:00Z',
        note: 'Auto-flagged by transaction monitoring system'
      }
    ]
  },
  {
    id: 'TRX-002',
    transactionId: 'TXN-A2B3C4',
    customerId: 'CUST-2002',
    customerName: 'Global Imports Ltd.',
    amount: 624875, // Approximately 87,500 EUR to CNY
    currency: 'CNY',
    timestamp: '2024-01-14T14:20:00Z',
    flagReason: 'Structuring attempt detected - multiple just-below-threshold transfers',
    riskScore: 78,
    riskFactors: ['Structuring', 'Multiple Transactions', 'CTR Avoidance'],
    status: 'investigating',
    assignedTo: 'Robert Kim',
    notes: ['Pattern matches known money laundering typology', 'Requires enhanced due diligence'],
    auditTrail: [
      {
        action: 'flagged_by_system',
        userId: 'system',
        timestamp: '2024-01-14T14:25:00Z'
      },
      {
        action: 'assigned_to_analyst',
        userId: 'admin001',
        timestamp: '2024-01-14T15:30:00Z',
        note: 'Assigned to senior investigator'
      }
    ]
  },
  {
    id: 'TRX-003',
    transactionId: 'TXN-D5E6F7',
    customerId: 'CUST-2003',
    customerName: 'Maria Garcia',
    amount: 447500, // Approximately 50,000 GBP to CNY
    currency: 'CNY',
    timestamp: '2024-01-13T11:15:00Z',
    flagReason: 'Transaction to high-risk jurisdiction (OFAC-sanctioned country)',
    riskScore: 95,
    riskFactors: ['Sanctioned Jurisdiction', 'High Risk Country', 'PEP Connection'],
    status: 'pending_review',
    notes: ['Immediate freeze recommended', 'SAR filing required'],
    auditTrail: [
      {
        action: 'flagged_by_system',
        userId: 'system',
        timestamp: '2024-01-13T11:20:00Z',
        note: 'Destination country on sanctions list'
      }
    ]
  },
  {
    id: 'TRX-004',
    transactionId: 'TXN-G8H9I0',
    customerId: 'CUST-2004',
    customerName: 'TechStart Innovations',
    amount: 21000000, // Approximately 12,000 USD to MWK
    currency: 'MWK',
    timestamp: '2024-01-12T16:40:00Z',
    flagReason: 'Unusual transaction pattern for new business account',
    riskScore: 65,
    riskFactors: ['New Account', 'Unusual Activity', 'Business Type Mismatch'],
    status: 'resolved',
    assignedTo: 'Mike Chen',
    notes: ['Verified as legitimate business expense', 'Customer provided supporting documentation'],
    auditTrail: [
      {
        action: 'flagged_by_system',
        userId: 'system',
        timestamp: '2024-01-12T16:45:00Z'
      },
      {
        action: 'investigation_completed',
        userId: 'mike.chen',
        timestamp: '2024-01-12T17:30:00Z',
        note: 'No suspicious activity found - legitimate transaction'
      },
      {
        action: 'resolved',
        userId: 'mike.chen',
        timestamp: '2024-01-12T17:35:00Z'
      }
    ]
  },
  {
    id: 'TRX-005',
    transactionId: 'TXN-J1K2L3',
    customerId: 'CUST-2005',
    customerName: 'Thomas Wilson',
    amount: 166250000, // Approximately 95,000 USD to MWK
    currency: 'MWK',
    timestamp: '2024-01-11T09:25:00Z',
    flagReason: 'Rapid movement of funds through multiple accounts',
    riskScore: 88,
    riskFactors: ['Layering', 'Multiple Accounts', 'Rapid Movement'],
    status: 'escalated',
    assignedTo: 'Sarah Johnson',
    notes: ['Escalated to compliance officer', 'Law enforcement notification pending'],
    auditTrail: [
      {
        action: 'flagged_by_system',
        userId: 'system',
        timestamp: '2024-01-11T09:30:00Z'
      },
      {
        action: 'escalated',
        userId: 'sarah.johnson',
        timestamp: '2024-01-11T10:15:00Z',
        note: 'Pattern consistent with money laundering - escalating to legal'
      }
    ]
  },
  {
    id: 'TRX-006',
    transactionId: 'TXN-M4N5O6',
    customerId: 'CUST-2006',
    customerName: 'Luxury Goods Trading',
    amount: 321075000, // Approximately 45,000 EUR to MWK
    currency: 'MWK',
    timestamp: '2024-01-10T13:50:00Z',
    flagReason: 'Cash-intensive business with inconsistent transaction patterns',
    riskScore: 72,
    riskFactors: ['Cash Business', 'Inconsistent Patterns', 'High Risk Industry'],
    status: 'investigating',
    assignedTo: 'Robert Kim',
    auditTrail: [
      {
        action: 'flagged_by_system',
        userId: 'system',
        timestamp: '2024-01-10T13:55:00Z'
      },
      {
        action: 'assigned_to_analyst',
        userId: 'admin001',
        timestamp: '2024-01-10T14:10:00Z'
      }
    ]
  }
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'AUDIT-001',
    userId: 'user001',
    userEmail: 'sarah.johnson@bank.com',
    userRole: 'Compliance Officer',
    action: AuditAction.LOGIN,
    resourceType: 'auth',
    resourceId: 'session-001',
    timestamp: '2024-01-15T08:30:00Z',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
  },
  {
    id: 'AUDIT-002',
    userId: 'user002',
    userEmail: 'mike.chen@bank.com',
    userRole: 'KYC Analyst',
    action: AuditAction.APPROVE,
    resourceType: 'kyc_application',
    resourceId: 'KYC-006',
    timestamp: '2024-01-15T09:15:00Z',
    ipAddress: '192.168.1.101',
    changes: {
      status: { old: 'under_review', new: 'approved' }
    },
    metadata: { approvalNotes: 'All documents verified, low risk profile' }
  },
  {
    id: 'AUDIT-003',
    userId: 'user001',
    userEmail: 'sarah.johnson@bank.com',
    userRole: 'Compliance Officer',
    action: AuditAction.UPDATE,
    resourceType: 'flagged_transaction',
    resourceId: 'TRX-005',
    timestamp: '2024-01-15T10:30:00Z',
    ipAddress: '192.168.1.100',
    changes: {
      status: { old: 'investigating', new: 'escalated' },
      assignedTo: { old: null, new: 'sarah.johnson' }
    },
    metadata: { escalationReason: 'Pattern consistent with money laundering' }
  },
  {
    id: 'AUDIT-004',
    userId: 'user003',
    userEmail: 'robert.kim@bank.com',
    userRole: 'Senior Investigator',
    action: AuditAction.CREATE,
    resourceType: 'compliance_report',
    resourceId: 'REPORT-Q1-2024',
    timestamp: '2024-01-14T14:45:00Z',
    ipAddress: '192.168.1.102'
  },
  {
    id: 'AUDIT-005',
    userId: 'admin001',
    userEmail: 'admin@bank.com',
    userRole: 'System Administrator',
    action: AuditAction.EXPORT,
    resourceType: 'audit_logs',
    resourceId: 'export-001',
    timestamp: '2024-01-14T16:20:00Z',
    ipAddress: '192.168.1.200',
    metadata: { exportFormat: 'CSV', recordCount: 1250 }
  },
  {
    id: 'AUDIT-006',
    userId: 'user002',
    userEmail: 'mike.chen@bank.com',
    userRole: 'KYC Analyst',
    action: AuditAction.REJECT,
    resourceType: 'kyc_application',
    resourceId: 'KYC-007',
    timestamp: '2024-01-13T11:30:00Z',
    ipAddress: '192.168.1.101',
    changes: {
      status: { old: 'under_review', new: 'rejected' }
    },
    metadata: { rejectionReason: 'Document forgery detected' }
  },
  {
    id: 'AUDIT-007',
    userId: 'user004',
    userEmail: 'lisa.wang@bank.com',
    userRole: 'Auditor',
    action: AuditAction.VIEW,
    resourceType: 'risk_assessment',
    resourceId: 'RISK-2024-Q1',
    timestamp: '2024-01-12T15:45:00Z',
    ipAddress: '192.168.1.103'
  },
  {
    id: 'AUDIT-008',
    userId: 'user001',
    userEmail: 'sarah.johnson@bank.com',
    userRole: 'Compliance Officer',
    action: AuditAction.UPDATE,
    resourceType: 'customer_profile',
    resourceId: 'CUST-1001',
    timestamp: '2024-01-12T09:20:00Z',
    ipAddress: '192.168.1.100',
    changes: {
      riskLevel: { old: 'medium', new: 'high' },
      monitoringLevel: { old: 'standard', new: 'enhanced' }
    }
  },
  {
    id: 'AUDIT-009',
    userId: 'user003',
    userEmail: 'robert.kim@bank.com',
    userRole: 'Senior Investigator',
    action: AuditAction.LOGOUT,
    resourceType: 'auth',
    resourceId: 'session-003',
    timestamp: '2024-01-11T18:00:00Z',
    ipAddress: '192.168.1.102'
  },
  {
    id: 'AUDIT-010',
    userId: 'admin001',
    userEmail: 'admin@bank.com',
    userRole: 'System Administrator',
    action: AuditAction.DELETE,
    resourceType: 'user_session',
    resourceId: 'session-expired-001',
    timestamp: '2024-01-10T10:15:00Z',
    ipAddress: '192.168.1.200',
    metadata: { reason: 'Session expired cleanup' }
  },
  {
    id: 'AUDIT-011',
    userId: 'user002',
    userEmail: 'mike.chen@bank.com',
    userRole: 'KYC Analyst',
    action: AuditAction.ASSIGN,
    resourceType: 'kyc_application',
    resourceId: 'KYC-002',
    timestamp: '2024-01-09T14:30:00Z',
    ipAddress: '192.168.1.101',
    changes: {
      assignedTo: { old: null, new: 'mike.chen' }
    }
  }
];

export const MOCK_COMPLIANCE_REPORTS: ComplianceReport[] = [
  {
    id: 'REPORT-001',
    type: ReportType.KYC_SUMMARY,
    title: 'Q4 2023 KYC Compliance Report',
    period: {
      start: '2023-10-01T00:00:00Z',
      end: '2023-12-31T23:59:59Z'
    },
    generatedBy: 'Sarah Johnson',
    generatedAt: '2024-01-05T14:30:00Z',
    status: 'submitted',
    downloadUrl: '/reports/kyc-q4-2023.pdf',
    metrics: {
      totalApplications: 1245,
      pendingReview: 45,
      approved: 1102,
      rejected: 98,
      averageProcessingTime: 2.5,
      highRiskApplications: 67
    },
    findings: [
      '10% increase in PEP customer applications',
      'Improved document verification time by 15%',
      '3 false positives in sanction screening'
    ],
    recommendations: [
      'Enhance PEP screening procedures',
      'Implement automated document verification',
      'Update risk scoring algorithm'
    ]
  },
  {
    id: 'REPORT-002',
    type: ReportType.TRANSACTION_MONITORING,
    title: 'January 2024 Transaction Monitoring Report',
    period: {
      start: '2024-01-01T00:00:00Z',
      end: '2024-01-31T23:59:59Z'
    },
    generatedBy: 'Robert Kim',
    generatedAt: '2024-01-10T10:15:00Z',
    status: 'generated',
    downloadUrl: '/reports/tm-jan-2024.pdf',
    metrics: {
      totalTransactions: 125000,
      flaggedTransactions: 156,
      investigationsOpened: 45,
      investigationsClosed: 32,
      sarFilings: 3,
      ctrFilings: 28
    },
    findings: [
      'Increased structuring attempts detected',
      'High volume of transactions to jurisdiction X',
      'Improved detection of new typologies'
    ]
  },
  {
    id: 'REPORT-003',
    type: ReportType.SAR_FILING,
    title: 'Suspicious Activity Report - Case 2024-001',
    period: {
      start: '2024-01-01T00:00:00Z',
      end: '2024-01-15T23:59:59Z'
    },
    generatedBy: 'Sarah Johnson',
    generatedAt: '2024-01-16T11:45:00Z',
    status: 'submitted',
    downloadUrl: '/reports/sar-2024-001.pdf',
    metrics: {
      subjectsInvolved: 2,
      transactionCount: 12,
      totalAmount: 450000,
      jurisdictions: 3,
      relatedAccounts: 4
    },
    findings: [
      'Complex layering scheme detected',
      'Multiple shell companies involved',
      'Cross-border money movement patterns'
    ],
    recommendations: [
      'Submit to FinCEN',
      'Coordinate with international partners',
      'Monitor related accounts'
    ]
  },
  {
    id: 'REPORT-004',
    type: ReportType.RISK_ASSESSMENT,
    title: 'Annual Enterprise Risk Assessment 2024',
    period: {
      start: '2023-01-01T00:00:00Z',
      end: '2023-12-31T23:59:59Z'
    },
    generatedBy: 'Compliance Committee',
    generatedAt: '2024-01-20T09:30:00Z',
    status: 'draft',
    metrics: {
      overallRiskScore: 62,
      regulatoryRisk: 75,
      operationalRisk: 58,
      reputationalRisk: 45,
      financialRisk: 55,
      riskMitigationCoverage: 82
    },
    findings: [
      'Regulatory changes pose highest risk',
      'Need to enhance AML training programs',
      'Technology infrastructure requires upgrades'
    ],
    recommendations: [
      'Hire additional compliance staff',
      'Implement new monitoring tools',
      'Conduct quarterly risk assessments'
    ]
  },
  {
    id: 'REPORT-005',
    type: ReportType.CTR_FILING,
    title: 'Currency Transaction Report - Week 02 2024',
    period: {
      start: '2024-01-08T00:00:00Z',
      end: '2024-01-14T23:59:59Z'
    },
    generatedBy: 'Mike Chen',
    generatedAt: '2024-01-15T16:20:00Z',
    status: 'submitted',
    downloadUrl: '/reports/ctr-week02-2024.pdf',
    metrics: {
      totalCTRs: 18,
      totalAmount: 1250000,
      averageTransaction: 69444,
      businessCustomers: 12,
      individualCustomers: 6
    }
  },
  {
    id: 'REPORT-006',
    type: ReportType.COMPLIANCE_REVIEW,
    title: 'Regulatory Compliance Audit - Q1 2024',
    period: {
      start: '2024-01-01T00:00:00Z',
      end: '2024-03-31T23:59:59Z'
    },
    generatedBy: 'External Auditor',
    generatedAt: '2024-01-25T13:45:00Z',
    status: 'archived',
    downloadUrl: '/reports/audit-q1-2024.pdf',
    metrics: {
      auditScore: 88,
      findingsCount: 7,
      criticalFindings: 1,
      recommendations: 12,
      complianceRate: 92
    },
    findings: [
      'Minor deficiencies in record keeping',
      'Need to update compliance policies',
      'One critical finding in transaction monitoring'
    ]
  }
];

// Additional mock data for testing edge cases
export const MOCK_EMPTY_KYC_APPLICATIONS: KYCApplication[] = [];
export const MOCK_EMPTY_TRANSACTIONS: FlaggedTransaction[] = [];
export const MOCK_EMPTY_AUDIT_LOGS: AuditLog[] = [];
export const MOCK_EMPTY_REPORTS: ComplianceReport[] = [];

// Summary statistics for quick reference
export const MOCK_SUMMARY_STATS = {
  totalKYCApplications: MOCK_KYC_APPLICATIONS.length,
  pendingKYCApplications: MOCK_KYC_APPLICATIONS.filter(app => app.status === KYCStatus.PENDING).length,
  totalFlaggedTransactions: MOCK_FLAGGED_TRANSACTIONS.length,
  pendingInvestigations: MOCK_FLAGGED_TRANSACTIONS.filter(tx => 
    tx.status === 'pending_review' || tx.status === 'investigating'
  ).length,
  totalAuditLogs: MOCK_AUDIT_LOGS.length,
  totalComplianceReports: MOCK_COMPLIANCE_REPORTS.length
};

// Mock user assignments for dropdowns
export const MOCK_COMPLIANCE_USERS = [
  { id: 'user001', name: 'Sarah Johnson', role: 'Compliance Officer' },
  { id: 'user002', name: 'Mike Chen', role: 'KYC Analyst' },
  { id: 'user003', name: 'Robert Kim', role: 'Senior Investigator' },
  { id: 'user004', name: 'Lisa Wang', role: 'Auditor' },
  { id: 'user005', name: 'David Miller', role: 'Risk Analyst' }
];

// Mock risk factors for dropdowns
export const MOCK_RISK_FACTORS = [
  'High Amount',
  'Unusual Pattern',
  'Geographic Risk',
  'Sanctioned Jurisdiction',
  'PEP Connection',
  'Structuring',
  'Multiple Transactions',
  'CTR Avoidance',
  'Layering',
  'Rapid Movement',
  'Cash Business',
  'High Risk Industry',
  'New Account',
  'Business Type Mismatch',
  'Third Party Involvement',
  'Offshore Transactions'
];