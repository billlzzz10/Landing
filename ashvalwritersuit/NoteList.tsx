
import React, { useState } from 'react';
import { AppNote, Project } from './types';
import { AppTheme } from './NoteTaskApp';
import NoteCard from './NoteCard'; // Changed from NoteItem
import CategoryFilterControl from './CategoryFilterControl';
import { Plus, Search, FileText, X, Eye } from 'lucide-react';

interface NoteListProps {
  notes: AppNote[];
  currentTheme: AppTheme;
  onViewNote: (note: AppNote) => void;
  onDeleteNote: (id: number) => void;
  onAddNote: () => void;
  getCategoryIcon: (category: string) => JSX.Element;
  projects: Project[];
  activeProjectId: string | null;
  onAnalyzeWithAi: (note: AppNote) => void; // New prop
}

const NoteList: React.FC<NoteListProps> = ({
  notes,
  currentTheme,
  onViewNote,
  onDeleteNote,
  onAddNote,
  getCategoryIcon,
  projects,
  activeProjectId,
  onAnalyzeWithAi, // Destructure new prop
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [previewNote, setPreviewNote] = useState<AppNote | null>(null);

  const projectNotes = notes.filter(note => 
    !activeProjectId || note.projectId === activeProjectId || note.projectId === null
  );

  const filteredNotes = projectNotes
    .filter(note => activeCategoryFilter === 'all' || note.category.toLowerCase() === activeCategoryFilter.toLowerCase())
    .filter(note =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.rawMarkdownContent || note.content).toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      note.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const allCategories = ['all', ...Array.from(new Set(projectNotes.map(note => note.category.toLowerCase())))];
  
  const getProjectName = (projectId?: string | null) => {
    if (!projectId) return undefined;
    return projects.find(p => p.id === projectId)?.name;
  };

  const handleQuickPreview = (note: AppNote) => {
    setPreviewNote(note);
  };

  const closePreview = () => {
    setPreviewNote(null);
  };
  
  const isDarkTheme = ['deepSpace', 'midnightNavy', 'forestBlue', 'royalPink', 'deepOcean'].includes(currentTheme.name);


  return (
    <div className="py-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className={`text-2xl sm:text-3xl font-semibold ${currentTheme.text} flex items-center`}>
          <FileText className={`w-7 h-7 mr-2 ${currentTheme.accent.replace('bg-','text-')}`} />
          {activeCategoryFilter === 'all' ? 'โน้ตทั้งหมด' : `โน้ต: ${activeCategoryFilter}`} ({filteredNotes.length})
        </h1>
        <button
          onClick={onAddNote}
          className={`${currentTheme.button} ${currentTheme.buttonText} px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center text-sm font-medium`}
        >
          <Plus className="w-5 h-5 mr-1.5" /> เพิ่มโน้ตใหม่
        </button>
      </div>

      <div className={`${currentTheme.cardBg} p-4 rounded-xl shadow-lg mb-6`}>
        <div className="relative">
          <input
            type="text"
            placeholder="ค้นหาโน้ต (ชื่อ, เนื้อหา, แท็ก, หมวดหมู่)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full py-3 pl-10 pr-4 rounded-lg ${currentTheme.inputBg} ${currentTheme.inputText} ${currentTheme.inputBorder} ${currentTheme.focusRing} focus:border-transparent focus:outline-none text-sm`}
            aria-label="ค้นหาโน้ต"
          />
          <Search className={`w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 ${currentTheme.textSecondary} opacity-70`} />
        </div>
      </div>
      
      <CategoryFilterControl
        categories={allCategories}
        activeFilter={activeCategoryFilter}
        onFilterChange={setActiveCategoryFilter}
        getCategoryIcon={getCategoryIcon}
        currentTheme={currentTheme}
        label="กรองตามหมวดหมู่"
      />

      <div className="flex gap-6">
        <div className={`flex-grow ${previewNote ? 'w-full md:w-3/5' : 'w-full'}`}>
          {filteredNotes.length === 0 ? (
            <p className={`${currentTheme.textSecondary} italic text-center py-10`}>
              {projectNotes.length === 0 ? (activeProjectId ? 'โปรเจกต์นี้ยังไม่มีโน้ต' : 'ยังไม่มีโน้ตใดๆ') : 'ไม่พบโน้ตที่ตรงกับการค้นหา/ตัวกรอง'}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
              {filteredNotes.map(note => (
                <NoteCard // Changed from NoteItem
                  key={note.id}
                  note={note}
                  currentTheme={currentTheme}
                  onViewNote={onViewNote}
                  onDeleteNote={onDeleteNote}
                  getCategoryIcon={getCategoryIcon}
                  projectName={getProjectName(note.projectId)}
                  onQuickPreview={handleQuickPreview} 
                  onAnalyzeWithAi={onAnalyzeWithAi} 
                />
              ))}
            </div>
          )}
        </div>

        {previewNote && (
          <div className={`hidden md:block md:w-2/5 p-5 rounded-xl shadow-xl ${currentTheme.cardBg} border ${currentTheme.divider} sticky top-[calc(var(--header-height,68px)+1.5rem)] max-h-[calc(100vh-var(--header-height,68px)-3rem)] overflow-y-auto custom-scrollbar`}>
            <div className="flex justify-between items-center mb-3">
              <h3 className={`text-lg font-semibold ${currentTheme.text} truncate flex items-center gap-2`}>
                {previewNote.icon && <span className="text-xl">{previewNote.icon}</span>}
                {previewNote.title}
              </h3>
              <button onClick={closePreview} className={`${currentTheme.textSecondary} p-1 rounded-md hover:bg-white/10`} aria-label="ปิดตัวอย่างเร็ว">
                <X size={20} />
              </button>
            </div>
            <div className={`text-xs ${currentTheme.textSecondary} mb-1 flex items-center gap-1.5`}>
              {getCategoryIcon(previewNote.category)} {previewNote.category}
            </div>
            {previewNote.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                    {previewNote.tags.map(tag => (
                        <span key={tag} className={`${currentTheme.accent} bg-opacity-20 text-xs px-2 py-0.5 rounded-full ${currentTheme.accent.replace('bg-','text-')} opacity-80`}>
                            #{tag}
                        </span>
                    ))}
                </div>
            )}
            <div 
              className={`prose-sm ${isDarkTheme ? 'prose-dark dark' : ''} max-w-none ${currentTheme.text} opacity-90 text-sm leading-relaxed overflow-y-auto max-h-[calc(100vh-var(--header-height,68px)-15rem)] custom-scrollbar p-1`}
              dangerouslySetInnerHTML={{ __html: window.marked?.parse(previewNote.rawMarkdownContent || previewNote.content || '') || (previewNote.rawMarkdownContent || previewNote.content || '') }}
            />
            <button
                onClick={() => { onViewNote(previewNote); closePreview(); }}
                className={`mt-4 w-full ${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} px-3 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-opacity-80 flex items-center justify-center gap-1.5`}
            >
               <Eye size={14}/> ดูรายละเอียดเต็ม (แก้ไข/ใช้ AI)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteList;