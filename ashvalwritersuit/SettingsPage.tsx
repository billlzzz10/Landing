
import React from 'react';
import AppSettingsPage from './AppSettingsPage'; // Assuming AppSettingsPage.tsx is the component
import { AppTheme } from './NoteTaskApp';
import { UserPreferences, Project } from './types';

interface SettingsPageProps {
  currentTheme: AppTheme;
  userPreferences: UserPreferences;
  setUserPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
  projects: Project[];
  activeProjectId: string | null;
  onUpdateProjectDetails: (projectId: string, details: Partial<Pick<Project, 'name' | 'genre' | 'description'>>) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = (props) => {
  return <AppSettingsPage {...props} />;
};

export default SettingsPage;
