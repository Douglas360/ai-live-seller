import React, { useRef, useEffect } from 'react';
import { type Comment } from '../types';

interface ChatFeedProps {
  comments: Comment[];
}

const USERNAME_COLORS = [
    'text-red-400', 'text-green-400', 'text-blue-400', 'text-yellow-400',
    'text-purple-400', 'text-pink-400', 'text-indigo-400', 'text-teal-400'
];

const ChatFeed = ({ comments }: ChatFeedProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [comments]);
  
  return (
    <div ref={scrollRef} className="h-full overflow-y-auto space-y-2 p-4" style={{ maskImage: 'linear-gradient(to top, black 85%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to top, black 85%, transparent 100%)' }}>
      {comments.map((comment) => {
        const colorIndex = comment.username.length % USERNAME_COLORS.length;
        const colorClass = USERNAME_COLORS[colorIndex];

        return (
          <div key={comment.id} className="text-sm bg-primary bg-opacity-50 p-2 rounded-md">
            <span className={`font-bold ${colorClass}`}>{comment.username}:</span>
            <span className="ml-1.5 text-text-light">{comment.text}</span>
          </div>
        );
      })}
    </div>
  );
};

export default ChatFeed;