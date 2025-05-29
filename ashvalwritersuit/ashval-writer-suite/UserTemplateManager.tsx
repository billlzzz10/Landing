import React from 'react';
import { UserNoteTemplate } from './types';

interface UserTemplateManagerProps {
  userTemplates: UserNoteTemplate[];
  setUserTemplates: React.Dispatch<React.SetStateAction<UserNoteTemplate[]>>;
  // CRUD operations for templates
}

const UserTemplateManager: React.FC<UserTemplateManagerProps> = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">User Note Templates</h2>
      <p className="text-gray-600 dark:text-gray-300">Interface for managing user-created note templates will be here.</p>
    </div>
  );
};
export default UserTemplateManager;