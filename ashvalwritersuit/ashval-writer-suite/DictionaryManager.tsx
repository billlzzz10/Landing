import React from 'react';

// Assuming learnedWordsAi (Set<string>) and setLearnedWordsAi would be props
const DictionaryManager: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Learned Words Dictionary</h2>
      <p className="text-gray-600 dark:text-gray-300">Interface for managing AI learned words will be here.</p>
    </div>
  );
};
export default DictionaryManager;