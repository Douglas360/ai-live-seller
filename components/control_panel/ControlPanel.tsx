import React, { useState } from 'react';
import { type SpeechSegment, type Comment } from '../../types';
import ProductScriptView from './ProductScriptView';
import ChatFeed from '../ChatFeed';

interface ControlPanelProps {
  script: SpeechSegment[];
  comments: Comment[];
  isPaused: boolean;
  onPauseToggle: () => void;
  onStop: () => void;
  onEditSegment: (segmentId: string, newText: string) => void;
  onDeleteSegment: (segmentId: string) => void;
  onAddSegment: (text: string) => void;
  onReorderScript: (startIndex: number, endIndex: number) => void;
}

type ActiveTab = 'script' | 'comments';

const ControlPanel = ({ 
  script, 
  comments, 
  isPaused, 
  onPauseToggle, 
  onStop,
  onEditSegment,
  onDeleteSegment,
  onAddSegment,
  onReorderScript,
}: ControlPanelProps) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('script');

  return (
    <div className="bg-secondary border border-border-color rounded-xl shadow-lg h-full flex flex-col">
      {/* Tabs */}
      <div className="flex-shrink-0 border-b border-border-color p-2">
        <div className="flex items-center space-x-2">
          <TabButton
            label="Product Script"
            isActive={activeTab === 'script'}
            onClick={() => setActiveTab('script')}
          />
          <TabButton
            label="Comments"
            isActive={activeTab === 'comments'}
            onClick={() => setActiveTab('comments')}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow min-h-0">
        {activeTab === 'script' && 
            <ProductScriptView 
                script={script} 
                onEditSegment={onEditSegment}
                onDeleteSegment={onDeleteSegment}
                onAddSegment={onAddSegment}
                onReorderScript={onReorderScript}
            />
        }
        {activeTab === 'comments' && <ChatFeed comments={comments} />}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 border-t border-border-color p-4 flex items-center space-x-3">
        <button
          onClick={onPauseToggle}
          className="w-full bg-yellow-500 text-black hover:bg-yellow-600 px-6 py-3 font-bold rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
        <button
          onClick={onStop}
          className="w-full bg-red-600 text-white hover:bg-red-700 px-6 py-3 font-bold rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Stop Streaming
        </button>
      </div>
    </div>
  );
};

interface TabButtonProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const TabButton = ({ label, isActive, onClick }: TabButtonProps) => {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                isActive ? 'bg-accent text-white' : 'text-text-dark hover:bg-primary'
            }`}
        >
            {label}
        </button>
    );
};


export default ControlPanel;