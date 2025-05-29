import React from 'react';
import { Home, StickyNote, CheckSquare, Settings, Edit3 } from 'lucide-react'; // Example icons

interface BottomNavBarProps {
  onNavigate: (path: string) => void;
  // activePath?: string; // To highlight current tab
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ onNavigate }) => {
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/notes', icon: StickyNote, label: 'Notes' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/ai-writer', icon: Edit3, label: 'AI' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] flex justify-around items-center p-2 border-t border-gray-200 dark:border-gray-700 md:hidden z-40 h-14">
      {navItems.map(item => (
        <button
          key={item.path}
          onClick={() => onNavigate(item.path)}
          className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 p-1"
          aria-label={item.label}
        >
          <item.icon size={22} />
          <span className="text-xs mt-0.5">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};
export default BottomNavBar;