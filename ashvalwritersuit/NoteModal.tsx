
import React, { useRef, useEffect, useState } from 'react';
import { AppNote, Project, OperationMode, LoreEntry } from './types'; 
import EmojiPicker from './EmojiPicker'; 
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, Link as LinkIconMd, Image, Code, MessageSquare as QuoteIcon, X, Send, Copy as CopyIcon, Loader2, AlertTriangle, ChevronDown, MessageSquare, Edit3, ChevronsLeftRight, ReplaceAll } from 'lucide-react';
import { AppTheme } from './NoteTaskApp';
import { generateAiContent } from './frontend/src/services/geminiService';
import { INITIAL_AI_RESPONSE_MESSAGE, PROCESSING_AI_RESPONSE_MESSAGE, PROJECT_CONTEXT_MAX_NOTE_CHARS, PROJECT_CONTEXT_MAX_LORE_CHARS, MAX_PROJECT_NOTES_IN_CONTEXT, MAX_PROJECT_LORE_IN_CONTEXT } from './constants';


interface NoteModalProps {
  showModal: boolean;
  isEditing: boolean;
  editingNoteId?: number | null; 
  noteData: { 
    title: string; 
    icon?: string; 
    content: string; 
    rawMarkdownContent?: string; 
    category: string; 
    tags: string[]; 
    projectId?: string | null 
  };
  onNoteDataChange: (field: keyof AppNote | 'tagsString' | 'icon' | 'projectId' | 'rawMarkdownContent', value: string | string[] | null) => void;
  onSave: () => void;
  onCancel: () => void;
  currentTheme: AppTheme;
  projects: Project[];
  activeProjectId: string | null;
  operationModes: OperationMode[];
  allNotes: AppNote[];
  allLoreEntries: LoreEntry[];
  allProjects: Project[];
}

