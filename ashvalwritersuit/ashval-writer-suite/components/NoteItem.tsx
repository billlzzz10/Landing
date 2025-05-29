
import React from 'react';
import { AppNote as Note } from '../types';
import { TrashIcon, NoteIcon } from './icons';

interface NoteItemProps {
  note: Note;
  onDelete: (id: string) => void;
}

const NoteItem: React.FC<NoteItemProps> = ({ note, onDelete }) => {
  return (
    <li className="bg-contentlight dark:bg-contentdark p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex justify-between items-start group">
      <div className="flex items-start space-x-3">
        <NoteIcon className="w-5 h-5 text-primary dark:text-primary-light mt-1 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-lg text-textlight dark:text-textdark">{note.title}</h3>
          {note.content && <p className="text-sm text-neutral dark:text-neutral-light mt-1">{note.content}</p>}
          <p className="text-xs text-neutral-light dark:text-gray-500 mt-2">
            Last updated: {new Date(note.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <button
        onClick={() => onDelete(note.id)}
        aria-label={`Delete note ${note.title}`}
        className="p-2 text-neutral hover:text-red-500 dark:text-neutral-light dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </li>
  );
};

export default NoteItem;