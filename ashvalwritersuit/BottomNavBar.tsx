import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, StickyNote, CheckSquare, Bot } from 'lucide-react';
import { AppTheme } from './types';

interface BottomNavBarProps {
  currentTheme: AppTheme;
  onNavigate: (path: string) => void; // Optional: if any action needed on navigate like closing a modal
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentTheme, onNavigate }) => {
  const location = useLocation();

  const navItems: NavItem[] = [
    { path: '/', label: 'หน้าหลัก', icon: Home },
    { path: '/notes', label: 'โน้ต', icon: StickyNote },
    { path: '/tasks', label: 'งาน', icon: CheckSquare },
    { path: '/ai', label: 'AI', icon: Bot },
  ];

  // Determine if the theme is dark to adjust glass effect
  const isDark = currentTheme.name.toLowerCase().includes('dark') || currentTheme.name.toLowerCase().includes('deep');
  const navBgClass = isDark ? 'bg-slate-800/80 backdrop-blur-md' : 'bg-white/80 backdrop-blur-md';
  const navBorderClass = isDark ? currentTheme.sidebarBorder || 'border-slate-700/70' : currentTheme.sidebarBorder || 'border-gray-300/70';


  return (
    <nav 
      className={`fixed bottom-0 left-0 right-0 z-30 md:hidden ${navBgClass} border-t ${navBorderClass} flex justify-around items-center h-16 shadow-top`}
      aria-label="Mobile bottom navigation"
    >
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path === '/' && location.pathname.startsWith('/dashboard')); // Treat /dashboard as home for active state
        const IconComponent = item.icon;
        const iconColor = isActive ? (currentTheme.sidebarActiveText || currentTheme.accentText || currentTheme.accent.replace('bg-','text-')) : (currentTheme.textSecondary || 'text-gray-500');
        const textColor = isActive ? (currentTheme.sidebarActiveText || currentTheme.accentText || currentTheme.accent.replace('bg-','text-')) : (currentTheme.textSecondary || 'text-gray-500');

        return (
          <NavLink
            key={item.label}
            to={item.path}
            onClick={() => onNavigate(item.path)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors duration-150 focus:outline-none focus:ring-1 ${currentTheme.focusRing || 'focus:ring-sky-500'} rounded-md`}
            aria-current={isActive ? 'page' : undefined}
          >
            <IconComponent className={`w-5 h-5 mb-0.5 ${iconColor}`} />
            <span className={`text-xs ${textColor}`}>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default BottomNavBar;