const NoteModal: React.FC<NoteModalProps> = ({
  showModal,
  isEditing,
  editingNoteId, 
  noteData,
  onNoteDataChange,
  onSave,
  onCancel,
  currentTheme,
  projects,
  activeProjectId,
  operationModes,
  allNotes,
  allLoreEntries,
  allProjects,
}) => {
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [showAiPanelModal, setShowAiPanelModal] = useState(false);
  const [selectedAiModeModal, setSelectedAiModeModal] = useState<string>(operationModes.find(m => m.value === 'rewrite-text')?.value || operationModes[0]?.value || '');
  const [aiResponseModal, setAiResponseModal] = useState<string>(INITIAL_AI_RESPONSE_MESSAGE);
  const [isAiLoadingModal, setIsAiLoadingModal] = useState<boolean>(false);
  const [aiErrorModal, setAiErrorModal] = useState<string | null>(null);
  const aiResponseModalRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (showModal) {
      if (!isEditing) {
        const titleInput = document.getElementById('note-title-input');
        titleInput?.focus();
      }
      setShowAiPanelModal(false);
      setAiResponseModal(INITIAL_AI_RESPONSE_MESSAGE);
      setIsAiLoadingModal(false);
      setAiErrorModal(null);
      if (operationModes.length > 0) {
        setSelectedAiModeModal(operationModes.find(m => m.value === 'rewrite-text')?.value || operationModes[0].value);
      }
    }
  }, [showModal, isEditing, operationModes]);


  if (!showModal) return null;

  const isDarkTheme = currentTheme.text === 'text-white' || currentTheme.text === 'text-slate-200' || currentTheme.text === 'text-gray-100';
  const selectArrowSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='${isDarkTheme ? '%23CBD5E1' : '%236B7280'}'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E`;
  const optionStyle = isDarkTheme 
    ? { backgroundColor: '#1E293B', color: '#E2E8F0' } 
    : { backgroundColor: '#FFFFFF', color: '#1F2937' };
  const optionBgClass = isDarkTheme ? 'bg-slate-700' : 'bg-gray-200';
  const currentSelectedProjectId = noteData.projectId !== undefined ? noteData.projectId : (isEditing ? null : activeProjectId);

  const baseInputStyle = `w-full px-4 py-3 rounded-xl ${currentTheme.inputBg} ${currentTheme.inputText} ${currentTheme.inputBorder} ${currentTheme.inputPlaceholder} ${currentTheme.focusRing} focus:border-transparent focus:outline-none`;
  const selectStyle = `${baseInputStyle} appearance-none bg-no-repeat bg-right-3`;

  const applyMarkdown = (type: 'bold' | 'italic' | 'h1' | 'h2' | 'h3' | 'ul' | 'ol' | 'quote' | 'code' | 'link' | 'image') => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let prefix = '';
    let suffix = '';
    let placeholder = '';
    let adjustment = 0; // For adjusting selection after inserting link/image with placeholder

    switch (type) {
      case 'bold': prefix = '**'; suffix = '**'; break;
      case 'italic': prefix = '*'; suffix = '*'; break;
      case 'h1': prefix = '# '; break;
      case 'h2': prefix = '## '; break;
      case 'h3': prefix = '### '; break;
      case 'ul': prefix = (textarea.value.substring(0, start).endsWith('\n') || start === 0) ? '- ' : '\n- '; break;
      case 'ol': prefix = (textarea.value.substring(0, start).endsWith('\n') || start === 0) ? '1. ' : '\n1. '; break;
      case 'quote': prefix = (textarea.value.substring(0, start).endsWith('\n') || start === 0) ? '> ' : '\n> '; break;
      case 'code':
        if (selectedText.includes('\n')) { 
          prefix = '```\n'; suffix = '\n```';
        } else { 
          prefix = '`'; suffix = '`';
        }
        break;
      case 'link':
        placeholder = selectedText || 'ข้อความลิงก์';
        prefix = `[${placeholder}]`;
        suffix = '(url)';
        adjustment = 3; // 'url'.length
        break;
      case 'image':
        placeholder = selectedText || 'คำอธิบายรูปภาพ';
        prefix = `![${placeholder}]`;
        suffix = '(imageUrl)';
        adjustment = 10; // 'imageUrl'.length
        break;
    }

    let newText;
    if (selectedText && (type !== 'link' && type !== 'image')) {
      newText = `${prefix}${selectedText}${suffix}`;
    } else if (type === 'link' || type === 'image') {
      newText = `${prefix}${suffix}`;
    }
    else { // No selected text, just insert prefix (for headings, lists, quote)
      newText = prefix; 
    }
    
    const currentContent = textarea.value;
    const before = currentContent.substring(0, start);
    const after = currentContent.substring(end);
    const updatedContent = `${before}${newText}${after}`;
    
    onNoteDataChange('rawMarkdownContent', updatedContent);

    // Refocus and set selection
    setTimeout(() => {
        if(textarea) { 
            textarea.focus();
            if (type === 'link' || type === 'image') {
                const cursorPosition = before.length + prefix.length + suffix.length - adjustment;
                textarea.setSelectionRange(cursorPosition, cursorPosition);
            } else if (selectedText) { // Text was selected and wrapped
                 textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
            } else { // No text selected, prefix inserted
                 textarea.setSelectionRange(start + newText.length, start + newText.length);
            }
        }
    }, 0);
  };
  
  const markdownControls = [
    { label: 'ตัวหนา', icon: Bold, action: () => applyMarkdown('bold') },
    { label: 'ตัวเอียง', icon: Italic, action: () => applyMarkdown('italic') },
    { label: 'หัวข้อ 1', icon: Heading1, action: () => applyMarkdown('h1') },
    { label: 'หัวข้อ 2', icon: Heading2, action: () => applyMarkdown('h2') },
    { label: 'หัวข้อ 3', icon: Heading3, action: () => applyMarkdown('h3') },
    { label: 'รายการ (UL)', icon: List, action: () => applyMarkdown('ul') },
    { label: 'รายการ (OL)', icon: ListOrdered, action: () => applyMarkdown('ol') },
    { label: 'อ้างอิง', icon: QuoteIcon, action: () => applyMarkdown('quote') },
    { label: 'โค้ด', icon: Code, action: () => applyMarkdown('code') },
    { label: 'ลิงก์', icon: LinkIconMd, action: () => applyMarkdown('link') },
    // { label: 'รูปภาพ', icon: Image, action: () => applyMarkdown('image') }, // Image might be complex without upload
  ];

  const handleSubmitToAiInModal = async () => {
    const currentRawContent = noteData.rawMarkdownContent || '';
    if (!currentRawContent.trim()) {
      setAiErrorModal("ไม่มีเนื้อหาสำหรับส่งให้ AI");
      return;
    }
    const currentOperation = operationModes.find(m => m.value === selectedAiModeModal);
    if (!currentOperation) {
      setAiErrorModal("ไม่พบโหมดการทำงานของ AI ที่เลือก");
      return;
    }

    setIsAiLoadingModal(true);
    setAiErrorModal(null);
    setAiResponseModal(PROCESSING_AI_RESPONSE_MESSAGE);

    let systemInstructionToUse = currentOperation.systemInstruction;
    let userPromptFormatted = currentRawContent;
    let projectContextString = '';

    const activeProjectNotes = allNotes.filter(n => !activeProjectId || n.projectId === activeProjectId || n.projectId === null);
    const activeProjectLore = allLoreEntries.filter(l => !activeProjectId || l.projectId === activeProjectId || l.projectId === null);
    
    if (['scene-rewrite', 'show-dont-tell-enhancer', 'summarize-text', 'rewrite-text', 'dialogue-generation', 'scene-creation', 'brainstorm-ideas', 'custom'].includes(selectedAiModeModal)) {
        const contextNotes = activeProjectNotes
            .filter(n => (isEditing && editingNoteId && n.id !== editingNoteId) || !isEditing)
            .slice(0, MAX_PROJECT_NOTES_IN_CONTEXT)
            .map(n => `โน้ต "${n.title}": ${(n.rawMarkdownContent || n.content).substring(0, PROJECT_CONTEXT_MAX_NOTE_CHARS)}...`)
            .join('\n');

        const contextLore = activeProjectLore
            .slice(0, MAX_PROJECT_LORE_IN_CONTEXT)
            .map(l => `ข้อมูลโลก "${l.title}" (ประเภท: ${l.type}): ${l.content.substring(0, PROJECT_CONTEXT_MAX_LORE_CHARS)}...`)
            .join('\n');
        
        if (contextNotes || contextLore) {
            projectContextString = "\n\n## ข้อมูลโปรเจกต์ (Project Context):\n";
            const currentProjectObj = activeProjectId ? allProjects.find(p=>p.id === activeProjectId) : null;
            if (currentProjectObj) {
                projectContextString += `ชื่อโปรเจกต์: ${currentProjectObj.name}\n`;
            }
            if(contextNotes) projectContextString += contextNotes + "\n";
            if(contextLore) projectContextString += contextLore + "\n";
        }
    }

    if (currentOperation.userPromptFormatter) {
        let contextDataForFormatter: any = {};
        userPromptFormatted = currentOperation.userPromptFormatter(currentRawContent, contextDataForFormatter);
    }
    
    const fullUserPrompt = userPromptFormatted + projectContextString;

    try {
      const responseText = await generateAiContent(systemInstructionToUse, fullUserPrompt);
      setAiResponseModal(responseText); 
    } catch (error: any) {
      const errorMessage = error.message || "เกิดข้อผิดพลาดในการสื่อสารกับ AI";
      setAiResponseModal(`<p class="text-red-400 font-semibold">AI Error: ${errorMessage}</p>`); 
      setAiErrorModal(errorMessage);
    } finally {
      setIsAiLoadingModal(false);
    }
  };

  const handleAiOutputAction = (action: 'copy' | 'insert' | 'replace_selection' | 'replace_all') => {
    const rawHtmlResponse = aiResponseModal; 
    let textToApply = rawHtmlResponse;

    if (aiResponseModalRef.current) { 
        textToApply = aiResponseModalRef.current.innerText || aiResponseModalRef.current.textContent || rawHtmlResponse;
    }
    
    if (!textToApply || textToApply === INITIAL_AI_RESPONSE_MESSAGE || textToApply === PROCESSING_AI_RESPONSE_MESSAGE || aiErrorModal) {
        alert("ไม่มีผลลัพธ์ AI ที่ถูกต้องสำหรับดำเนินการ");
        return;
    }
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = textToApply.match(fenceRegex);
    if (match && match[2]) {
        textToApply = match[2].trim();
    }


    if (action === 'copy') {
        navigator.clipboard.writeText(textToApply).then(() => alert("คัดลอกผลลัพธ์ AI แล้ว")).catch(() => alert("ไม่สามารถคัดลอกได้"));
        return;
    }

    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const currentRawContent = noteData.rawMarkdownContent || '';
    let newRawContent = currentRawContent;
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;

    switch(action) {
        case 'insert':
            newRawContent = currentRawContent.substring(0, selectionStart) + textToApply + currentRawContent.substring(selectionStart);
            break;
        case 'replace_selection':
            if (selectionStart !== selectionEnd) {
                newRawContent = currentRawContent.substring(0, selectionStart) + textToApply + currentRawContent.substring(selectionEnd);
            } else { 
                newRawContent = currentRawContent.substring(0, selectionStart) + textToApply + currentRawContent.substring(selectionStart);
            }
            break;
        case 'replace_all':
            newRawContent = textToApply;
            break;
    }
    onNoteDataChange('rawMarkdownContent', newRawContent);
    setTimeout(() => {
        textarea.focus();
        if (action === 'insert' || (action === 'replace_selection' && selectionStart === selectionEnd)) {
             textarea.setSelectionRange(selectionStart + textToApply.length, selectionStart + textToApply.length);
        } else if (action === 'replace_selection') {
            textarea.setSelectionRange(selectionStart, selectionStart + textToApply.length);
        }
    }, 0);
  };

  const relevantOperationModes = operationModes.filter(mode =>
    ['scene-rewrite', 'show-dont-tell-enhancer', 'summarize-text', 'rewrite-text', 'dialogue-generation', 'scene-creation', 'brainstorm-ideas', 'custom'].includes(mode.value)
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-40 p-4" role="dialog" aria-modal="true" aria-labelledby="note-modal-title">
      <div className={`${currentTheme.cardBg} rounded-2xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]`}>
        <div className="flex justify-between items-center mb-6">
            <h3 id="note-modal-title" className={`text-xl sm:text-2xl font-semibold ${currentTheme.text}`}>
            {isEditing ? 'แก้ไขโน้ต' : 'เพิ่มโน๊ตใหม่'}
            </h3>
            <button 
                onClick={onCancel} 
                className={`${currentTheme.textSecondary} hover:text-opacity-100 p-1.5 rounded-md hover:bg-white/10 transition-all`} 
                aria-label="ปิด"
            >
                <X size={26} />
            </button>
        </div>

        <div className="space-y-5 overflow-y-auto pr-2 flex-grow custom-scrollbar">
          <div className="flex items-center gap-3">
            <EmojiPicker
              selectedEmoji={noteData.icon}
              onEmojiSelect={(emoji) => onNoteDataChange('icon', emoji)}
              currentTheme={currentTheme}
            />
            <input
                id="note-title-input"
                type="text"
                placeholder="ชื่อโน้ต..."
                value={noteData.title}
                onChange={(e) => onNoteDataChange('title', e.target.value)}
                className={`flex-grow h-12 ${baseInputStyle}`}
                aria-label="ชื่อโน้ต"
            />
          </div>
          
          <div className={`flex items-center flex-wrap gap-1.5 p-2 rounded-lg ${currentTheme.inputBg} bg-opacity-60 border ${currentTheme.inputBorder}`}>
            {markdownControls.map(control => (
              <button
                key={control.label}
                type="button"
                onClick={control.action}
                title={control.label}
                className={`${currentTheme.buttonSecondaryText} opacity-80 hover:opacity-100 p-2 rounded-md ${currentTheme.buttonSecondaryBg} hover:bg-opacity-80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
                aria-label={control.label}
              >
                <control.icon size={18} />
              </button>
            ))}
          </div>

          <textarea
            ref={contentTextareaRef}
            placeholder="เนื้อหา (รองรับ Markdown)..."
            value={noteData.rawMarkdownContent || ''} 
            onChange={(e) => onNoteDataChange('rawMarkdownContent', e.target.value)}
            rows={10} 
            className={`${baseInputStyle} min-h-[200px] resize-y leading-relaxed`}
            aria-label="เนื้อหาโน้ต"
          />

            <div className="my-3">
                <button onClick={() => setShowAiPanelModal(!showAiPanelModal)} className={`w-full flex items-center justify-between gap-1.5 text-sm font-medium ${currentTheme.text} hover:opacity-80 py-2.5 px-3.5 rounded-lg ${currentTheme.inputBg} border ${currentTheme.inputBorder} transition-all`}>
                    <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4"/> AI Assistant (สำหรับเนื้อหาปัจจุบัน)</span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${showAiPanelModal ? 'rotate-180' : ''}`}/>
                </button>
            </div>
            {showAiPanelModal && (
            <div className={`${currentTheme.inputBg} bg-opacity-40 p-4 rounded-lg space-y-3 mb-4 border ${currentTheme.divider}`}>
                <div>
                <label htmlFor="ai-mode-note-modal" className={`block text-xs font-medium ${currentTheme.textSecondary} mb-1`}>เลือกโหมด AI:</label>
                <select id="ai-mode-note-modal" value={selectedAiModeModal} onChange={(e) => setSelectedAiModeModal(e.target.value)} disabled={isAiLoadingModal}
                    className={`w-full py-2 px-3 pr-8 border-0 rounded-md ${currentTheme.inputBg} ${currentTheme.inputText} ${currentTheme.inputBorder} appearance-none focus:outline-none focus:ring-1 ${currentTheme.accent.replace('bg-','focus:ring-')} transition-colors text-sm bg-no-repeat bg-right-2`}
                    style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1em', color: isDarkTheme ? '#E2E8F0' : '#1F2937' }}>
                    {relevantOperationModes.map(mode => (<option key={mode.value} value={mode.value} style={optionStyle}>{mode.label}</option>))}
                </select>
                </div>
                <button onClick={handleSubmitToAiInModal} disabled={isAiLoadingModal || !noteData.rawMarkdownContent?.trim()}
                className={`${currentTheme.button} ${currentTheme.buttonText} w-full py-2 px-3 rounded-md text-sm font-medium flex items-center justify-center gap-1.5 shadow-sm hover:scale-105 disabled:opacity-60`}>
                {isAiLoadingModal ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>}
                {isAiLoadingModal ? "กำลังประมวลผล..." : "ประมวลผลด้วย AI"}
                </button>
                {aiErrorModal && <p className="text-red-400 text-xs p-2 bg-red-500/10 rounded-md flex items-center gap-1"><AlertTriangle size={14}/> {aiErrorModal}</p>}
                <div ref={aiResponseModalRef} className={`ai-response-output p-3 min-h-[100px] max-h-[200px] overflow-y-auto rounded-md ${currentTheme.aiResponseBg} border ${currentTheme.divider} prose-sm ${isDarkTheme ? 'prose-dark' : ''} max-w-none ${currentTheme.text} opacity-90 custom-scrollbar`}
                    dangerouslySetInnerHTML={{ __html: window.marked && !aiErrorModal && !aiResponseModal.startsWith('<p class="text-red-400') ? window.marked.parse(aiResponseModal) : aiResponseModal }}
                />
                <div className="flex flex-wrap gap-2 text-xs">
                    <button onClick={() => handleAiOutputAction('copy')} disabled={isAiLoadingModal || aiResponseModal === INITIAL_AI_RESPONSE_MESSAGE || !!aiErrorModal} className={`${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} px-2.5 py-1.5 rounded-md flex items-center gap-1 disabled:opacity-50`}><CopyIcon size={12}/> คัดลอก</button>
                    <button onClick={() => handleAiOutputAction('insert')} disabled={isAiLoadingModal || aiResponseModal === INITIAL_AI_RESPONSE_MESSAGE || !!aiErrorModal} className={`${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} px-2.5 py-1.5 rounded-md flex items-center gap-1 disabled:opacity-50`}><Edit3 size={12}/> แทรกที่ Cursor</button>
                    <button onClick={() => handleAiOutputAction('replace_selection')} disabled={isAiLoadingModal || aiResponseModal === INITIAL_AI_RESPONSE_MESSAGE || !!aiErrorModal} className={`${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} px-2.5 py-1.5 rounded-md flex items-center gap-1 disabled:opacity-50`}><ChevronsLeftRight size={12}/> แทนที่ส่วนที่เลือก</button>
                    <button onClick={() => handleAiOutputAction('replace_all')} disabled={isAiLoadingModal || aiResponseModal === INITIAL_AI_RESPONSE_MESSAGE || !!aiErrorModal} className={`${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} px-2.5 py-1.5 rounded-md flex items-center gap-1 disabled:opacity-50`}><ReplaceAll size={12}/> แทนที่ทั้งหมด</button>
                </div>
            </div>
            )}


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select
              value={noteData.category}
              onChange={(e) => onNoteDataChange('category', e.target.value)}
              className={`${selectStyle}`}
              style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1.25em' }}
              aria-label="ประเภทโน้ต"
            >
              <option value="general" className={optionBgClass}>ทั่วไป</option>
              <option value="writing" className={optionBgClass}>การเขียน</option>
              <option value="plot" className={optionBgClass}>โครงเรื่อง</option>
              <option value="character" className={optionBgClass}>ตัวละคร</option>
              <option value="worldbuilding" className={optionBgClass}>สร้างโลก</option>
              <option value="scene" className={optionBgClass}>ฉาก</option>
              <option value="chapter" className={optionBgClass}>บท/ตอน</option>
              <option value="research" className={optionBgClass}>การค้นคว้า</option>
              <option value="design" className={optionBgClass}>ดีไซน์</option>
              <option value="ideas" className={optionBgClass}>ไอเดีย</option>
              <option value="feedback" className={optionBgClass}>Feedback</option>
              <option value="ai generated" className={optionBgClass}>AI Generated</option>
              <option value="imported" className={optionBgClass}>นำเข้า</option>
            </select>
            <select
                value={currentSelectedProjectId === null ? "" : currentSelectedProjectId}
                onChange={(e) => onNoteDataChange('projectId', e.target.value === "" ? null : e.target.value)}
                className={`${selectStyle}`}
                style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1.25em' }}
                aria-label="เลือกโปรเจกต์"
            >
                <option value="" className={optionBgClass}>ไม่ได้กำหนดโปรเจกต์</option>
                {projects.map(project => (
                    <option key={project.id} value={project.id} className={optionBgClass}>
                        {project.name}
                    </option>
                ))}
            </select>
          </div>
          <input
            type="text"
            placeholder="แท็ก (คั่นด้วยจุลภาค เช่น fantasy, sci-fi)"
            value={noteData.tags.join(', ')}
            onChange={(e) => onNoteDataChange('tagsString', e.target.value)}
            className={`${baseInputStyle}`}
            aria-label="แท็ก"
          />
        </div>
        <div className={`flex gap-4 mt-6 pt-6 border-t ${currentTheme.divider}`}>
          <button
            onClick={onCancel}
            className={`flex-1 py-3 rounded-lg ${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} font-medium transition-all duration-300 hover:bg-opacity-80`}
          >
            ยกเลิก
          </button>
          <button
            onClick={onSave}
            className={`flex-1 py-3 rounded-lg ${currentTheme.button} ${currentTheme.buttonText} font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5`}
          >
            {isEditing ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มโน้ต'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteModal;