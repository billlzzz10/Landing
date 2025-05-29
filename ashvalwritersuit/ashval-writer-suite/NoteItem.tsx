import React from 'react';
import { AppNote } from './types'; // Assuming AppNote is in the root types.ts
import { TrashIcon, StickyNote as NoteIcon } from 'lucide-react'; // Using lucide-react for consistency with NoteTaskApp

interface NoteItemProps {
  note: AppNote;
  onDelete: (id: string) => void;
  onView?: (note: AppNote) => void; // Optional: to view the note
}

const NoteItem: React.FC<NoteItemProps> = ({ note, onDelete, onView }) => {
  return (
    <li 
      className="bg-contentlight dark:bg-contentdark p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex justify-between items-start group cursor-pointer"
      onClick={() => onView?.(note)}
    >
      <div className="flex items-start space-x-3 flex-grow min-w-0"> {/* Added min-w-0 for truncation */}
        {note.icon || <NoteIcon className="w-5 h-5 text-primary dark:text-primary-light mt-1 flex-shrink-0" />}
        <div className="flex-grow min-w-0"> {/* Added min-w-0 for truncation */}
          <h3 className="font-semibold text-lg text-textlight dark:text-textdark truncate">{note.title}</h3>
          {note.content && <p className="text-sm text-neutral dark:text-neutral-light mt-1 truncate">{ (typeof note.content === 'string' && note.content.length > 100) ? `${note.content.substring(0,100)}...` : note.content}</p>}
          <p className="text-xs text-neutral-light dark:text-gray-500 mt-2">
            Last updated: {new Date(note.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(note.id as string);}}
        aria-label={`Delete note ${note.title}`}
        className="p-2 text-neutral hover:text-red-500 dark:text-neutral-light dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 flex-shrink-0"
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </li>
  );
};

export default NoteItem;