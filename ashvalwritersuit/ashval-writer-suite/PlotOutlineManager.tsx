import React from 'react';
import { PlotOutlineNode } from './types';

interface PlotOutlineManagerProps {
  nodes: PlotOutlineNode[];
  setNodes: React.Dispatch<React.SetStateAction<PlotOutlineNode[]>>;
  activeProjectId: string | null;
}

const PlotOutlineManager: React.FC<PlotOutlineManagerProps> = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Plot Outline Manager</h2>
      <p className="text-gray-600 dark:text-gray-300">Interface for managing plot outlines (e.g., tree view) will be here.</p>
    </div>
  );
};
export default PlotOutlineManager;