import React, { forwardRef } from 'react';

interface SidebarProps {
  id: string;
  isOpen: boolean;
  onClose: () => void; // Added for explicit close, e.g. via a close button if implemented
}

const Sidebar = forwardRef<HTMLElement, SidebarProps>(({ id, isOpen, onClose }, ref) => {
  const navItems = [
    { href: '#dashboard', icon: 'fas fa-chart-pie', label: 'แดชบอร์ด', current: true },
    { href: '#notes', icon: 'fas fa-sticky-note', label: 'โน้ต' },
    { href: '#tasks', icon: 'fas fa-tasks', label: 'งาน' },
    { href: '#ai-writer', icon: 'fas fa-robot', label: 'AI Writer' },
  ];

  return (
    <aside
      id={id}
      ref={ref}
      className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-indigo-700 via-indigo-800 to-indigo-900 dark:from-indigo-800 dark:via-indigo-900 dark:to-black shadow-2xl rounded-r-2xl p-5 pt-6 flex flex-col transform transition-transform duration-300 ease-in-out z-40
                  ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      aria-label="Sidebar navigation"
    >
      <div className="mb-8 flex items-center space-x-3">
        <div className="p-2 bg-white/20 rounded-lg" aria-hidden="true">
          <span className="text-2xl text-white font-extrabold select-none">✍️</span>
        </div>
        <h2 className="text-white text-xl font-bold tracking-wide">Ashval</h2>
      </div>
      <nav className="flex-1 flex flex-col space-y-2 text-indigo-100" role="navigation">
        {navItems.map(item => (
          <a
            key={item.label}
            href={item.href}
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg smooth-transition 
                        ${item.current 
                          ? 'bg-white/10 dark:bg-white/5 shadow-sm text-white font-medium' 
                          : 'hover:bg-white/10 dark:hover:bg-white/5 text-indigo-100'}`}
            aria-current={item.current ? 'page' : undefined}
            onClick={onClose} // Close sidebar on nav item click for mobile-like experience
          >
            <i className={`${item.icon} text-lg w-6 text-center ${item.current ? 'opacity-90' : 'opacity-70'}`}></i>
            <span className="text-sm">{item.label}</span>
          </a>
        ))}
      </nav>
      <div className="mt-auto pt-4 border-t border-white/10">
        <button
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-medium shadow-md hover:from-pink-600 hover:to-purple-700 smooth-transition flex items-center justify-center space-x-2"
        >
          <i className="fas fa-sign-out-alt"></i>
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';
export default Sidebar;