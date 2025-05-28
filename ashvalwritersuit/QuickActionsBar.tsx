
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppTheme } from './NoteTaskApp';
import { LayoutDashboard, FilePlus2, Zap, Settings, LucideProps } from 'lucide-react';

interface ActionButtonProps {
  label: string;
  icon: React.ElementType<LucideProps>;
  onClick?: () => void;      // For direct actions
  navigateTo?: string;   // For navigation paths
  currentTheme: AppTheme;
}

const ActionButton: React.FC<ActionButtonProps> = ({ label, icon: Icon, onClick, navigateTo, currentTheme }) => {
  const navigate = useNavigate(); // useNavigate hook is called here

  const handleClick = () => {
    if (navigateTo) {
      navigate(navigateTo);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label={label}
      title={label}
      className={`p-3 rounded-full ${currentTheme.button} ${currentTheme.buttonText} hover:bg-opacity-80 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${currentTheme.focusRing} ring-offset-transparent`}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
};


interface QuickActionsBarProps {
  currentTheme: AppTheme;
  onAddNote: () => void;
}

const QuickActionsBar: React.FC<QuickActionsBarProps> = ({ currentTheme, onAddNote }) => {
  // Define actions with either onClick for direct functions or navigateTo for paths
  const actions: Array<Omit<ActionButtonProps, 'currentTheme'>> = [
    { label: 'ภาพรวม (Dashboard)', icon: LayoutDashboard, navigateTo: '/dashboard' },
    { label: 'เพิ่มโน้ตใหม่', icon: FilePlus2, onClick: onAddNote },
    { label: 'AI ผู้ช่วยนักเขียน', icon: Zap, navigateTo: '/ai-writer' },
    { label: 'ตั้งค่า', icon: Settings, navigateTo: '/settings' },
  ];

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 p-2 rounded-full shadow-2xl flex items-center gap-2 sm:gap-3
                  ${currentTheme.cardBg} border ${currentTheme.divider}`}
      role="toolbar"
      aria-label="แถบเครื่องมือด่วน"
    >
      {actions.map((actionProps) => (
        <ActionButton
          key={actionProps.label}
          {...actionProps} // Spread label, icon, onClick, navigateTo
          currentTheme={currentTheme}
        />
      ))}
    </div>
  );
};

export default QuickActionsBar;
