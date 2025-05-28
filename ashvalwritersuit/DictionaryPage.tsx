
import React from 'react';
import DictionaryManager from './DictionaryManager';
import { AppTheme } from './NoteTaskApp';

interface DictionaryPageProps {
  learnedWords: Set<string>;
  setLearnedWords: React.Dispatch<React.SetStateAction<Set<string>>>;
  currentTheme: AppTheme;
}

const DictionaryPage: React.FC<DictionaryPageProps> = (props) => {
  return <DictionaryManager {...props} />;
};

export default DictionaryPage;
