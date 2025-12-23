// app/constants/transactions.ts
import { type Transaction } from './types';

// Helper function to generate random names
const generateRandomName = () => {
  const firstNames = [
    'John', 'Emma', 'Michael', 'Sophia', 'William', 'Olivia', 'James', 'Ava', 
    'Robert', 'Isabella', 'David', 'Mia', 'Richard', 'Charlotte', 'Joseph', 'Amelia',
    'Thomas', 'Harper', 'Charles', 'Evelyn', 'Christopher', 'Abigail', 'Daniel', 'Emily',
    'Matthew', 'Elizabeth', 'Anthony', 'Sofia', 'Mark', 'Avery', 'Donald', 'Ella',
    'Steven', 'Madison', 'Paul', 'Scarlett', 'Andrew', 'Victoria', 'Joshua', 'Aria',
    'Kenneth', 'Grace', 'Kevin', 'Chloe', 'Brian', 'Camila', 'George', 'Penelope',
    'Edward', 'Riley', 'Ronald', 'Layla', 'Timothy', 'Lillian', 'Jason', 'Nora',
    'Jeffrey', 'Zoey', 'Ryan', 'Mila', 'Jacob', 'Aubrey', 'Gary', 'Hannah',
    'Nicholas', 'Lily', 'Eric', 'Addison', 'Jonathan', 'Eleanor', 'Stephen', 'Natalie',
    'Larry', 'Luna', 'Justin', 'Savannah', 'Scott', 'Brooklyn', 'Brandon', 'Leah',
    'Benjamin', 'Zoe', 'Samuel', 'Stella', 'Gregory', 'Hazel', 'Frank', 'Ellie',
    'Alexander', 'Paisley', 'Raymond', 'Audrey', 'Patrick', 'Skylar', 'Jack', 'Violet'
  ];
  
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
    'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
    'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
    'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
    'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
    'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
    'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy',
    'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey',
    'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson', 'Watson',
    'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza', 'Ruiz',
    'Hughes', 'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers', 'Long'
  ];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
};

// Helper function to generate merchant names
const generateMerchantName = () => {
  const businessTypes = ['Inc.', 'LLC', 'Corp', 'Ltd', 'Group', 'Solutions', 'Enterprises', '& Co.', 'Partners'];
  const businessNames = [
    'Tech', 'Global', 'Urban', 'Prime', 'Elite', 'Premium', 'Advanced', 'Innovative', 
    'Digital', 'Smart', 'NextGen', 'Future', 'Modern', 'Alpha', 'Beta', 'Gamma',
    'Omega', 'Sigma', 'Delta', 'Apex', 'Summit', 'Peak', 'Zenith', 'Vertex',
    'Pinnacle', 'Crest', 'Crown', 'Royal', 'Imperial', 'Noble', 'Grand', 'Mega',
    'Super', 'Ultra', 'Hyper', 'Quantum', 'Nano', 'Micro', 'Macro', 'Meso',
    'Solar', 'Lunar', 'Stellar', 'Galactic', 'Cosmic', 'Atomic', 'Molecular', 'Cellular',
    'Organic', 'Natural', 'Green', 'Eco', 'Sustainable', 'Renewable', 'Clean', 'Pure',
    'Crystal', 'Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze', 'Copper', 'Steel',
    'Iron', 'Titanium', 'Carbon', 'Silicon', 'Quantum', 'Neural', 'Cyber', 'Virtual'
  ];
  
  const businessSuffixes = [
    'Technologies', 'Systems', 'Services', 'Consulting', 'Development', 'Management',
    'Solutions', 'Consultants', 'Group', 'Partners', 'Holdings', 'Ventures', 'Capital',
    'Investments', 'Properties', 'Realty', 'Construction', 'Manufacturing', 'Production',
    'Distribution', 'Logistics', 'Supply', 'Retail', 'Wholesale', 'E-commerce', 'Marketplace',
    'Platform', 'Network', 'Connect', 'Exchange', 'Trade', 'Commerce', 'Business', 'Enterprise',
    'Corporation', 'Company', 'Firm', 'Agency', 'Bureau', 'Institute', 'Academy', 'University',
    'College', 'School', 'Center', 'Hub', 'Lab', 'Studio', 'Works', 'Factory', 'Mill'
  ];
  
  const name = businessNames[Math.floor(Math.random() * businessNames.length)];
  const suffix = businessSuffixes[Math.floor(Math.random() * businessSuffixes.length)];
  const type = businessTypes[Math.floor(Math.random() * businessTypes.length)];
  
  // 30% chance to include suffix
  if (Math.random() < 0.7) {
    return `${name} ${suffix} ${type}`;
  } else {
    return `${name} ${type}`;
  }
};

