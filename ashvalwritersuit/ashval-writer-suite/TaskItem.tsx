import React from 'react';
import { AppTask } from './types'; // Assuming AppTask is in the root types.ts
import { Trash2 as TrashIcon, CheckCircle as TaskIcon } from 'lucide-react'; // Using lucide-react

interface TaskItemProps {
  task: AppTask;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, completed: boolean) => void; 
  onView?: (task: AppTask) => void;
}

const getPriorityClasses = (priority: string): string => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300';
    case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300';
    case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  }
};

const TaskItem: React.FC<TaskItemProps> = ({ task, onDelete, onUpdateStatus, onView }) => {
  
  const handleToggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent li onClick if it exists
    onUpdateStatus(task.id as string, !task.completed);
  };

  return (
    <li 
        className={`bg-contentlight dark:bg-contentdark p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex justify-between items-start group ${task.completed ? 'opacity-60' : ''} cursor-pointer`}
        onClick={() => onView?.(task)}
    >
      <div className="flex items-start space-x-3 flex-grow min-w-0">
         <button onClick={handleToggleStatus} className={`flex-shrink-0 mt-1 p-1 rounded-full ${task.completed ? 'text-green-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}>
            <TaskIcon className={`w-5 h-5 ${task.completed ? 'fill-current' : '' }`} />
        </button>
        <div className="flex-grow min-w-0">
          <h3 className={`font-semibold text-lg text-textlight dark:text-textdark truncate ${task.completed ? 'line-through' : ''}`}>{task.title}</h3>
          {task.description && <p className="text-sm text-neutral dark:text-neutral-light mt-1 truncate">{task.description}</p>}
           <div className="flex items-center space-x-2 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityClasses(task.priority)}`}>
              {task.priority}
            </span>
            {task.category && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">{task.category}</span>}
            {task.dueDate && <span className="text-xs text-neutral-light dark:text-gray-400">{new Date(task.dueDate).toLocaleDateString()}</span>}
           </div>
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(task.id as string); }}
        aria-label={`Delete task ${task.title}`}
        className="p-2 text-neutral hover:text-red-500 dark:text-neutral-light dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 flex-shrink-0"
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </li>
  );
};

export default TaskItem;