import React from 'react';

interface CardProps {
  // FIX: Made children optional to resolve incorrect 'missing children' errors in modals.
  children?: React.ReactNode;
  className?: string;
}

const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`bg-secondary border border-border-color rounded-xl shadow-lg p-6 md:p-8 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
