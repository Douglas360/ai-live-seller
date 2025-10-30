import React, { useState } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Textarea from '../ui/Textarea';

interface AddScriptModalProps {
  onClose: () => void;
  onAdd: (text: string) => void;
}

const AddScriptModal = ({ onClose, onAdd }: AddScriptModalProps) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-dark hover:text-text-light transition-colors"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold mb-2 text-text-light">Add Manual Script</h2>
        <p className="text-text-dark mb-6">Enter the script below. Each line will be spoken separately.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="script-text" className="sr-only">Script Text</label>
            <Textarea
              id="script-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="E.g., E essa é a nossa última oferta da noite!..."
              rows={5}
              required
              autoFocus
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="danger" onClick={onClose}>Cancel</Button>
            <Button type="submit">Add Script to Queue</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddScriptModal;
