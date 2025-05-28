
import React from 'react';
import { ListFilter } from 'lucide-react';
import { AppTheme } from './NoteTaskApp';

interface CategoryFilterControlProps {
  categories: string[];
  activeFilter: string;
  onFilterChange: (category: string) => void;
  getCategoryIcon: (category: string) => JSX.Element;
  currentTheme: AppTheme;
  label: string;
}

const CategoryFilterControl: React.FC<CategoryFilterControlProps> = ({
  categories,
  activeFilter,
  onFilterChange,
  getCategoryIcon,
  currentTheme,
  label,
}) => {
  if (categories.length <= 1 && categories[0] === 'all') { // Don't render if only "all" category exists
    return null;
  }

  return (
    <div className={`${currentTheme.cardBg} p-4 rounded-xl shadow-lg mb-6 flex items-center gap-2.5 flex-wrap`}>
      <span className={`text-sm font-medium mr-2 ${currentTheme.textSecondary} flex items-center`}>
        <ListFilter className="w-4 h-4 mr-1.5"/>{label}:
      </span>
      {categories.map(category => (
        <button
          key={category}
          onClick={() => onFilterChange(category)}
          className={`px-3.5 py-2 text-xs rounded-lg transition-all duration-200 flex items-center gap-1.5 font-medium shadow-sm
            ${activeFilter === category 
              ? `${currentTheme.accent} ${currentTheme.accentText} ring-2 ring-offset-2 ring-offset-transparent ${currentTheme.accent.replace('bg-','ring-')}` 
              : `${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} hover:bg-opacity-80`}
          `}
          aria-pressed={activeFilter === category}
        >
          {category !== 'all' && React.cloneElement(getCategoryIcon(category), { size: 14, className: `opacity-90 ${activeFilter === category ? currentTheme.accentText : ''}` })}
          <span className={activeFilter === category ? currentTheme.accentText : ''}>
            {category === 'all' ? 'ทั้งหมด' : category}
          </span>
        </button>
      ))}
    </div>
  );
};

export default CategoryFilterControl;
