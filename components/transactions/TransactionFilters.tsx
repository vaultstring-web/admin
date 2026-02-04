// app/components/transactions/TransactionFilters.tsx
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TransactionFiltersProps {
  search: string;
  status: string;
  currency: string;
  type?: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onCurrencyChange: (value: string) => void;
  onTypeChange?: (value: string) => void;
  onClearFilters: () => void;
}

export function TransactionFilters({
  search,
  status,
  currency,
  type = 'all',
  onSearchChange,
  onStatusChange,
  onCurrencyChange,
  onTypeChange,
  onClearFilters
}: TransactionFiltersProps) {
  return (
    <Card className="mb-6 p-4 bg-white dark:bg-[#1e293b]">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <Input 
            placeholder="Search ID, customer, merchant, wallet number..." 
            value={search} 
            onChange={e => onSearchChange(e.target.value)} 
            className="pl-10 bg-white dark:bg-[#334155]" 
          />
        </div>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="bg-white dark:bg-[#334155]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-[#1e293b]">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={currency} onValueChange={onCurrencyChange}>
          <SelectTrigger className="bg-white dark:bg-[#334155]">
            <SelectValue placeholder="Currency" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-[#1e293b]">
            <SelectItem value="all">All Currencies</SelectItem>
            <SelectItem value="MWK">MWK</SelectItem>
            <SelectItem value="CNY">CNY</SelectItem>
            <SelectItem value="ZMW">ZMW</SelectItem>
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={(v) => onTypeChange && onTypeChange(v)}>
          <SelectTrigger className="bg-white dark:bg-[#334155]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-[#1e293b]">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="sent">Money Sent</SelectItem>
            <SelectItem value="received">Money Received</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="bg-white dark:bg-[#334155]"
        >
          Clear Filters
        </Button>
      </div>
    </Card>
  );
}
