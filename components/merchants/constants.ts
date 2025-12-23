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

// Main mock merchants data
export const MOCK_MERCHANTS: Merchant[] = [
  {
    id: "M-1001",
    businessName: "TechGadgets Inc.",
    legalType: "Private Limited Company",
    registrationNumber: "CORP-2023-001",
    taxId: "TAX-001-234567",
    address: "123 Silicon Valley, San Francisco, CA 94105, USA",
    contact: "John Smith",
    phone: "+1 (555) 123-4567",
    email: "john.smith@techgadgets.com",
    category: "E-commerce",
    registrationDate: "2023-10-15T14:30:00Z",
    verificationStatus: "approved",
    accountStatus: "active",
    riskScore: 12,
    transactionVolume: 1250000,
    settlementBalance: 45000,
    documents: [
      {
        type: "Business Registration Certificate",
        url: "/documents/merchants/certificate-1001.jpg",
        status: "verified",
        submittedAt: "2023-10-15T14:35:00Z"
      },
      {
        type: "Tax Registration",
        url: "/documents/merchants/tax-1001.jpg",
        status: "verified",
        submittedAt: "2023-10-15T14:40:00Z"
      }
    ],
    auditLogs: [
      {
        id: "LOG-1001-1",
        action: "VERIFICATION_APPROVED",
        adminId: "ADMIN-01",
        timestamp: "2023-10-16T10:00:00Z",
        reason: "All documents verified"
      }
    ],
    owners: [
      {
        name: "John Smith",
        email: "john.smith@techgadgets.com",
        phone: "+1 (555) 123-4567",
        ownershipPercentage: 100
      }
    ],
    bankAccounts: [
      {
        id: "BANK-1001-1",
        bankName: "Chase Bank",
        accountNumber: "****1234",
        accountHolder: "TechGadgets Inc.",
        currency: "USD",
        isPrimary: true
      }
    ]
  },
  {
    id: "M-1002",
    businessName: "Urban Bites Restaurant",
    legalType: "Limited Liability Company (LLC)",
    registrationNumber: "LLC-2023-045",
    taxId: "TAX-002-765432",
    address: "45 Food Street, New York, NY 10001, USA",
    contact: "Maria Garcia",
    phone: "+1 (555) 987-6543",
    email: "maria@urbanbites.com",
    category: "Food & Beverage",
    registrationDate: "2023-10-18T09:15:00Z",
    verificationStatus: "pending",
    accountStatus: "active",
    riskScore: 45,
    transactionVolume: 85000,
    settlementBalance: 12500,
    documents: [
      {
        type: "Business License",
        url: "/documents/merchants/license-1002.jpg",
        status: "unverified",
        submittedAt: "2023-10-18T09:20:00Z"
      },
      {
        type: "Health Permit",
        url: "/documents/merchants/health-1002.jpg",
        status: "unverified",
        submittedAt: "2023-10-18T09:25:00Z"
      }
    ],
    auditLogs: [],
    owners: [
      {
        name: "Maria Garcia",
        email: "maria@urbanbites.com",
        phone: "+1 (555) 987-6543",
        ownershipPercentage: 60
      },
      {
        name: "Robert Chen",
        email: "robert@urbanbites.com",
        phone: "+1 (555) 876-5432",
        ownershipPercentage: 40
      }
    ],
    bankAccounts: [
      {
        id: "BANK-1002-1",
        bankName: "Bank of America",
        accountNumber: "****5678",
        accountHolder: "Urban Bites LLC",
        currency: "USD",
        isPrimary: true
      }
    ]
  },
  {
    id: "M-1003",
    businessName: "Global Travel Agency",
    legalType: "Corporation",
    registrationNumber: "CORP-2023-102",
    taxId: "TAX-003-112233",
    address: "789 Travel Avenue, Miami, FL 33101, USA",
    contact: "Ahmed Hassan",
    phone: "+1 (555) 555-1212",
    email: "ahmed@globaltravel.com",
    category: "Travel & Hospitality",
    registrationDate: "2023-11-01T11:00:00Z",
    verificationStatus: "rejected",
    accountStatus: "suspended",
    riskScore: 88,
    transactionVolume: 250000,
    settlementBalance: 0,
    documents: [
      {
        type: "Business Registration",
        url: "/documents/merchants/reg-1003.jpg",
        status: "unverified",
        submittedAt: "2023-11-01T11:05:00Z"
      }
    ],
    auditLogs: [
      {
        id: "LOG-1003-1",
        action: "VERIFICATION_REJECTED",
        adminId: "ADMIN-02",
        timestamp: "2023-11-02T10:00:00Z",
        reason: "Incomplete documentation"
      },
      {
        id: "LOG-1003-2",
        action: "ACCOUNT_SUSPENDED",
        adminId: "ADMIN-02",
        timestamp: "2023-11-02T10:01:00Z",
        reason: "High risk score"
      }
    ],
    owners: [
      {
        name: "Ahmed Hassan",
        email: "ahmed@globaltravel.com",
        phone: "+1 (555) 555-1212",
        ownershipPercentage: 100
      }
    ],
    bankAccounts: [
      {
        id: "BANK-1003-1",
        bankName: "Wells Fargo",
        accountNumber: "****9012",
        accountHolder: "Global Travel Agency Corp",
        currency: "USD",
        isPrimary: true
      }
    ]
  },
  {
    id: "M-1004",
    businessName: "CloudSync Solutions",
    legalType: "Private Limited Company",
    registrationNumber: "CORP-2023-156",
    taxId: "TAX-004-445566",
    address: "13 Tech Hub, Seattle, WA 98101, USA",
    contact: "Sarah Johnson",
    phone: "+1 (555) 333-4444",
    email: "sarah@cloudsync.com",
    category: "SaaS",
    registrationDate: "2023-11-05T16:20:00Z",
    verificationStatus: "pending",
    accountStatus: "active",
    riskScore: 5,
    transactionVolume: 500000,
    settlementBalance: 75000,
    documents: [
      {
        type: "Certificate of Incorporation",
        url: "/documents/merchants/incorporation-1004.jpg",
        status: "unverified",
        submittedAt: "2023-11-05T16:25:00Z"
      }
    ],
    auditLogs: [],
    owners: [
      {
        name: "Sarah Johnson",
        email: "sarah@cloudsync.com",
        phone: "+1 (555) 333-4444",
        ownershipPercentage: 70
      },
      {
        name: "Michael Lee",
        email: "michael@cloudsync.com",
        phone: "+1 (555) 222-3333",
        ownershipPercentage: 30
      }
    ],
    bankAccounts: [
      {
        id: "BANK-1004-1",
        bankName: "Silicon Valley Bank",
        accountNumber: "****3456",
        accountHolder: "CloudSync Solutions Ltd",
        currency: "USD",
        isPrimary: true
      }
    ]
  },
  {
    id: "M-1005",
    businessName: "Eco-Friendly Retail",
    legalType: "Sole Proprietorship",
    registrationNumber: "SP-2023-023",
    taxId: "TAX-005-778899",
    address: "55 Green Street, Portland, OR 97201, USA",
    contact: "Emma Wilson",
    phone: "+1 (555) 666-7777",
    email: "emma@eco-friendly.com",
    category: "Retail",
    registrationDate: "2023-09-20T10:00:00Z",
    verificationStatus: "approved",
    accountStatus: "active",
    riskScore: 2,
    transactionVolume: 150000,
    settlementBalance: 28000,
    documents: [
      {
        type: "Business Registration",
        url: "/documents/merchants/reg-1005.jpg",
        status: "verified",
        submittedAt: "2023-09-20T10:05:00Z"
      },
      {
        type: "Sales Tax Permit",
        url: "/documents/merchants/tax-permit-1005.jpg",
        status: "verified",
        submittedAt: "2023-09-20T10:10:00Z"
      }
    ],
    auditLogs: [],
    owners: [
      {
        name: "Emma Wilson",
        email: "emma@eco-friendly.com",
        phone: "+1 (555) 666-7777",
        ownershipPercentage: 100
      }
    ],
    bankAccounts: [
      {
        id: "BANK-1005-1",
        bankName: "US Bank",
        accountNumber: "****7890",
        accountHolder: "Emma Wilson",
        currency: "USD",
        isPrimary: true
      }
    ]
  },
  {
    id: "M-1006",
    businessName: "MediCare Clinic",
    legalType: "Partnership",
    registrationNumber: "PART-2023-067",
    taxId: "TAX-006-990011",
    address: "101 Health Avenue, Chicago, IL 60601, USA",
    contact: "Dr. James Miller",
    phone: "+1 (555) 444-5555",
    email: "admin@medicareclinic.com",
    category: "Healthcare",
    registrationDate: "2023-12-01T08:30:00Z",
    verificationStatus: "approved",
    accountStatus: "active",
    riskScore: 8,
    transactionVolume: 75000,
    settlementBalance: 15000,
    documents: [
      {
        type: "Medical License",
        url: "/documents/merchants/medical-license-1006.jpg",
        status: "verified",
        submittedAt: "2023-12-01T08:35:00Z"
      },
      {
        type: "Business Registration",
        url: "/documents/merchants/reg-1006.jpg",
        status: "verified",
        submittedAt: "2023-12-01T08:40:00Z"
      }
    ],
    auditLogs: [],
    owners: [
      {
        name: "Dr. James Miller",
        email: "james@medicareclinic.com",
        phone: "+1 (555) 444-5555",
        ownershipPercentage: 50
      },
      {
        name: "Dr. Lisa Brown",
        email: "lisa@medicareclinic.com",
        phone: "+1 (555) 333-4444",
        ownershipPercentage: 50
      }
    ],
    bankAccounts: [
      {
        id: "BANK-1006-1",
        bankName: "PNC Bank",
        accountNumber: "****2345",
        accountHolder: "MediCare Clinic Partnership",
        currency: "USD",
        isPrimary: true
      }
    ]
  },
  {
    id: "M-1007",
    businessName: "LearnEasy Online",
    legalType: "Private Limited Company",
    registrationNumber: "CORP-2023-189",
    taxId: "TAX-007-223344",
    address: "88 Education Road, Boston, MA 02101, USA",
    contact: "David Chen",
    phone: "+1 (555) 777-8888",
    email: "david@learneasy.com",
    category: "Education",
    registrationDate: "2023-12-05T09:45:00Z",
    verificationStatus: "pending",
    accountStatus: "active",
    riskScore: 60,
    transactionVolume: 30000,
    settlementBalance: 5000,
    documents: [],
    auditLogs: [],
    owners: [
      {
        name: "David Chen",
        email: "david@learneasy.com",
        phone: "+1 (555) 777-8888",
        ownershipPercentage: 100
      }
    ],
    bankAccounts: [
      {
        id: "BANK-1007-1",
        bankName: "TD Bank",
        accountNumber: "****6789",
        accountHolder: "LearnEasy Online Ltd",
        currency: "USD",
        isPrimary: true
      }
    ]
  },
  {
    id: "M-1008",
    businessName: "City Logistics",
    legalType: "Limited Liability Company (LLC)",
    registrationNumber: "LLC-2023-112",
    taxId: "TAX-008-556677",
    address: "22 Transport Street, Dallas, TX 75201, USA",
    contact: "Carlos Rodriguez",
    phone: "+1 (555) 999-0000",
    email: "carlos@citylogistics.com",
    category: "Transportation",
    registrationDate: "2023-11-20T14:15:00Z",
    verificationStatus: "rejected",
    accountStatus: "active",
    riskScore: 25,
    transactionVolume: 200000,
    settlementBalance: 32000,
    documents: [
      {
        type: "Business License",
        url: "/documents/merchants/license-1008.jpg",
        status: "unverified",
        submittedAt: "2023-11-20T14:20:00Z"
      }
    ],
    auditLogs: [
      {
        id: "LOG-1008-1",
        action: "VERIFICATION_REJECTED",
        adminId: "ADMIN-03",
        timestamp: "2023-11-21T11:30:00Z",
        reason: "Missing insurance documentation"
      }
    ],
    owners: [
      {
        name: "Carlos Rodriguez",
        email: "carlos@citylogistics.com",
        phone: "+1 (555) 999-0000",
        ownershipPercentage: 100
      }
    ],
    bankAccounts: [
      {
        id: "BANK-1008-1",
        bankName: "BBVA",
        accountNumber: "****1122",
        accountHolder: "City Logistics LLC",
        currency: "USD",
        isPrimary: true
      }
    ]
  }
];

