
import React from 'react';
import TaskList from './TaskList';
import { AppTask, Project, PomodoroConfig } from './types';
import { AppTheme } from './NoteTaskApp';

interface TasksFocusPageProps {
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

const TasksFocusPage: React.FC<TasksFocusPageProps> = (props) => {
  return <TaskList {...props} />;
};

export default TasksFocusPage;
