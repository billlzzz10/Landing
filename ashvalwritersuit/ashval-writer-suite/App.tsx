

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import BottomToolbar from './components/BottomToolbar';
import ToolDrawer from './components/ToolDrawer';
// import DashboardPage from './components/DashboardPage'; // Replaced by NoteTaskApp
import NoteTaskApp from './NoteTaskApp'; // Import the main application component
import themeService from './services/themeService';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isToolDrawerOpen, setIsToolDrawerOpen] = useState(false);
  const [isFocusModeActive, setIsFocusModeActive] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(themeService.isDarkMode());

  const sidebarRef = useRef<HTMLElement>(null);
  const sidebarToggleRef = useRef<HTMLButtonElement>(null);
  const toolDrawerRef = useRef<HTMLDivElement>(null); 
  const toolDrawerButtonRef = useRef<HTMLButtonElement>(null); 

  const handleThemeToggle = () => {
    themeService.toggleTheme();
    setIsDarkMode(themeService.isDarkMode());
  };

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const toggleToolDrawer = useCallback(() => {
    setIsToolDrawerOpen(prev => !prev);
  }, []);
  
  const closeToolDrawer = useCallback(() => {
    setIsToolDrawerOpen(false);
  }, []);

  const toggleFocusMode = useCallback(() => {
    setIsFocusModeActive(prev => {
      if (!prev) { // Entering focus mode
        closeSidebar();
        closeToolDrawer();
      }
      return !prev;
    });
  }, [closeSidebar, closeToolDrawer]);

  useEffect(() => {
    const body = document.body;
    if (isFocusModeActive) {
      body.classList.add('focus-mode-active');
    } else {
      body.classList.remove('focus-mode-active');
    }
  }, [isFocusModeActive]);

  useEffect(() => {
    const body = document.body;
    if (isSidebarOpen && window.innerWidth < 640) { // sm breakpoint
        body.classList.add('overflow-hidden-sm-down');
    } else {
        body.classList.remove('overflow-hidden-sm-down');
    }
  }, [isSidebarOpen]);


  // Global click listener to close drawers/sidebars
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close sidebar
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        sidebarToggleRef.current && 
        !sidebarToggleRef.current.contains(event.target as Node) &&
        isSidebarOpen 
      ) {
        closeSidebar();
      }

      if (
        toolDrawerRef.current &&
        !toolDrawerRef.current.contains(event.target as Node) &&
        (!toolDrawerButtonRef.current || !toolDrawerButtonRef.current.contains(event.target as Node)) &&
        isToolDrawerOpen 
      ) {
        // closeToolDrawer(); 
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isSidebarOpen, closeSidebar, isToolDrawerOpen, closeToolDrawer]);
  
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);


  return (
    <div className="min-h-screen flex flex-col">
      <Header
        id="app-header"
        onToggleSidebar={toggleSidebar}
        onToggleTheme={handleThemeToggle}
        isDarkMode={isDarkMode}
        sidebarToggleRef={sidebarToggleRef} 
      />
      <Sidebar
        id="app-sidebar"
        ref={sidebarRef}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />
      {isSidebarOpen && (
        <div
          id="app-sidebar-backdrop"
          className="fixed inset-0 bg-black/60 dark:bg-black/70 z-30 transition-opacity duration-300 lg:hidden" 
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
      
      <main
        id="app-main-content"
        className={`flex-1 pt-16 transition-all duration-300 ease-in-out 
                    ${isSidebarOpen && window.innerWidth >= 640 ? 'sm:ml-64' : ''} 
                    pb-14`} 
      >
        {/* Render the main application logic component */}
        <NoteTaskApp 
            outerIsDarkMode={isDarkMode} 
            outerToggleTheme={handleThemeToggle}
            outerIsSidebarOpen={isSidebarOpen}
            outerToggleSidebar={toggleSidebar}
        />
      </main>
      
      <ToolDrawer
        id="app-tool-drawer"
        ref={toolDrawerRef}
        isOpen={isToolDrawerOpen}
        onClose={closeToolDrawer}
      />
      
      <BottomToolbar
        id="app-bottom-toolbar"
        onToggleToolDrawer={toggleToolDrawer}
        onToggleFocusMode={toggleFocusMode}
        isFocusModeActive={isFocusModeActive}
      />
    </div>
  );
};

export default App;