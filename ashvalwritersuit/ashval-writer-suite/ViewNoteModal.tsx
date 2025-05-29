import React from 'react';
import { AppNote } from './types';

interface ViewNoteModalProps {
  note: AppNote;
  onClose: () => void;
  onEdit: (note: AppNote) => void;
  onDelete: (noteId: string) => void;
}

const ViewNoteModal: React.FC<ViewNoteModalProps> = ({ note, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">{note.title}</h2>
        <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{note.content}</div>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600">Close</button>
      </div>
    </div>
  );
};
export default ViewNoteModal;