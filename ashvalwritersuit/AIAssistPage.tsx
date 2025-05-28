
import React from 'react';
import AiWriter from './AiWriter';
import { OperationMode, UserPreferences, LoreEntry } from './types';
import { AppTheme } from './NoteTaskApp';

interface AIAssistPageProps {
  showAiWriterSection: boolean;
  operationMode: string;
  customSystemInstruction: string;
  inputPrompt: string;
  aiResponse: string;
  isLoading: boolean;
  error: string | null;
  inputCharCount: number;
  responseCharCount: number;
  defaultCustomModeSI: string;
  currentTheme: AppTheme;
  userPreferences: UserPreferences;
  activeProjectName?: string | null;
  projectCharacters: LoreEntry[];
  projectArcanaSystems: LoreEntry[];
  onOperationModeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onCustomSystemInstructionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onInputPromptChange: (value: string) => void;
  onClearInput: () => void;
  onSubmit: () => Promise<void>;
  onCopyResponse: (isYaml?: boolean) => Promise<void>;
  onSaveResponseAsNewNote: () => void;
  aiResponseRef: React.RefObject<HTMLDivElement>;
  onAutoCreateLoreEntries: (entries: Array<{ title: string; type: LoreEntry['type']; }>) => void;
}

const AIAssistPage: React.FC<AIAssistPageProps> = (props) => {
  // This page might have additional layout or context specific to AI tasks in the future.
  // For now, it directly renders the AiWriter component.
  return <AiWriter {...props} />;
};

export default AIAssistPage;
