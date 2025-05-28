
import React from 'react';
import PlotOutlineManager from './PlotOutlineManager';
import { PlotOutlineNode, AppNote, LoreEntry, Project } from './types'; // Added Project
import { AppTheme } from './NoteTaskApp';

interface PlotPageProps {
  plotOutlines: PlotOutlineNode[];
  setPlotOutlines: React.Dispatch<React.SetStateAction<PlotOutlineNode[]>>;
  notes: AppNote[];
  loreEntries: LoreEntry[];
  currentTheme: AppTheme;
  activeProjectId: string | null;
  projects: Project[]; // Added projects prop
}

const PlotPage: React.FC<PlotPageProps> = (props) => {
  return <PlotOutlineManager {...props} />;
};

export default PlotPage;