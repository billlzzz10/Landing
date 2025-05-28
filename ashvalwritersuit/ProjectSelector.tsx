
import React, { useState, useRef, useEffect } from 'react';
import { Project } from './types';
import { AppTheme } from './NoteTaskApp';
import { Package, ChevronDown, Plus, CheckCircle } from 'lucide-react'; 

interface ProjectSelectorProps {
  projects: Project[];
  activeProjectId: string | null;
  currentTheme: AppTheme;
  onSelectProject: (projectId: string | null) => void;
  onCreateProject: (projectName: string) => void;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  projects,
  activeProjectId,
  currentTheme,
  onSelectProject,
  onCreateProject,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const selectorRef = useRef<HTMLDivElement>(null);

  const activeProject = projects.find(p => p.id === activeProjectId);
  const displayLabel = activeProject ? activeProject.name : "โปรเจกต์ทั้งหมด";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCreateInput(false);
        setNewProjectName('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreate = () => {
    if (newProjectName.trim()) {
      onCreateProject(newProjectName.trim());
      setNewProjectName('');
      setShowCreateInput(false);
    } else {
      alert("กรุณาใส่ชื่อโปรเจกต์");
    }
  };

  const handleSelect = (id: string | null) => {
    onSelectProject(id);
    setIsOpen(false);
  }
  
  const baseInputStyle = `w-full px-3 py-2.5 rounded-lg ${currentTheme.inputBg} ${currentTheme.inputText} ${currentTheme.inputBorder} ${currentTheme.inputPlaceholder} ${currentTheme.focusRing} focus:border-transparent focus:outline-none text-sm`;

  return (
    <div className="relative" ref={selectorRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg ${currentTheme.cardBg} border ${currentTheme.divider} hover:border-opacity-70 transition-all duration-200 text-sm font-medium shadow-md`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Current project: ${displayLabel}. Click to change project.`}
      >
        <Package className={`w-5 h-5 ${currentTheme.accent.replace('bg-', 'text-')}`} />
        <span className={`${currentTheme.text} max-w-[150px] sm:max-w-[220px] truncate`}>{displayLabel}</span>
        <ChevronDown className={`w-5 h-5 ${currentTheme.textSecondary} transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute top-full right-0 mt-2 w-72 ${currentTheme.cardBg} border ${currentTheme.divider} rounded-xl shadow-2xl z-20 py-2.5`}>
          {showCreateInput ? (
            <div className="p-2.5 space-y-2.5 border-b ${currentTheme.divider} mb-2">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="ชื่อโปรเจกต์ใหม่..."
                className={baseInputStyle}
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
              />
              <div className="flex gap-2">
                <button
                    onClick={() => { setShowCreateInput(false); setNewProjectName('');}}
                    className={`flex-1 text-xs py-2 px-2.5 rounded-md ${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} font-medium hover:bg-opacity-80`}
                >
                    ยกเลิก
                </button>
                <button
                    onClick={handleCreate}
                    className={`flex-1 text-xs py-2 px-2.5 rounded-md ${currentTheme.button} ${currentTheme.buttonText} font-medium`}
                >
                    สร้าง
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCreateInput(true)}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm ${currentTheme.text} hover:${currentTheme.inputBg} transition-colors`}
            >
              <Plus className="w-4 h-4" /> สร้างโปรเจกต์ใหม่
            </button>
          )}
          
          <button
            onClick={() => handleSelect(null)}
            className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 text-sm ${currentTheme.text} hover:${currentTheme.inputBg} transition-colors 
                        ${!activeProjectId ? `${currentTheme.accent} bg-opacity-20 ${currentTheme.accent.replace('bg-','text-')} font-semibold` : ''}`}
          >
            <span>โปรเจกต์ทั้งหมด / ไม่ได้กำหนด</span>
            {!activeProjectId && <CheckCircle size={16} className={`${currentTheme.accent.replace('bg-', 'text-')}`} />}
          </button>

          {projects.length > 0 && <div className={`my-1.5 border-t ${currentTheme.divider}`}></div>}
          
          <div className="max-h-56 overflow-y-auto custom-scrollbar">
            {projects.map(project => (
              <button
                key={project.id}
                onClick={() => handleSelect(project.id)}
                className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 text-sm ${currentTheme.text} hover:${currentTheme.inputBg} transition-colors
                            ${activeProjectId === project.id ? `${currentTheme.accent} bg-opacity-20 ${currentTheme.accent.replace('bg-','text-')} font-semibold` : ''}`}
              >
                <span className="truncate">{project.name}</span>
                {activeProjectId === project.id && <CheckCircle size={16} className={`${currentTheme.accent.replace('bg-', 'text-')}`} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSelector;
