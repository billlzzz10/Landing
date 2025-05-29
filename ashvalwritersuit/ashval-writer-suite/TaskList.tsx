import React from 'react';
import { AppTask } from './types';
import TaskItem from './TaskItem'; // Assuming TaskItem is at root

interface TaskListProps {
  tasks: AppTask[];
  setTasks: React.Dispatch<React.SetStateAction<AppTask[]>>; // Simplified from actual use
  onOpenTaskModal: () => void;
  // ... other props
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onOpenTaskModal }) => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Tasks</h2>
        <button onClick={onOpenTaskModal} className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600">Add Task</button>
      </div>
      {tasks.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No tasks yet. Add one!</p>
      ) : (
        <ul className="space-y-3">
          {tasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onDelete={() => console.log('delete', task.id)} 
              onUpdateStatus={() => console.log('update status', task.id)} 
            />
          ))}
        </ul>
      )}
    </div>
  );
};
export default TaskList;