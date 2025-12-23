// app/components/transactions/FlagTransactionDialog.tsx
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { type Transaction } from './types';

interface FlagTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  reason: string;
  onReasonChange: (reason: string) => void;
  onFlag: () => void;
}

export function FlagTransactionDialog({
  open,
  onOpenChange,
  transaction,
  reason,
  onReasonChange,
  onFlag
}: FlagTransactionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25 border-none shadow-2xl bg-white dark:bg-slate-950">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1 text-destructive">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangle size={20} />
            </div>
            <DialogTitle className="text-xl">Flag Transaction</DialogTitle>
          </div>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            This will mark transaction <span className="font-mono text-slate-900 dark:text-slate-200">#{transaction?.id}</span> for review.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 dark:border-slate-800 my-2">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Customer</p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
              {transaction?.customer}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Amount</p>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {transaction?.currency === 'MWK' ? 'MWK' : '¥'} {transaction?.rawAmount.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="space-y-3 py-2">
          <Label htmlFor="reason" className="text-xs font-semibold text-slate-500 uppercase">
            Reason for flagging
          </Label>
          <Textarea 
            id="reason"
            value={reason} 
            onChange={e => onReasonChange(e.target.value)} 
            placeholder="e.g., Unusual high volume from this merchant..." 
            className="resize-none focus-visible:ring-destructive min-h-25 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          />
          <p className="text-[11px] text-slate-400 italic">
            * This action will be logged and visible to other administrators.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={onFlag}
            disabled={!reason.trim()}
            className="shadow-sm shadow-destructive/20"
          >
            Confirm Flagging
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}