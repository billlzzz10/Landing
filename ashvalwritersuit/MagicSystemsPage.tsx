
import React from 'react';
import WorldAnvilManager from './WorldAnvilManager';
import { LoreEntry, Project } from './types';
import { AppTheme } from './NoteTaskApp';

interface MagicSystemsPageProps {
  loreEntries: LoreEntry[];
  setLoreEntries: React.Dispatch<React.SetStateAction<LoreEntry[]>>;
  currentTheme: AppTheme;
  getCategoryIcon: (category: string) => JSX.Element;
  projects: Project[];
  activeProjectId: string | null;
}

const MagicSystemsPage: React.FC<MagicSystemsPageProps> = (props) => {
  return (
    <WorldAnvilManager
      {...props}
      filterByType={['ArcanaSystem']}
    />
  );
};

export default MagicSystemsPage;
