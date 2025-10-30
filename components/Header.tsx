
import React, { useState, useEffect } from 'react';

interface HeaderProps {
  isLive: boolean;
  startTime: Date | null;
}

const Header = ({ isLive, startTime }: HeaderProps) => {
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

    useEffect(() => {
        if (!isLive || !startTime) {
            setElapsedTime('00:00:00');
            return;
        }

        const timerInterval = setInterval(() => {
            const now = new Date();
            const diff = now.getTime() - startTime.getTime();

            const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
            const minutes = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
            const seconds = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');

            setElapsedTime(`${hours}:${minutes}:${seconds}`);
        }, 1000);

        return () => clearInterval(timerInterval);
    }, [isLive, startTime]);

  return (
    <header className="bg-secondary border-b border-border-color p-4 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-text-light">AI Live Seller</h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
            <span className="text-sm font-medium text-text-dark">{isLive ? 'LIVE' : 'OFFLINE'}</span>
        </div>
        {isLive && startTime && (
            <div className="flex items-center space-x-2 text-sm font-mono bg-primary px-2 py-1 rounded-md border border-border-color">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-text-light tabular-nums">{elapsedTime}</span>
            </div>
        )}
      </div>
    </header>
  );
};

export default Header;