// Simplified merchant list for the main table view
export const SIMPLIFIED_MERCHANTS = MOCK_MERCHANTS.map(merchant => ({
  id: merchant.id,
  businessName: merchant.businessName,
  registrationDate: merchant.registrationDate.split('T')[0],
  verificationStatus: merchant.verificationStatus,
  accountStatus: merchant.accountStatus,
  category: merchant.category,
  contact: merchant.contact,
  email: merchant.email,
  phone: merchant.phone,
  riskScore: merchant.riskScore
}));

// Helper function to find merchant by ID
export const findMerchantById = (id: string): Merchant | undefined => {
  return MOCK_MERCHANTS.find(merchant => merchant.id === id);
};

// Helper function to generate simple mock data
export const generateSimpleMerchants = (count: number = 56) => {
  const categories = MERCHANT_CATEGORIES;
  const statuses: Merchant["verificationStatus"][] = ["pending", "approved", "rejected"];
  const accounts: Merchant["accountStatus"][] = ["active", "suspended"];
  
  return Array.from({ length: count }).map((_, i) => {
    const merchantIndex = i % MOCK_MERCHANTS.length;
    const merchant = MOCK_MERCHANTS[merchantIndex];
    
    // Use the actual merchant data if available, otherwise generate generic data
    if (merchantIndex < MOCK_MERCHANTS.length) {
      return {
        id: merchant.id,
        businessName: merchant.businessName,
        registrationDate: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
        verificationStatus: statuses[i % statuses.length],
        accountStatus: accounts[i % accounts.length],
        category: merchant.category,
        contact: merchant.contact,
        email: merchant.email,
        phone: merchant.phone,
        riskScore: merchant.riskScore
      };
    } else {
      // For indices beyond our mock data, generate generic merchants
      return {
        id: `M-${1000 + i}`,
        businessName: `Merchant ${i + 1}`,
        registrationDate: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
        verificationStatus: statuses[i % statuses.length],
        accountStatus: accounts[i % accounts.length],
        category: categories[i % categories.length],
        contact: `contact+${i}@example.com`,
        email: `merchant${i}@example.com`,
        phone: `+1 (555) ${1000 + i.toString().padStart(4, '0')}`,
        riskScore: Math.floor(Math.random() * 100)
      };
    }
  });
};


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

