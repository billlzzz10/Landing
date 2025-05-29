import React from 'react';

interface HeaderProps {
  id: string;
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  isDarkMode: boolean;
  sidebarToggleRef: React.RefObject<HTMLButtonElement>;
  // Add other props for search, more options if needed
}

const Header: React.FC<HeaderProps> = ({ id, onToggleSidebar, onToggleTheme, isDarkMode, sidebarToggleRef }) => {
  return (
    <header
      id={id}
      className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm flex items-center justify-between px-4 sm:px-6 z-50 smooth-transition"
    >
      <button
        ref={sidebarToggleRef}
        id="sidebarToggle"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        className="text-indigo-600 dark:text-indigo-400 text-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-indigo-500 rounded-md p-1"
      >
        <i className="fas fa-bars"></i>
      </button>
      <h1 className="text-indigo-700 dark:text-indigo-300 font-bold text-lg sm:text-xl select-none truncate px-2">
        ✍️ Ashval Writer's Suite
      </h1>
      <div className="flex items-center space-x-2 sm:space-x-3">
        <button
          id="globalSearchButton"
          aria-label="ค้นหา"
          className="text-indigo-600 dark:text-indigo-400 p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-indigo-500 smooth-transition"
        >
          <i className="fas fa-search"></i>
        </button>
        <button
          id="themeToggle"
          onClick={onToggleTheme}
          aria-label="Toggle dark mode"
          className="text-indigo-600 dark:text-indigo-400 p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-indigo-500 smooth-transition"
        >
          {isDarkMode ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
        </button>
        <button
          id="headerMoreOptions"
          aria-label="More options"
          className="text-indigo-600 dark:text-indigo-400 p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-indigo-500 smooth-transition"
        >
          <i className="fas fa-ellipsis-v"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;