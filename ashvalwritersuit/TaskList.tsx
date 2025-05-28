
import React, { useState } from 'react';
import { AppTask, Project, PomodoroConfig } from './types';
import { AppTheme } from './NoteTaskApp';
import TaskItem from './TaskItem';
import CategoryFilterControl from './CategoryFilterControl';
import PomodoroTimer from './PomodoroTimer'; 
import { Plus, Search, ListChecks, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface TaskListProps {
  tasks: AppTask[];
  currentTheme: AppTheme;
  onToggleTask: (id: number) => void;
  onDeleteTask: (id: number) => void;
  onAddTask: () => void;
  onToggleSubtask: (taskId: number, subtaskId: string) => void;
  onAiDecomposeTaskRequest: (task: AppTask) => void;
  getPriorityColor: (priority: string) => string;
  getCategoryIcon: (category: string) => JSX.Element;
  projects: Project[];
  activeProjectId: string | null;
  // Pomodoro Props
  pomodoroConfig: PomodoroConfig;
  pomodoroTempConfig: PomodoroConfig;
  pomodoroCurrentMode: 'work' | 'shortBreak' | 'longBreak';
  pomodoroTimeLeft: number;
  pomodoroIsActive: boolean;
  pomodoroCurrentRound: number;
  onPomodoroStartPause: () => void;
  onPomodoroResetCurrent: () => void;
  onPomodoroSkip: () => void;
  onPomodoroConfigChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPomodoroSaveConfig: () => void;
  formatPomodoroTime: (seconds: number) => string;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  currentTheme,
  onToggleTask,
  onDeleteTask,
  onAddTask,
  onToggleSubtask,
  onAiDecomposeTaskRequest,
  getPriorityColor,
  getCategoryIcon,
  projects,
  activeProjectId,
  pomodoroConfig,
  pomodoroTempConfig,
  pomodoroCurrentMode,
  pomodoroTimeLeft,
  pomodoroIsActive,
  pomodoroCurrentRound,
  onPomodoroStartPause,
  onPomodoroResetCurrent,
  onPomodoroSkip,
  onPomodoroConfigChange,
  onPomodoroSaveConfig,
  formatPomodoroTime,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [showCompleted, setShowCompleted] = useState(true);
  const [showPomodoroPanel, setShowPomodoroPanel] = useState(false);

  const projectTasks = tasks.filter(task => 
    !activeProjectId || task.projectId === activeProjectId || task.projectId === null
  );

  const filteredTasks = projectTasks
    .filter(task => activeCategoryFilter === 'all' || task.category.toLowerCase() === activeCategoryFilter.toLowerCase())
    .filter(task => showCompleted || !task.completed)
    .filter(task =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.subtasks.some(st => st.title.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  
  const allCategories = ['all', ...Array.from(new Set(projectTasks.map(task => task.category.toLowerCase())))];
  
  const getProjectName = (projectId?: string | null) => {
    if (!projectId) return undefined;
    return projects.find(p => p.id === projectId)?.name;
  };

  return (
    <div className="py-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className={`text-2xl sm:text-3xl font-semibold ${currentTheme.text} flex items-center`}>
          <ListChecks className={`w-7 h-7 mr-2 ${currentTheme.accent.replace('bg-','text-')}`} />
          รายการงาน ({filteredTasks.filter(t=>!t.completed).length} ที่ยังไม่เสร็จ)
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPomodoroPanel(!showPomodoroPanel)}
            className={`${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center text-sm font-medium`}
            aria-expanded={showPomodoroPanel}
          >
            <Clock className="w-5 h-5 mr-1.5" /> Pomodoro
            {showPomodoroPanel ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
          </button>
          <button
            onClick={onAddTask}
            className={`${currentTheme.button} ${currentTheme.buttonText} px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center text-sm font-medium`}
          >
            <Plus className="w-5 h-5 mr-1.5" /> เพิ่มงานใหม่
          </button>
        </div>
      </div>

      {showPomodoroPanel && (
        <div className="mb-6 transition-all duration-500 ease-in-out">
          <PomodoroTimer
            config={pomodoroConfig}
            tempConfig={pomodoroTempConfig}
            currentMode={pomodoroCurrentMode}
            timeLeft={pomodoroTimeLeft}
            isActive={pomodoroIsActive}
            currentRound={pomodoroCurrentRound}
            currentTheme={currentTheme}
            onStartPause={onPomodoroStartPause}
            onResetCurrent={onPomodoroResetCurrent}
            onSkip={onPomodoroSkip}
            onConfigChange={onPomodoroConfigChange}
            onSaveConfig={onPomodoroSaveConfig}
            formatTime={formatPomodoroTime}
          />
        </div>
      )}

      <div className={`${currentTheme.cardBg} p-4 rounded-xl shadow-lg mb-6`}>
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-grow w-full sm:w-auto">
            <input
              type="text"
              placeholder="ค้นหางาน (ชื่อ, หมวดหมู่, งานย่อย)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full py-3 pl-10 pr-4 rounded-lg ${currentTheme.inputBg} ${currentTheme.inputText} ${currentTheme.inputBorder} ${currentTheme.focusRing} focus:border-transparent focus:outline-none text-sm`}
              aria-label="ค้นหางาน"
            />
            <Search className={`w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 ${currentTheme.textSecondary} opacity-70`} />
          </div>
          <label className={`flex items-center text-sm ${currentTheme.textSecondary} whitespace-nowrap`}>
            <input 
              type="checkbox" 
              checked={showCompleted} 
              onChange={() => setShowCompleted(!showCompleted)} 
              className={`mr-2 rounded ${currentTheme.accent.replace('bg-','text-')} focus:${currentTheme.focusRing}`}
            />
            แสดงงานที่เสร็จแล้ว
          </label>
        </div>
      </div>
      
      <CategoryFilterControl
        categories={allCategories}
        activeFilter={activeCategoryFilter}
        onFilterChange={setActiveCategoryFilter}
        getCategoryIcon={getCategoryIcon} // TaskItem can use this too, or specific task icons
        currentTheme={currentTheme}
        label="กรองตามหมวดหมู่"
      />

      {filteredTasks.length === 0 ? (
        <p className={`${currentTheme.textSecondary} italic text-center py-10`}>
           {projectTasks.length === 0 ? (activeProjectId ? 'โปรเจกต์นี้ยังไม่มีงาน' : 'ยังไม่มีงานใดๆ') : 'ไม่พบงานที่ตรงกับการค้นหา/ตัวกรอง'}
        </p>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          {filteredTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              currentTheme={currentTheme}
              onToggleTask={onToggleTask}
              onDeleteTask={onDeleteTask}
              onToggleSubtask={onToggleSubtask}
              onAiDecomposeTaskRequest={onAiDecomposeTaskRequest}
              getPriorityColor={getPriorityColor}
              getCategoryIcon={getCategoryIcon}
              projectName={getProjectName(task.projectId)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;
