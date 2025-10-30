import React from 'react';

// FIX: Changed from interface to type alias to fix prop type issues.
type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = ({ className = '', ...props }: TextareaProps) => {
  const baseClasses = 'w-full px-4 py-3 bg-primary border border-border-color rounded-lg text-text-light placeholder-text-dark focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors';
  
  return (
    <textarea
      className={`${baseClasses} ${className}`}
      rows={4}
      {...props}
    />
  );
};

export default Textarea;
