// app/types/transactions.ts
export interface Transaction {
  id: string;
  customer: string;
  merchant: string;
  senderType?: string;
  receiverType?: string;
  rawAmount: number;
  feeAmount?: number;
  netAmount?: number;
  currency: 'MWK' | 'CNY' | string;
  status: 'Completed' | 'Pending' | 'Failed';
  date: Date;
  flagged: boolean;
  transactionType?: string;
  direction?: 'sent' | 'received';
  reference?: string;
}
