
import React from 'react';
import { AppTask as Task } from '../types';
import { TrashIcon, TaskIcon } from './icons';

interface TaskItemProps {
  task: Task;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: Task['completed']) => void; // Changed status type
}

const getStatusColor = (status: boolean): string => { // Changed status type, simplified logic
  return status ? 'bg-green-400 dark:bg-green-500' : 'bg-yellow-400 dark:bg-yellow-500';
};

const TaskItem: React.FC<TaskItemProps> = ({ task, onDelete, onUpdateStatus }) => {
  const toggleStatus = () => {
    onUpdateStatus(task.id, !task.completed);
  };

  return (
    <li className="bg-contentlight dark:bg-contentdark p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex justify-between items-start group">
      <div className="flex items-start space-x-3 flex-grow">
        <TaskIcon className="w-5 h-5 text-secondary dark:text-secondary-light mt-1 flex-shrink-0" />
        <div className="flex-grow">
          <h3 className={`font-semibold text-lg text-textlight dark:text-textdark ${task.completed ? 'line-through' : ''}`}>{task.title}</h3>
          {task.description && <p className="text-sm text-neutral dark:text-neutral-light mt-1">{task.description}</p>}
           <div className="flex items-center space-x-2 mt-2">
             <button 
                onClick={toggleStatus} 
                className={`px-2 py-1 text-xs font-medium rounded-full text-white transition-colors ${getStatusColor(task.completed)} hover:opacity-80`}
             >
                {task.completed ? 'Done' : 'Todo' } 
             </button>
            <span className={`text-xs px-2 py-1 rounded-full ${
              task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' :
              'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
            }`}>
              {task.priority}
            </span>
           </div>
          <p className="text-xs text-neutral-light dark:text-gray-500 mt-2">
            Last updated: {new Date(task.createdAt).toLocaleDateString()} {/* Assuming createdAt for tasks if updatedAt not present */}
          </p>
        </div>
      </div>
      <button
        onClick={() => onDelete(task.id)}
        aria-label={`Delete task ${task.title}`}
        className="p-2 text-neutral hover:text-red-500 dark:text-neutral-light dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </li>
  );
};

export default TaskItem;