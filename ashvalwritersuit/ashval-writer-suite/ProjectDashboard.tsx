import React from 'react';
import { Project, AppNote, AppTask } from './types';
// You would import StatCard if it's made reusable, e.g., from './components/StatCard'
// For now, this is a simple placeholder.

interface ProjectDashboardProps {
  projects: Project[];
  notes: AppNote[];
  tasks: AppTask[];
  // activeProjectId: string | null; // If needed to filter stats
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ projects, notes, tasks }) => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">Project Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Total Projects</h2>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{projects.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Total Notes</h2>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{notes.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Total Tasks</h2>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{tasks.length}</p>
        </div>
      </div>
      <p className="mt-6 text-gray-600 dark:text-gray-300">Dashboard content for projects, notes, and tasks overview will be here.</p>
    </div>
  );
};
export default ProjectDashboard;