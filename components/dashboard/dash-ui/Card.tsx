interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const Card = ({ 
  children, 
  title, 
  subtitle, 
  className = '' 
}: CardProps) => {
  return (
    <div className={`bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#2a2a2a] rounded-xl shadow-sm overflow-hidden flex flex-col ${className}`}>
      {(title || subtitle) && (
        <div className="px-lg py-md border-b border-gray-100 dark:border-[#2a2a2a]">
          {title && <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">{title}</h3>}
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="p-lg flex-1">
        {children}
      </div>
    </div>
  );
};