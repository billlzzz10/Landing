
import React from 'react';
import { AppTask, AppSubtask } from './types';
import { Check, Star, Calendar, Trash2, GitFork, CheckSquare, Square, Package } from 'lucide-react';
import { AppTheme } from './NoteTaskApp';

interface TaskItemProps {
  task: AppTask;
  currentTheme: AppTheme;
  onToggleTask: (id: number) => void;
  onDeleteTask: (id: number) => void;
  onToggleSubtask: (taskId: number, subtaskId: string) => void;
  onAiDecomposeTaskRequest: (task: AppTask) => void;
  getPriorityColor: (priority: string) => string; // Should return text color class
  getCategoryIcon: (category: string) => JSX.Element;
  projectName?: string; 
}

const TaskItem: React.FC<TaskItemProps> = ({ 
    task, 
    currentTheme, 
    onToggleTask, 
    onDeleteTask, 
    onToggleSubtask,
    onAiDecomposeTaskRequest,
    getPriorityColor, 
    getCategoryIcon,
    projectName
}) => {
  return (
    <div key={task.id} className={`${currentTheme.cardBg} rounded-xl p-5 hover:shadow-2xl transition-all duration-300 group border border-transparent hover:border-${currentTheme.accent.replace('bg-','')}-500/30 transform hover:-translate-y-1`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3.5 flex-grow min-w-0"> 
          <button
            onClick={() => onToggleTask(task.id)}
            className={`mt-1 w-6 h-6 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all duration-300 focus:outline-none ${currentTheme.focusRing}
              ${task.completed
                ? `${currentTheme.accent} border-transparent shadow-md`
                : `${currentTheme.inputBorder} hover:${currentTheme.accent.replace('bg-','border-')}`
              }`}
            aria-label={task.completed ? `เปลี่ยนสถานะงาน "${task.title}" เป็นยังไม่เสร็จ` : `เปลี่ยนสถานะงาน "${task.title}" เป็นเสร็จสิ้น`}
            aria-pressed={task.completed}
          >
            {task.completed && <Check className={`w-4 h-4 ${currentTheme.accentText}`} aria-hidden="true" />}
          </button>
          <div className="flex-grow min-w-0"> 
            <h3 className={`font-semibold ${currentTheme.text} ${task.completed ? 'line-through opacity-60' : ''} break-words flex items-center text-md`}>
              {task.icon && <span className="mr-2 text-xl flex-shrink-0" role="img" aria-hidden="true">{task.icon}</span>}
              {task.title}
            </h3>
            <div className="flex items-center gap-x-3.5 gap-y-1 mt-2 flex-wrap">
              <span className={`text-xs font-medium ${getPriorityColor(task.priority)} flex items-center`}>
                <Star className="w-3.5 h-3.5 inline-block mr-1" aria-hidden="true" />
                {task.priority === 'low' ? 'ต่ำ' : task.priority === 'medium' ? 'กลาง' : task.priority === 'high' ? 'สูง' : task.priority}
              </span>
              {task.dueDate && (
                <span className={`text-xs ${currentTheme.textSecondary} flex items-center`}>
                  <Calendar className="w-3.5 h-3.5 inline-block mr-1" aria-hidden="true" />
                  {new Date(task.dueDate + 'T00:00:00').toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              )}
               <span className={`text-xs px-2.5 py-1 rounded-full ${currentTheme.accent} bg-opacity-10 ${currentTheme.accent.replace('bg-','text-')} font-medium flex items-center gap-1`}>
                {getCategoryIcon(task.category)} <span className="ml-0.5">{task.category}</span>
              </span>
              {projectName && (
                <span className={`text-xs ${currentTheme.textSecondary} opacity-80 flex items-center`}>
                    <Package size={12} className="inline-block mr-1 opacity-70"/> {projectName}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-start gap-1.5 ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => { e.stopPropagation(); onAiDecomposeTaskRequest(task); }}
              className={`${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} p-2 rounded-md hover:bg-opacity-80`}
              title="AI ช่วยแตกงานย่อย"
              aria-label={`ใช้ AI ช่วยแตกงานย่อยสำหรับงาน "${task.title}"`}
            >
              <GitFork className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
              className="text-red-500 hover:text-red-400 p-2 rounded-md hover:bg-red-500/10"
              aria-label={`ลบงาน "${task.title}"`}
              title="ลบงาน"
            >
              <Trash2 className="w-4 h-4" />
            </button>
        </div>
      </div>
      
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mt-4 pl-10 space-y-2" role="list" aria-label={`งานย่อยของ ${task.title}`}>
          {task.subtasks.map(subtask => (
            <div key={subtask.id} className="flex items-center group/subtask">
              <button
                onClick={() => onToggleSubtask(task.id, subtask.id)}
                className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center mr-2.5 transition-all duration-200 focus:outline-none ${currentTheme.focusRing} ${
                  subtask.completed 
                    ? `${currentTheme.accent} border-transparent shadow-sm`
                    : `${currentTheme.inputBorder} hover:${currentTheme.accent.replace('bg-','border-')}`
                }`}
                aria-label={subtask.completed ? `เปลี่ยนสถานะงานย่อย "${subtask.title}" เป็นยังไม่เสร็จ` : `เปลี่ยนสถานะงานย่อย "${subtask.title}" เป็นเสร็จสิ้น`}
                aria-pressed={subtask.completed}
              >
                {subtask.completed && <Check className={`w-3 h-3 ${currentTheme.accentText}`} aria-hidden="true" />}
              </button>
              <span className={`text-sm ${currentTheme.textSecondary} ${subtask.completed ? 'line-through opacity-60' : 'opacity-90'} break-words`}>
                {subtask.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskItem;
