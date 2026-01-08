// app/components/Badge.tsx
import { KYCStatus, AccountStatus } from './types';

interface BadgeProps {
  status: KYCStatus | AccountStatus | string;
  type?: 'kyc' | 'account' | 'risk' | 'role';
}

export const Badge: React.FC<BadgeProps> = ({ status, type = 'kyc' }) => {
  let styles = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border";

  if (type === 'kyc') {
    switch (status) {
      case KYCStatus.APPROVED:
        styles += " bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
        break;
      case KYCStatus.PENDING:
        styles += " bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800";
        break;
      case KYCStatus.REJECTED:
        styles += " bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
        break;
      default:
        styles += " bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    }
  } else if (type === 'account') {
    switch (status) {
      case AccountStatus.ACTIVE:
        styles += " bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
        break;
      case AccountStatus.BLOCKED:
        styles += " bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
        break;
      default:
        styles += " bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    }
  } else if (type === 'risk') {
    const score = parseInt(status as string, 10);
    if (isNaN(score)) {
      styles += " bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    } else if (score < 30) {
      styles += " bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900";
    } else if (score < 70) {
      styles += " bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900";
    } else {
      styles += " bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900";
    }
  } else if (type === 'role') {
    styles += " bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20";
  } else {
    styles += " bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
  }

  return (
    <span className={styles}>
      {String(status).replace(/_/g, ' ')}
    </span>
  );
};
