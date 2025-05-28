
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AppTheme } from './NoteTaskApp'; 
import { LucideProps, BookOpen } from 'lucide-react'; // Added BookOpen for Inkweaver branding

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType<LucideProps>;
  path: string; 
}

interface SidebarProps {
  activeTabId: string; 
  currentTheme: AppTheme;
  mainNavItems: NavItem[];
  setIsMobileMenuOpen: (isOpen: boolean) => void; 
}

const Sidebar: React.FC<SidebarProps> = ({ activeTabId, currentTheme, mainNavItems, setIsMobileMenuOpen }) => {
  const location = useLocation();

  return (
    <aside className={`hidden md:flex md:flex-col md:w-64 ${currentTheme.cardBg} fixed top-0 left-0 h-full shadow-lg z-20 pt-[calc(var(--header-height,68px)+0.5rem)] pb-4 space-y-1.5 overflow-y-auto custom-scrollbar`}>
      {/* Removed the "Ashval" text logo from here as it's in the main header */}
      <nav className="flex-grow px-3 space-y-1.5">
        {mainNavItems.map(item => (
          <NavLink
            key={item.id}
            to={item.path}
            onClick={() => setIsMobileMenuOpen(false)} 
            className={({ isActive }) =>
              `w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium
              ${isActive
                ? `${currentTheme.accent} ${currentTheme.accentText} shadow-md`
                : `${currentTheme.textSecondary} hover:${currentTheme.inputBg} hover:${currentTheme.text} hover:text-opacity-100`
              }`
            }
            aria-current={location.pathname === item.path ? "page" : undefined}
          >
            <item.icon className={`w-5 h-5 flex-shrink-0 ${location.pathname === item.path ? currentTheme.accentText : currentTheme.textSecondary + ' opacity-70'}`} />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className={`px-4 mt-auto pt-3 border-t ${currentTheme.divider} border-opacity-50`}>
        <p className={`text-xs ${currentTheme.textSecondary} text-center opacity-70`}>
          Inkweaver ชุดเครื่องมือสำหรับนักเขียน
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;