
import React from 'react';
import { AppNote } from './types';
import { Trash2, Package, Eye, SearchCheck, Brain } from 'lucide-react'; 
import { AppTheme } from './NoteTaskApp'; // Assuming AppTheme is in NoteTaskApp

interface NoteCardProps {
  note: AppNote;
  currentTheme: AppTheme;
  onViewNote: (note: AppNote) => void;
  onDeleteNote: (id: number) => void;
  getCategoryIcon: (category: string) => JSX.Element;
  projectName?: string; 
  onQuickPreview: (note: AppNote) => void; 
  onAnalyzeWithAi: (note: AppNote) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ 
  note, 
  currentTheme, 
  onViewNote, 
  onDeleteNote, 
  getCategoryIcon, 
  projectName, 
  onQuickPreview,
  onAnalyzeWithAi 
}) => {
  const getPovCharacter = (markdownContent: string): string | null => {
    const povMatch = markdownContent.match(/pov:\s*(.+)/i);
    return povMatch ? povMatch[1].trim() : null;
  };
  const pov = getPovCharacter(note.rawMarkdownContent || note.content);

  return (
    <div 
      key={note.id} 
      className={`${currentTheme.cardBg} p-4 rounded-lg shadow-lg group flex flex-col justify-between transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl`}
      role="listitem" 
      aria-label={`โน้ต ${note.title}`}
    >
      <div>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2 overflow-hidden flex-grow cursor-pointer" onClick={() => onViewNote(note)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onViewNote(note); }}>
            {note.icon && <span className="text-xl flex-shrink-0" role="img" aria-hidden="true">{note.icon}</span>}
            <span className={`flex-shrink-0 ${currentTheme.accent.replace('bg-','text-')} opacity-80`}>{getCategoryIcon(note.category)}</span>
            <h2 className={`font-semibold ${currentTheme.text} text-md truncate leading-tight`}>{note.title}</h2>
          </div>
          <div className="flex items-center gap-1 sm:gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onQuickPreview(note); }}
              className={`${currentTheme.textSecondary} hover:text-opacity-100 p-1.5 rounded-md hover:${currentTheme.inputBg} transition-colors`}
              aria-label={`ดูตัวอย่างเร็วโน้ต ${note.title}`}
              title="ดูตัวอย่างเร็ว"
            >
              <SearchCheck className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onViewNote(note); }}
              className={`${currentTheme.textSecondary} hover:text-opacity-100 p-1.5 rounded-md hover:${currentTheme.inputBg} transition-colors`}
              aria-label={`ดูรายละเอียดโน้ต ${note.title}`}
              title="ดูรายละเอียดเต็ม"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); }}
              className="text-red-500 hover:text-red-400 p-1.5 rounded-md hover:bg-red-500/10 transition-colors"
              aria-label={`ลบโน้ต ${note.title}`}
              title="ลบโน้ต"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {pov && <p className={`text-xs ${currentTheme.textSecondary} mb-1.5`}>มุมมอง: {pov}</p>}

        <p className={`${currentTheme.textSecondary} text-sm mb-3 line-clamp-3 leading-relaxed cursor-pointer min-h-[3.75rem]`} onClick={() => onViewNote(note)}>
          { (note.rawMarkdownContent || note.content).substring(0,150) }
          { (note.rawMarkdownContent || note.content).length > 150 && '...' }
        </p>
      </div>

      <div className="mt-auto space-y-2.5">
        <button
          onClick={(e) => { e.stopPropagation(); onAnalyzeWithAi(note); }}
          className={`w-full text-xs ${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} hover:opacity-90 px-3 py-2 rounded-md transition-colors duration-200 flex items-center justify-center gap-1.5`}
        >
          <Brain size={14} /> ส่งให้ AI วิเคราะห์
        </button>
        
        {projectName && (
            <div className={`text-xs ${currentTheme.textSecondary} opacity-80 flex items-center`}>
                <Package size={14} className="mr-1.5 opacity-70"/> {projectName}
            </div>
        )}
        <div className="flex gap-1.5 flex-wrap">
          {note.tags.map(tag => (
            <span key={tag} className={`${currentTheme.accent} bg-opacity-10 text-xs px-2 py-0.5 rounded-full ${currentTheme.accent.replace('bg-','text-')} font-medium`}>
              #{tag}
            </span>
          ))}
        </div>
        <span className={`text-xs ${currentTheme.textSecondary} opacity-70 block`}>
            อัปเดต: {new Date(note.updatedAt || note.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>
    </div>
  );
};

export default NoteCard;