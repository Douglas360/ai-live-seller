import React from 'react';

// FIX: Changed from interface to type alias to fix prop type issues.
type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = ({ className = '', children, ...props }: SelectProps) => {
  const baseClasses = 'w-full px-4 py-3 bg-primary border border-border-color rounded-lg text-text-light placeholder-text-dark focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors appearance-none';

  return (
    <div className="relative">
      <select
        className={`${baseClasses} ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-dark">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
};

export default Select;
