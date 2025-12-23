// app/components/Button.tsx
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-md";
  
  const variants = {
    primary: "bg-brand-green hover:bg-brand-green-dark text-white focus:ring-brand-green",
    secondary: "bg-brand-blue hover:bg-brand-blue-dark text-white focus:ring-brand-blue",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-600",
    ghost: "bg-transparent hover:bg-neutral-light-border dark:hover:bg-neutral-dark-border text-neutral-light-text dark:text-neutral-dark-text",
    outline: "border border-neutral-light-border dark:border-neutral-dark-border bg-transparent hover:bg-neutral-light-bg dark:hover:bg-neutral-dark-surface text-neutral-light-heading dark:text-neutral-dark-heading",
  };

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 py-2 text-sm",
    lg: "h-12 px-6 text-base",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      aria-disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />}
      {!isLoading && leftIcon && <span className="mr-2" aria-hidden="true">{leftIcon}</span>}
      {children}
    </button>
  );
};