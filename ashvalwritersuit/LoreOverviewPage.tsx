
import React from 'react';
import { AppTheme } from './NoteTaskApp';
import { BookOpen, Construction } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface LoreOverviewPageProps {
  currentTheme: AppTheme;
}

const LoreOverviewPage: React.FC<LoreOverviewPageProps> = ({ currentTheme }) => {
  return (
    <div className="py-6">
      <h2 className={`text-3xl font-semibold ${currentTheme.text} mb-8 text-center flex items-center justify-center`}>
        <BookOpen className={`w-8 h-8 mr-3 ${currentTheme.accent.replace('bg-', 'text-')}`} />
        Lore Overview
      </h2>
      <div className={`${currentTheme.cardBg} p-8 rounded-xl shadow-xl text-center`}>
        <Construction size={48} className={`mx-auto mb-6 ${currentTheme.textSecondary} opacity-70`} />
        <h3 className={`text-xl font-semibold ${currentTheme.text} mb-3`}>
          Detailed Lore Categorization Coming Soon!
        </h3>
        <p className={`${currentTheme.textSecondary} mb-2`}>
          This section will soon provide a comprehensive overview of your world's lore, organized into categories like World Details, History, Magic, and more, as envisioned.
        </p>
        <p className={`${currentTheme.textSecondary} mb-6`}>
          In the meantime, you can manage specific lore types using the existing sections:
        </p>
        <div className="flex flex-wrap justify-center gap-4">
            <NavLink 
                to="/characters"
                className={`${currentTheme.button} ${currentTheme.buttonText} px-5 py-2.5 rounded-lg text-sm font-medium shadow-md hover:scale-105 transition-transform`}
            >
                View Characters
            </NavLink>
            <NavLink 
                to="/magic-systems"
                className={`${currentTheme.button} ${currentTheme.buttonText} px-5 py-2.5 rounded-lg text-sm font-medium shadow-md hover:scale-105 transition-transform`}
            >
                Manage Magic Systems
            </NavLink>
             <NavLink 
                to="/world-items"
                className={`${currentTheme.button} ${currentTheme.buttonText} px-5 py-2.5 rounded-lg text-sm font-medium shadow-md hover:scale-105 transition-transform`}
            >
                Explore World Items & Concepts
            </NavLink>
        </div>
      </div>
    </div>
  );
};

export default LoreOverviewPage;
