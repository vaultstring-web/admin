// app/types/transactions.ts
export interface Transaction {
  id: string;
  customer: string;
  merchant: string;
  rawAmount: number;
  currency: 'MWK' | 'CNY' | string;
  status: 'Completed' | 'Pending' | 'Failed';
  date: Date;
  flagged: boolean;
}