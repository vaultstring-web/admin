// app/constants/index.ts
import { Customer, KYCStatus, AccountStatus } from './types';

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-1001',
    firstName: 'Alex',
    lastName: 'Morgan',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 010-9988',
    registrationDate: '2023-10-15T14:30:00Z',
    kycStatus: KYCStatus.APPROVED,
    accountStatus: AccountStatus.ACTIVE,
    riskScore: 12,
    // Using placeholder images instead of external URLs for better Next.js compatibility
    avatarUrl: '/avatars/alex-morgan.jpg',
    address: { street: '123 Market St', city: 'San Francisco', country: 'USA', zip: '94105' },
    kycDocuments: [
      { type: 'Passport', url: '/documents/passport-101.jpg', status: 'verified', submittedAt: '2023-10-15T14:35:00Z' }
    ],
    auditLogs: []
  },
  {
    id: 'CUST-1002',
    firstName: 'Jordan',
    lastName: 'Lee',
    email: 'jordan.lee@example.com',
    phone: '+44 20 7123 4567',
    registrationDate: '2023-10-18T09:15:00Z',
    kycStatus: KYCStatus.PENDING,
    accountStatus: AccountStatus.ACTIVE,
    riskScore: 45,
    avatarUrl: '/avatars/jordan-lee.jpg',
    address: { street: '45 Oxford St', city: 'London', country: 'UK', zip: 'W1D 1BS' },
    kycDocuments: [
      { type: 'Driver License', url: '/documents/driver-license-102.jpg', status: 'unverified', submittedAt: '2023-10-18T09:20:00Z' }
    ],
    auditLogs: []
  },
  {
    id: 'CUST-1003',
    firstName: 'Casey',
    lastName: 'Smith',
    email: 'casey.smith@example.com',
    phone: '+1 (555) 012-3456',
    registrationDate: '2023-11-01T11:00:00Z',
    kycStatus: KYCStatus.REJECTED,
    accountStatus: AccountStatus.BLOCKED,
    riskScore: 88,
    avatarUrl: '/avatars/casey-smith.jpg',
    address: { street: '789 Broadway', city: 'New York', country: 'USA', zip: '10003' },
    kycDocuments: [
      { type: 'ID Card', url: '/documents/id-card-103.jpg', status: 'unverified', submittedAt: '2023-11-01T11:05:00Z' }
    ],
    auditLogs: [
      { id: 'LOG-1', action: 'KYC_REJECTED', adminId: 'ADMIN-01', timestamp: '2023-11-02T10:00:00Z', reason: 'Document blurry' },
      { id: 'LOG-2', action: 'ACCOUNT_BLOCKED', adminId: 'ADMIN-01', timestamp: '2023-11-02T10:01:00Z', reason: 'High risk score' }
    ]
  },
  {
    id: 'CUST-1004',
    firstName: 'Taylor',
    lastName: 'Swift',
    email: 'taylor.s@example.com',
    phone: '+1 (555) 098-7654',
    registrationDate: '2023-11-05T16:20:00Z',
    kycStatus: KYCStatus.PENDING,
    accountStatus: AccountStatus.ACTIVE,
    riskScore: 5,
    avatarUrl: '/avatars/taylor-swift.jpg',
    address: { street: '13 Cornelia St', city: 'New York', country: 'USA', zip: '10014' },
    kycDocuments: [
      { type: 'Passport', url: '/documents/passport-104.jpg', status: 'unverified', submittedAt: '2023-11-05T16:25:00Z' }
    ],
    auditLogs: []
  },
  {
    id: 'CUST-1005',
    firstName: 'Morgan',
    lastName: 'Freeman',
    email: 'm.freeman@example.com',
    phone: '+1 (555) 111-2222',
    registrationDate: '2023-09-20T10:00:00Z',
    kycStatus: KYCStatus.APPROVED,
    accountStatus: AccountStatus.ACTIVE,
    riskScore: 2,
    avatarUrl: '/avatars/morgan-freeman.jpg',
    address: { street: '555 Hollywood Blvd', city: 'Los Angeles', country: 'USA', zip: '90028' },
    kycDocuments: [],
    auditLogs: []
  },
  {
    id: 'CUST-1006',
    firstName: 'Priya',
    lastName: 'Patel',
    email: 'priya.patel@example.com',
    phone: '+91 98765 43210',
    registrationDate: '2023-12-01T08:30:00Z',
    kycStatus: KYCStatus.APPROVED,
    accountStatus: AccountStatus.ACTIVE,
    riskScore: 8,
    avatarUrl: '/avatars/priya-patel.jpg',
    address: { street: '12 Mahatma Gandhi Rd', city: 'Mumbai', country: 'India', zip: '400001' },
    kycDocuments: [],
    auditLogs: []
  },
  {
    id: 'CUST-1007',
    firstName: 'Chen',
    lastName: 'Wei',
    email: 'chen.wei@example.com',
    phone: '+86 138 0000 0000',
    registrationDate: '2023-12-05T09:45:00Z',
    kycStatus: KYCStatus.PENDING,
    accountStatus: AccountStatus.ACTIVE,
    riskScore: 60,
    avatarUrl: '/avatars/chen-wei.jpg',
    address: { street: '88 Nanjing Rd', city: 'Shanghai', country: 'China', zip: '200000' },
    kycDocuments: [],
    auditLogs: []
  },
  {
    id: 'CUST-1008',
    firstName: 'Hans',
    lastName: 'Mueller',
    email: 'hans.mueller@example.com',
    phone: '+49 30 123456',
    registrationDate: '2023-11-20T14:15:00Z',
    kycStatus: KYCStatus.REJECTED,
    accountStatus: AccountStatus.ACTIVE,
    riskScore: 25,
    avatarUrl: '/avatars/hans-mueller.jpg',
    address: { street: '10 Unter den Linden', city: 'Berlin', country: 'Germany', zip: '10117' },
    kycDocuments: [],
    auditLogs: []
  }
];