// Generate mock transactions
export const MOCK_TRANSACTIONS: Transaction[] = Array.from({ length: 200 }, (_, i) => {
  const currencies = ['MWK', 'CNY', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'ZAR'];
  const statuses = ['Completed', 'Pending', 'Failed'] as const;
  const statusWeights = [0.75, 0.20, 0.05]; // 75% completed, 20% pending, 5% failed
  
  // Weighted random status
  const random = Math.random();
  let statusIndex = 0;
  let cumulativeWeight = 0;
  for (let j = 0; j < statusWeights.length; j++) {
    cumulativeWeight += statusWeights[j];
    if (random < cumulativeWeight) {
      statusIndex = j;
      break;
    }
  }
  
  const status = statuses[statusIndex];
  
  // Generate realistic amounts based on currency
  const currency = currencies[Math.floor(Math.random() * currencies.length)];
  let minAmount = 100000;
  let maxAmount = 10000000;
  
  if (currency === 'MWK') {
    minAmount = 50000;
    maxAmount = 50000000; // MWK typically larger numbers
  } else if (currency === 'CNY') {
    minAmount = 1000;
    maxAmount = 1000000;
  } else if (currency === 'USD' || currency === 'EUR' || currency === 'GBP') {
    minAmount = 100;
    maxAmount = 100000;
  } else if (currency === 'JPY') {
    minAmount = 10000;
    maxAmount = 10000000;
  }
  
  const rawAmount = Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount;
  
  // Date within last 30 days with some clustering
  const daysAgo = Math.floor(Math.random() * 30);
  const hoursAgo = Math.floor(Math.random() * 24);
  const minutesAgo = Math.floor(Math.random() * 60);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  date.setMinutes(date.getMinutes() - minutesAgo);
  
  // Generate flagged transactions (approximately 5% flagged)
  const flagged = Math.random() < 0.05;
  
  // Generate realistic customer and merchant names
  const customer = generateRandomName();
  const merchant = generateMerchantName();
  
  return {
    id: `TXN-${String(100000 + i).padStart(6, '0')}`,
    customer,
    merchant,
    rawAmount,
    currency,
    status,
    date,
    flagged,
  };
});

// Generate additional mock data for specific testing scenarios
export const FLAGGED_TRANSACTIONS = MOCK_TRANSACTIONS.filter(tx => tx.flagged);
export const PENDING_TRANSACTIONS = MOCK_TRANSACTIONS.filter(tx => tx.status === 'Pending');
export const HIGH_VALUE_TRANSACTIONS = MOCK_TRANSACTIONS
  .filter(tx => tx.rawAmount > 5000000)
  .sort((a, b) => b.rawAmount - a.rawAmount);

// Helper function to get transaction by ID
export const findTransactionById = (id: string): Transaction | undefined => {
  return MOCK_TRANSACTIONS.find(tx => tx.id === id);
};

// Helper function to get transactions by customer
export const getTransactionsByCustomer = (customerName: string): Transaction[] => {
  return MOCK_TRANSACTIONS.filter(tx => 
    tx.customer.toLowerCase().includes(customerName.toLowerCase())
  );
};

// Helper function to get transactions by merchant
export const getTransactionsByMerchant = (merchantName: string): Transaction[] => {
  return MOCK_TRANSACTIONS.filter(tx => 
    tx.merchant.toLowerCase().includes(merchantName.toLowerCase())
  );
};

// Helper function to get recent transactions (last 7 days)
export const getRecentTransactions = (days = 7): Transaction[] => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  return MOCK_TRANSACTIONS.filter(tx => tx.date > cutoffDate);
};

// Helper function to get transaction statistics
export const getTransactionStats = () => {
  const total = MOCK_TRANSACTIONS.length;
  const flagged = MOCK_TRANSACTIONS.filter(tx => tx.flagged).length;
  const completed = MOCK_TRANSACTIONS.filter(tx => tx.status === 'Completed').length;
  const pending = MOCK_TRANSACTIONS.filter(tx => tx.status === 'Pending').length;
  const failed = MOCK_TRANSACTIONS.filter(tx => tx.status === 'Failed').length;
  
  const totalAmount = MOCK_TRANSACTIONS.reduce((sum, tx) => sum + tx.rawAmount, 0);
  const averageAmount = total > 0 ? totalAmount / total : 0;
  
  // Group by currency
  const byCurrency = MOCK_TRANSACTIONS.reduce((acc, tx) => {
    if (!acc[tx.currency]) {
      acc[tx.currency] = { count: 0, total: 0 };
    }
    acc[tx.currency].count++;
    acc[tx.currency].total += tx.rawAmount;
    return acc;
  }, {} as Record<string, { count: number; total: number }>);
  
  // Get top merchants by transaction count
  const merchantCounts = MOCK_TRANSACTIONS.reduce((acc, tx) => {
    acc[tx.merchant] = (acc[tx.merchant] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topMerchants = Object.entries(merchantCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([merchant, count]) => ({ merchant, count }));
  
  return {
    total,
    flagged,
    completed,
    pending,
    failed,
    totalAmount,
    averageAmount,
    byCurrency,
    topMerchants,
  };
};

// Currency conversion rates (simplified for mock purposes)
export const CURRENCY_RATES = {
  MWK: 1,
  CNY: 0.012, // 1 CNY = 0.012 MWK (simplified)
  USD: 0.00059, // 1 USD = 0.00059 MWK (simplified)
  EUR: 0.00055,
  GBP: 0.00047,
  JPY: 0.000088,
  AUD: 0.00039,
  CAD: 0.00041,
  CHF: 0.00054,
  ZAR: 0.000032,
};

// Helper function to convert amount to base currency (MWK)
export const convertToBaseCurrency = (amount: number, currency: string): number => {
  const rate = CURRENCY_RATES[currency as keyof typeof CURRENCY_RATES] || 1;
  return amount / rate;
};

// Helper function to get transactions with converted amounts
export const getTransactionsWithConvertedAmounts = (): Array<Transaction & { convertedAmount: number }> => {
  return MOCK_TRANSACTIONS.map(tx => ({
    ...tx,
    convertedAmount: convertToBaseCurrency(tx.rawAmount, tx.currency)
  }));
};