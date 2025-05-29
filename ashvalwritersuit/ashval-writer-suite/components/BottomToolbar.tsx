import React from 'react';

interface BottomToolbarProps {
  id: string;
  onToggleToolDrawer: () => void;
  onToggleFocusMode: () => void;
  isFocusModeActive: boolean;
  // Add props for new note, new task, AI assist if they trigger actions
}

const BottomToolbar: React.FC<BottomToolbarProps> = ({ id, onToggleToolDrawer, onToggleFocusMode, isFocusModeActive }) => {
  // Base classes for buttons, to be applied directly as per user's HTML structure.
  const buttonBaseClasses = "p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-indigo-500";

  return (
    <footer
      id={id}
      className="fixed bottom-0 left-0 right-0 h-14 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-[0_-2px_10px_rgba(0,0,0,0.07)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.2)] flex items-center justify-center space-x-2 sm:space-x-4 px-4 z-50 bottom-toolbar-transition" // Added named transition class
    >
      <button aria-label="สร้างโน้ตใหม่" className={buttonBaseClasses}>
        <i className="fas fa-file-alt text-lg sm:text-xl"></i>
        <span className="hidden sm:inline ml-1.5 text-xs">โน้ตใหม่</span>
      </button>
      <button aria-label="สร้างงานใหม่" className={buttonBaseClasses}>
        <i className="fas fa-plus-square text-lg sm:text-xl"></i>
        <span className="hidden sm:inline ml-1.5 text-xs">งานใหม่</span>
      </button>
      <button id="aiCompanionToggle" aria-label="AI Companion" className={`${buttonBaseClasses} text-indigo-500 dark:text-indigo-300`}>
        <i className="fas fa-brain text-lg sm:text-xl"></i>
        <span className="hidden sm:inline ml-1.5 text-xs">AI ช่วยเหลือ</span>
      </button>
      <button 
        id="toolDrawerButton" 
        onClick={onToggleToolDrawer}
        aria-label="เปิดลิ้นชักเครื่องมือ" 
        className={buttonBaseClasses}
      >
        <i className="fas fa-toolbox text-lg sm:text-xl"></i>
        <span className="hidden sm:inline ml-1.5 text-xs">เครื่องมือ</span>
      </button>
      <button 
        id="focusModeToggle" 
        onClick={onToggleFocusMode}
        aria-label="โหมดโฟกัส" 
        className={buttonBaseClasses}
      >
        <i className={`fas ${isFocusModeActive ? 'fa-eye-slash' : 'fa-eye'} text-lg sm:text-xl`}></i>
        <span className="hidden sm:inline ml-1.5 text-xs">โฟกัส</span>
      </button>
    </footer>
  );
};

export default BottomToolbar;