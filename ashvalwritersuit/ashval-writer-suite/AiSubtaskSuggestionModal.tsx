import React from 'react';
import { AppTask } from './types';

interface AiSubtaskSuggestionModalProps {
  task: AppTask;
  suggestedSubtasks: string[];
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onAddSubtasks: (subtasks: string[]) => void;
}

const AiSubtaskSuggestionModal: React.FC<AiSubtaskSuggestionModalProps> = ({ task, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">AI Subtask Suggestions for "{task.title}"</h2>
        <p className="text-gray-600 dark:text-gray-300">Subtask suggestions will appear here.</p>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600">Close</button>
      </div>
    </div>
  );
};
export default AiSubtaskSuggestionModal;