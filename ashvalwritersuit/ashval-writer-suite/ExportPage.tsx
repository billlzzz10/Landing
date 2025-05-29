import React from 'react';
import { AppNote, Project, ExportTemplate } from './types';

interface ExportPageProps {
  notes: AppNote[];
  projects: Project[];
  activeProjectId: string | null;
  exportTemplates: ExportTemplate[]; // From constants or user-defined
  // Function to handle export
}

const ExportPage: React.FC<ExportPageProps> = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Export Data</h2>
      <p className="text-gray-600 dark:text-gray-300">Options for exporting notes and projects will be here.</p>
    </div>
  );
};
export default ExportPage;