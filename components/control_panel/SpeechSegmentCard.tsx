import React, { useState } from 'react';
import { type SpeechSegment } from '../../types';

type SpeechSegmentCardProps = {
  segment: SpeechSegment;
  index: number;
  onEdit: (segmentId: string, newText: string) => void;
  onDelete: (segmentId: string) => void;
  isDragOver: boolean;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
};

const statusStyles: { [key in SpeechSegment['status']]: { text: string; bg: string; textC: string } } = {
  speaking: { text: 'Speaking Now', bg: 'bg-accent/20', textC: 'text-accent' },
  queued: { text: 'Queued', bg: 'bg-primary', textC: 'text-text-dark' },
  completed: { text: 'Completed', bg: 'bg-green-500/20', textC: 'text-green-400' },
};

const typeStyles: { [key in SpeechSegment['type']]: { text: string; bg: string; textC: string } } = {
  pitch: { text: 'Pitch', bg: 'bg-blue-500/20', textC: 'text-blue-400' },
  response: { text: 'Response', bg: 'bg-green-500/20', textC: 'text-green-400' },
};


// FIX: Changed component definition to use React.FC to correctly type the component props.
const SpeechSegmentCard: React.FC<SpeechSegmentCardProps> = ({ 
  segment, 
  index, 
  onEdit, 
  onDelete,
  isDragOver,
  onDragStart,
  onDragEnter,
  onDragLeave,
  onDrop,
  onDragEnd
}) => {
  const { id, status, type, estimatedDuration, textLines, sourceComments, commentCount } = segment;
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(textLines.join('\n'));
  
  const statusStyle = statusStyles[status];
  const typeStyle = typeStyles[type];
  const isCompleted = status === 'completed';
  const canBeModified = status === 'queued';

  const handleSave = () => {
    onEdit(id, editedText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedText(textLines.join('\n'));
    setIsEditing(false);
  };


  return (
    <div 
        className={`relative p-3 rounded-lg border-2 transition-all duration-300 ${status === 'speaking' ? 'border-accent' : 'border-border-color'} ${isCompleted ? 'opacity-60' : ''} ${canBeModified ? 'cursor-grab' : 'cursor-default'}`}
        draggable={canBeModified}
        onDragStart={onDragStart}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
        onDragOver={(e) => e.preventDefault()}
    >
      {isDragOver && <div className="absolute top-0 left-0 right-0 h-1 bg-accent rounded-full -mt-1" />}
      <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
        <div className="flex items-center space-x-2 flex-wrap">
           {canBeModified && (
            <div className="text-text-dark/50" aria-label="Drag to reorder">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="9" cy="6" r="1.5"></circle>
                    <circle cx="15" cy="6" r="1.5"></circle>
                    <circle cx="9" cy="12" r="1.5"></circle>
                    <circle cx="15" cy="12" r="1.5"></circle>
                    <circle cx="9" cy="18" r="1.5"></circle>
                    <circle cx="15" cy="18" r="1.5"></circle>
                </svg>
            </div>
           )}
          <span className={`bg-primary text-text-light font-bold text-xs w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 ${!canBeModified ? 'ml-6' : ''}`}>{index}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${typeStyle.bg} ${typeStyle.textC}`}>{typeStyle.text}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.textC}`}>
            {statusStyle.text} {type === 'response' && commentCount ? `(${commentCount} comments)` : ''}
          </span>
        </div>
        <div className="flex items-center space-x-2">
            <span className="text-xs text-text-dark">~{estimatedDuration}s</span>
            {canBeModified && (
                <div className="flex items-center space-x-2">
                    <button onClick={() => setIsEditing(true)} aria-label="Edit script" className="text-text-dark hover:text-accent transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={() => onDelete(id)} aria-label="Delete script" className="text-text-dark hover:text-red-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            )}
        </div>
      </div>
      
      {isEditing ? (
        <div className="pl-7 space-y-2">
            <textarea 
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full px-2 py-1 bg-primary border border-border-color rounded-md text-text-light focus:outline-none focus:ring-1 focus:ring-accent text-sm"
                rows={3}
                autoFocus
            />
            <div className="flex items-center justify-end space-x-2">
                <button onClick={handleCancel} className="text-xs text-text-dark hover:text-text-light px-2 py-1">Cancel</button>
                <button onClick={handleSave} className="text-xs bg-accent text-white hover:bg-accent-hover px-3 py-1 rounded">Save</button>
            </div>
        </div>
      ) : (
         <div className={`pl-7 text-sm ${isCompleted ? 'text-text-dark' : 'text-text-light'}`}>
            <p>
                {textLines.join(' ')}
                {status === 'speaking' && <span className="inline-block w-1.5 h-1.5 bg-accent rounded-full ml-1 animate-pulse"></span>}
            </p>
        </div>
      )}

      {type === 'response' && sourceComments && sourceComments.length > 0 && (
        <div className="pl-7 mt-3 pt-2 border-t border-border-color/50">
            <p className="text-xs text-text-dark font-semibold mb-1.5">Responding to:</p>
            <div className="space-y-1">
                {sourceComments.map(comment => (
                    <div key={comment.id} className="text-xs bg-primary p-1.5 rounded-md">
                        <span className="font-bold text-text-dark/80">@{comment.username}:</span>
                        <span className="ml-1.5 text-text-dark italic">"{comment.text}"</span>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default SpeechSegmentCard;