// Alternative: Create merchants by mixing real and generated data
export const generateMixedMerchants = (count: number = 56): SimplifiedMerchant[] => {
  const categories = MERCHANT_CATEGORIES;
  const statuses: Merchant["verificationStatus"][] = ["pending", "approved", "rejected"];
  const accounts: Merchant["accountStatus"][] = ["active", "suspended"];
  
  return Array.from({ length: count }).map((_, i) => {
    // Use real merchant data for first few entries, then generate
    if (i < MOCK_MERCHANTS.length) {
      const merchant = MOCK_MERCHANTS[i];
      return {
        id: merchant.id,
        businessName: merchant.businessName,
        registrationDate: merchant.registrationDate.split('T')[0],
        verificationStatus: statuses[i % statuses.length],
        accountStatus: accounts[i % accounts.length],
        category: merchant.category,
        contact: merchant.contact,
        email: merchant.email,
        phone: merchant.phone,
        riskScore: merchant.riskScore
      };
    }
    
    // Generate new merchants after the real ones
    const categoryIndex = i % categories.length;
    const businessTypes = ["Inc.", "LLC", "Corp", "Ltd", "Group", "Solutions", "Enterprises"];
    const businessNames = [
      "Tech", "Global", "Urban", "Prime", "Elite", "Premium", "Advanced",
      "Innovative", "Digital", "Smart", "NextGen", "Future", "Modern"
    ];
    const businessSuffixes = [
      "Technologies", "Systems", "Services", "Consulting", "Development",
      "Management", "Solutions", "Consultants", "Group", "Partners"
    ];
    
    const nameIndex1 = i % businessNames.length;
    const nameIndex2 = (i + 1) % businessSuffixes.length;
    const typeIndex = i % businessTypes.length;
    
    return {
      id: `M-${1000 + i}`,
      businessName: `${businessNames[nameIndex1]} ${businessSuffixes[nameIndex2]} ${businessTypes[typeIndex]}`,
      registrationDate: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
      verificationStatus: statuses[i % statuses.length],
      accountStatus: accounts[i % accounts.length],
      category: categories[categoryIndex],
      contact: `Contact ${i + 1}`,
      email: `contact${i}@example.com`,
      phone: `+1 (555) ${1000 + i.toString().padStart(4, '0')}`,
      riskScore: Math.floor(Math.random() * 100)
    };
  });
}