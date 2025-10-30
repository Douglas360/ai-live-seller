import React from 'react';

interface ErrorToastProps {
  message: string;
  onClose: () => void;
}

const ErrorToast: React.FC<ErrorToastProps> = ({ message, onClose }) => {
  return (
    <div 
      className="fixed top-24 left-1/2 w-11/12 max-w-2xl bg-red-900 bg-opacity-90 backdrop-blur-sm border border-red-600 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center space-x-4 z-[100] animate-fade-in-down"
      style={{ transform: 'translateX(-50%)' }}
      role="alert"
    >
      <div className="flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="flex-grow text-sm text-red-100">
        {message}
      </div>
      <button 
        onClick={onClose} 
        className="text-red-300 hover:text-white transition-colors flex-shrink-0"
        aria-label="Close error message"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default ErrorToast;
