
import React from 'react';
import type { Icon as LucideIconType } from 'lucide-react'; // Keep this for specific icon props if needed, or use ElementType

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType; // Corrected type for Lucide icons
  path: string;
  disabled?: boolean;
  children?: NavItem[]; // For nested navigation
}

interface SidebarProps {
  navItems: NavItem[];
  isSidebarOpen: boolean;
  onNavigate: (path: string) => void; // Callback to handle navigation
}

const Sidebar: React.FC<SidebarProps> = ({ navItems, isSidebarOpen, onNavigate }) => {
  if (!isSidebarOpen) return null;

  return (
    <aside className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-gray-100 dark:bg-gray-800 shadow-lg p-4 transition-transform duration-300 ease-in-out z-30 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 overflow-y-auto`}>
      <nav>
        <ul>
          {navItems.map(item => (
            <li key={item.id} className="mb-1">
              <a
                href={`#${item.path}`} // Using hash for client-side nav with react-router-dom
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.path);
                }}
                className="flex items-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <item.icon size={20} className="mr-3" />
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;