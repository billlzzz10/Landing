
import React from 'react';
import { Palette } from 'lucide-react';
import { AppTheme } from './NoteTaskApp'; 

interface ThemeSelectorProps {
  themes: Record<string, AppTheme>; 
  activeTheme: string; // This is the key of the active theme, e.g., "inkweaverDark"
  currentThemeStyles: AppTheme; // This is the full style object of the active theme
  setActiveTheme: (themeKey: string) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ themes, activeTheme, currentThemeStyles, setActiveTheme }) => {
  const [showSelector, setShowSelector] = React.useState(false);
  const selectorRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setShowSelector(false);
      }
    };
    if (showSelector) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSelector]);

  return (
    <div className="relative inline-block" ref={selectorRef}>
      <button
        onClick={() => setShowSelector(!showSelector)}
        className={`p-3 rounded-full transition-all duration-300 shadow-lg
                    ${showSelector ? `${currentThemeStyles.accent} ${currentThemeStyles.accentText}` : `${currentThemeStyles.cardBg} ${currentThemeStyles.textSecondary} hover:bg-opacity-90`}
                  `}
        title="Select Theme"
        aria-label="Select Theme"
        aria-expanded={showSelector}
      >
        <Palette className="w-5 h-5" />
      </button>
      {showSelector && (
        <div 
          className={`absolute top-full right-0 mt-2 w-auto min-w-[180px] sm:min-w-[220px] md:min-w-[260px] ${currentThemeStyles.cardBg} rounded-xl p-3 sm:p-4 shadow-2xl border ${currentThemeStyles.divider} z-50`}
        >
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
            {Object.entries(themes).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => { setActiveTheme(key); setShowSelector(false);}}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full transition-all duration-300 transform ${theme.bg} 
                  ${activeTheme === key 
                    ? `ring-3 ring-offset-2 ${theme.name === 'Classic Light' ? 'ring-indigo-500' : 'ring-teal-400'} ring-offset-transparent scale-110 shadow-xl` 
                    : 'hover:scale-105 hover:shadow-md'
                  }
                `}
                title={theme.name}
                aria-label={`Set theme to ${theme.name}`}
                style={{ 
                  // Ensure border color is visible on the card background of the selector itself
                  borderColor: activeTheme === key ? (currentThemeStyles.name === 'Classic Light' ? currentThemeStyles.accent.replace('bg-','border-') : 'rgba(255,255,255,0.3)') : 'transparent',
                  boxShadow: activeTheme === key ? `0 0 0 2px ${theme.name === 'Classic Light' ? theme.accent.replace('bg-','var(--tw-ring-color, #4f46e5)') : 'var(--tw-ring-color, #2dd4bf)' }` : undefined // teal-400, indigo-500
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
