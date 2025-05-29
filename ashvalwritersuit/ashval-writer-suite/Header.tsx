
import React, { useState } from 'react';
import { Project, AppTheme } from './types'; 
import type { NavItem } from './Sidebar';
import { Menu, Settings, Palette, Search, PlusCircle, ChevronDown } from 'lucide-react';

interface HeaderProps {
  navItems: NavItem[];
  activeProjectId: string | null;
  projects: Project[];
  onProjectSelect: (projectId: string) => void;
  onCreateProject: (projectName: string) => Promise<boolean>;
  activeThemeKey: string;
  onThemeChange: (themeKey: string) => void;
  userApiKey?: string; // Optional, if API key can be set via UI
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNavigate: (path: string) => void;
}

const Header: React.FC<HeaderProps> = (
    { 
        navItems, 
        activeProjectId, 
        projects, 
        onProjectSelect, 
        onCreateProject, 
        activeThemeKey, 
        onThemeChange, 
        userApiKey, 
        isSidebarOpen, 
        onToggleSidebar,
        onNavigate
    }) => {
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const currentProject = projects.find(p => p.id === activeProjectId);

  const handleProjectCreation = async () => {
    if (newProjectName.trim()) {
      const success = await onCreateProject(newProjectName.trim());
      if (success) {
        setNewProjectName(''); // Clear input
        setShowProjectDropdown(false); // Close dropdown
      } else {
        // Handle creation failure (e.g., show error message)
        console.error("Failed to create project");
      }
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-md p-3 flex items-center justify-between fixed top-0 left-0 right-0 z-40 h-16">
      <div className="flex items-center">
        <button onClick={onToggleSidebar} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 mr-2">
          <Menu size={24} />
        </button>
        <div className="relative">
          <button 
            onClick={() => setShowProjectDropdown(!showProjectDropdown)}
            className="flex items-center p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <span className="font-semibold mr-1">{currentProject?.name || "Select Project"}</span>
            <ChevronDown size={18} />
          </button>
          {showProjectDropdown && (
            <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-50">
              {projects.filter(p => !p.isArchived).map(project => (
                <a
                  key={project.id}
                  href="#"
                  onClick={(e) => { e.preventDefault(); onProjectSelect(project.id); setShowProjectDropdown(false); }}
                  className={`block px-4 py-2 text-sm ${activeProjectId === project.id ? 'bg-indigo-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                >
                  {project.name}
                </a>
              ))}
              <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
              <div className="px-4 py-2">
                <input 
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="New project name"
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-500 rounded-md text-sm dark:bg-gray-600"
                />
                <button 
                  onClick={handleProjectCreation}
                  className="mt-2 w-full bg-indigo-500 hover:bg-indigo-600 text-white text-sm px-3 py-1 rounded-md flex items-center justify-center"
                >
                  <PlusCircle size={16} className="mr-1"/> Create
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        {/* Placeholder for global search if needed */}
        {/* <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <Search size={20} />
        </button> */}
        <button 
            onClick={() => onThemeChange(activeThemeKey === 'obsidianNight' ? 'defaultLight' : 'obsidianNight')} 
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Toggle Theme"
        >
          <Palette size={20} />
        </button>
        <button 
            onClick={() => onNavigate('/settings')} 
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Settings"
        >
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;