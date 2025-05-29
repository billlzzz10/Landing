import React from 'react';
import { AppTask, Project } from './types';

interface TaskModalProps {
  currentTaskData: Partial<AppTask>;
  // editingTaskId: string | null; // Not used in provided NoteTaskApp props
  projects: Project[];
  activeProjectId: string | null;
  onClose: () => void;
  onSave: (taskData: AppTask) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Task Modal</h2>
        <p className="text-gray-600 dark:text-gray-300">Task editing form will be here.</p>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600">Close</button>
      </div>
    </div>
  );
};
export default TaskModal;