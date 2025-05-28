
import React from 'react';
import WorldAnvilManager from './WorldAnvilManager';
import { LoreEntry, Project } from './types';
import { AppTheme } from './NoteTaskApp';

interface WorldItemsPageProps {
  loreEntries: LoreEntry[];
  setLoreEntries: React.Dispatch<React.SetStateAction<LoreEntry[]>>;
  currentTheme: AppTheme;
  getCategoryIcon: (category: string) => JSX.Element;
  projects: Project[];
  activeProjectId: string | null;
}

const WorldItemsPage: React.FC<WorldItemsPageProps> = (props) => {
  return (
    <WorldAnvilManager
      {...props}
      filterByType={['Place', 'Item', 'Concept', 'Event', 'Other']}
    />
  );
};

export default WorldItemsPage;
