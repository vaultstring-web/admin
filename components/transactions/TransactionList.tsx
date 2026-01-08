// app/components/transactions/TransactionList.tsx
import { format } from 'date-fns';
import { AlertCircle, Clock, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { type Transaction } from './types';
import { cn } from '@/lib/utils'; // Assuming you have a cn utility

interface TransactionListProps {
  transactions: Transaction[];
  onSelectTransaction: (transaction: Transaction) => void;
  onFlagTransaction: (transaction: Transaction) => void;
  formatAmount: (amount: number) => string;
}

export function TransactionList(props: TransactionListProps) {
  const { transactions, onFlagTransaction, formatAmount } = props;
  return (
    <Card className="overflow-hidden border-none shadow-sm bg-white dark:bg-slate-950">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 w-16">ID</th>
              <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Customer</th>
              <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Merchant</th>
              <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Summary</th>
              <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 text-right">Amount</th>
              <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Status</th>
              <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Date</th>
              <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {transactions.map((tx) => (
              <tr 
                key={tx.id} 
                className="group hover:bg-slate-50/80 dark:hover:bg-slate-900/80 transition-all duration-200"
              >
                <td className="px-6 py-4 font-mono text-xs text-slate-400">
                  #{tx.reference || tx.id}
                </td>
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                  {tx.customer}
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                  {tx.merchant}
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                  {(() => {
                    const cur = tx.currency === 'MWK' ? 'MK' : tx.currency;
                    const amt = formatAmount(tx.rawAmount);
                    const fee = tx.feeAmount !== undefined ? formatAmount(tx.feeAmount) : undefined;
                    const net = tx.netAmount !== undefined ? formatAmount(tx.netAmount) : undefined;
                    if (tx.direction === 'received') {
                      return `Trans. ID: ${tx.reference || tx.id} ${tx.merchant} received ${cur} ${amt} from Bank Account${fee ? ` • Fee ${cur} ${fee}` : ''}${net ? ` • Net ${cur} ${net}` : ''}`;
                    }
                    return `Trans. ID: ${tx.reference || tx.id} ${tx.customer} sent ${cur} ${amt} to ${tx.merchant}${fee ? ` • Fee ${cur} ${fee}` : ''}${net ? ` • Net ${cur} ${net}` : ''}`;
                  })()}
                </td>
                <td className="px-6 py-4 text-right tabular-nums font-semibold">
                  <span className="text-xs font-normal text-slate-400 mr-1">
                    {tx.currency}
                  </span>
                  {formatAmount(tx.rawAmount)}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={tx.status} />
                </td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap tabular-nums">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-300" />
                    {format(tx.date, 'dd MMM, yyyy')}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {tx.flagged && (
                      <Badge variant="destructive" className="h-7 gap-1 px-2 animate-in zoom-in-95">
                        <Flag size={12} fill="currentColor" />
                        Flagged
                      </Badge>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 w-8 p-0"
                      onClick={() => onFlagTransaction(tx)}
                    >
                      <AlertCircle size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function StatusBadge({ status }: { status: Transaction['status'] }) {
  const styles = {
    Completed: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    Pending: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    Failed: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border gap-1.5",
      styles[status as keyof typeof styles] || styles.Pending
    )}>
      <span className="h-1.5 w-1.5 rounded-full bg-currentColor" />
      {status}
    </span>
  );
}
