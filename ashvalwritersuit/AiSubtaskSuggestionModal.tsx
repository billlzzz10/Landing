

import React, { useState, useEffect } from 'react';
import { ListTree, CheckSquare, Square, X, Loader2, AlertTriangle } from 'lucide-react'; // Changed XCircle to X
import { AppTheme } from './NoteTaskApp';

interface AiSubtaskSuggestionModalProps {
  show: boolean;
  taskTitle: string;
  suggestedSubtasks: string[];
  isLoadingSuggestions: boolean;
  errorSubtaskGeneration: string | null;
  currentTheme: AppTheme;
  onClose: () => void;
  onAddSubtasks: (selectedTitles: string[]) => void;
}

const AiSubtaskSuggestionModal: React.FC<AiSubtaskSuggestionModalProps> = ({
  show,
  taskTitle,
  suggestedSubtasks,
  isLoadingSuggestions,
  errorSubtaskGeneration,
  currentTheme,
  onClose,
  onAddSubtasks,
}) => {
  const [selectedSubtasks, setSelectedSubtasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (show) {
      setSelectedSubtasks(new Set());
    }
  }, [show, suggestedSubtasks, isLoadingSuggestions]);

  const handleToggleSubtask = (subtaskTitle: string) => {
    setSelectedSubtasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subtaskTitle)) {
        newSet.delete(subtaskTitle);
      } else {
        newSet.add(subtaskTitle);
      }
      return newSet;
    });
  };

  const handleAddClick = () => {
    onAddSubtasks(Array.from(selectedSubtasks));
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="aiSubtaskModalTitle">
      <div className={`${currentTheme.cardBg} rounded-2xl p-6 sm:p-8 w-full max-w-lg shadow-2xl flex flex-col`}>
        <div className="flex justify-between items-center mb-5">
          <h3 id="aiSubtaskModalTitle" className={`text-xl sm:text-2xl font-semibold ${currentTheme.text} flex items-center`}>
            <ListTree className={`w-6 h-6 mr-2.5 ${currentTheme.accent.replace('bg-', 'text-')}`} />
            AI แนะนำงานย่อย
          </h3>
          <button
            onClick={onClose}
            className={`${currentTheme.textSecondary} hover:text-opacity-100 p-1.5 rounded-md hover:bg-white/10 transition-all`}
            aria-label="ปิดหน้าต่างแนะนำงานย่อย"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <p className={`${currentTheme.textSecondary} text-sm mb-4 -mt-3`}>สำหรับงาน: "{taskTitle}"</p>


        {isLoadingSuggestions && (
          <div className="flex flex-col items-center justify-center min-h-[200px] py-8">
            <Loader2 className={`w-10 h-10 ${currentTheme.text} animate-spin mb-3`} aria-hidden="true" />
            <p className={`${currentTheme.textSecondary}`} role="status">AI กำลังคิดงานย่อยให้คุณ...</p>
          </div>
        )}

        {errorSubtaskGeneration && !isLoadingSuggestions && (
           <div className={`${currentTheme.inputBg} border border-red-500/50 text-red-400 px-4 py-3.5 rounded-xl relative mb-5 flex items-center gap-3 shadow-md`} role="alert">
            <AlertTriangle className="w-6 h-6 flex-shrink-0" aria-hidden="true"/>
            <div>
                <strong className="font-semibold">เกิดข้อผิดพลาด:</strong>
                <span className="block sm:inline ml-1 text-sm">{errorSubtaskGeneration}</span>
            </div>
          </div>
        )}

        {!isLoadingSuggestions && !errorSubtaskGeneration && suggestedSubtasks.length === 0 && (
          <p className={`${currentTheme.textSecondary} text-center py-10`}>
            AI ไม่สามารถสร้างงานย่อยได้ในขณะนี้ หรือไม่มีงานย่อยที่เหมาะสม
          </p>
        )}

        {!isLoadingSuggestions && !errorSubtaskGeneration && suggestedSubtasks.length > 0 && (
          <div className="space-y-2.5 max-h-[45vh] overflow-y-auto pr-2 mb-6 custom-scrollbar" role="group" aria-labelledby="selectSubtasksLabel">
            <p id="selectSubtasksLabel" className={`${currentTheme.text} opacity-90 text-sm mb-2.5`}>เลือกงานย่อยที่คุณต้องการเพิ่ม:</p>
            {suggestedSubtasks.map((title, index) => (
              <label
                key={index}
                className={`flex items-center p-3.5 rounded-lg cursor-pointer transition-colors duration-200 border
                  ${selectedSubtasks.has(title) 
                    ? `${currentTheme.accent} bg-opacity-25 ${currentTheme.accent.replace('bg-','border-')} border-opacity-70 shadow-sm` 
                    : `${currentTheme.inputBg} bg-opacity-50 hover:bg-opacity-70 ${currentTheme.inputBorder}`
                  }`}
              >
                {selectedSubtasks.has(title) ? (
                  <CheckSquare className={`w-5 h-5 mr-3 ${currentTheme.accent.replace('bg-','text-')}`} aria-hidden="true"/>
                ) : (
                  <Square className={`w-5 h-5 mr-3 ${currentTheme.textSecondary} opacity-60`} aria-hidden="true"/>
                )}
                <span className={`${currentTheme.text} text-sm`}>{title}</span>
                <input
                  type="checkbox"
                  checked={selectedSubtasks.has(title)}
                  onChange={() => handleToggleSubtask(title)}
                  className="sr-only"
                  aria-label={title}
                />
              </label>
            ))}
          </div>
        )}
        
        <div className={`mt-auto flex flex-col sm:flex-row gap-4 pt-6 border-t ${currentTheme.divider}`}>
          <button
            onClick={onClose}
            className={`flex-1 py-3 rounded-lg ${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} font-medium transition-all duration-300 hover:bg-opacity-80 text-sm`}
          >
            ยกเลิก
          </button>
          <button
            onClick={handleAddClick}
            disabled={isLoadingSuggestions || selectedSubtasks.size === 0 || !!errorSubtaskGeneration}
            className={`flex-1 py-3 rounded-lg ${currentTheme.button} ${currentTheme.buttonText} font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-60 text-sm`}
          >
            เพิ่มงานย่อยที่เลือก ({selectedSubtasks.size})
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiSubtaskSuggestionModal;
