
import React from 'react';
import WorldAnvilManager from './WorldAnvilManager';
import { LoreEntry, Project } from './types';
import { AppTheme } from './NoteTaskApp';

interface CharactersPageProps {
  loreEntries: LoreEntry[];
  setLoreEntries: React.Dispatch<React.SetStateAction<LoreEntry[]>>;
  currentTheme: AppTheme;
  getCategoryIcon: (category: string) => JSX.Element;
  projects: Project[];
  activeProjectId: string | null;
}

const CharactersPage: React.FC<CharactersPageProps> = (props) => {
  return (
    <WorldAnvilManager
      {...props}
      filterByType={['Character']}
    />
  );
};

export default CharactersPage;
