import React from 'react';
import { LoreEntry } from './types';

interface WorldAnvilManagerProps {
  loreEntries: LoreEntry[];
  setLoreEntries: React.Dispatch<React.SetStateAction<LoreEntry[]>>;
  activeProjectId: string | null;
}

const WorldAnvilManager: React.FC<WorldAnvilManagerProps> = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Lore Manager (World Anvil)</h2>
      <p className="text-gray-600 dark:text-gray-300">Interface for managing lore entries will be here.</p>
    </div>
  );
};
export default WorldAnvilManager;