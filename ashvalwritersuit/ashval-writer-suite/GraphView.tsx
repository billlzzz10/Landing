import React from 'react';
import { AppNote, LoreEntry } from './types'; // And other types for graph nodes

interface GraphViewProps {
  notes: AppNote[];
  loreEntries: LoreEntry[];
  // activeProjectId: string | null;
}

const GraphView: React.FC<GraphViewProps> = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Graph View</h2>
      <p className="text-gray-600 dark:text-gray-300">Visualization of connections between notes, lore, etc., will be here.</p>
    </div>
  );
};
export default GraphView;