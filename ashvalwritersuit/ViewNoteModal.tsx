
import React, { useState, useEffect, useRef } from 'react';
import { AppNote, NoteVersion, OperationMode, LoreEntry, Project } from './types';
import { Eye, X, Edit3, Share2, GitFork, RotateCcw, Thermometer, BookCheck, FileCode, Package, Link as LinkIcon, MessageSquare, Send, Copy as CopyIcon, PlusSquare, ChevronDown, ChevronUp, Loader2, AlertTriangle, Zap } from 'lucide-react'; // Added Zap
import { AppTheme } from './NoteTaskApp';
import { generateAiContent } from './frontend/src/services/geminiService';
import { INITIAL_AI_RESPONSE_MESSAGE, PROCESSING_AI_RESPONSE_MESSAGE, PROJECT_CONTEXT_MAX_NOTE_CHARS, PROJECT_CONTEXT_MAX_LORE_CHARS, MAX_PROJECT_NOTES_IN_CONTEXT, MAX_PROJECT_LORE_IN_CONTEXT } from './constants';


interface ViewNoteModalProps {
  showModal: boolean;
  noteToView: AppNote | null;
  onClose: () => void;
  onEdit: (note: AppNote) => void;
  onExportMd: (note: AppNote) => void;
  onRevertVersion: (noteId: number, versionTimestamp: string) => void;
  getCategoryIcon: (category: string) => JSX.Element;
  currentTheme: AppTheme;
  projectName?: string;
  onTriggerAiAnalysis: (noteContent: string, mode: 'tone-sentiment-analysis' | 'lore-consistency-check') => void; 
  
  operationModes: OperationMode[];
  allNotes: AppNote[]; 
  allLoreEntries: LoreEntry[]; 
  activeProjectId: string | null;
  allProjects: Project[]; 
  onAppendAiResponseToNote: (noteId: number, aiResponseText: string) => void;
  onSaveAiResponseAsNewNote: (titleSuggestion: string, contentToSave: string, originalOperationMode: string) => void;
}

const ViewNoteModal: React.FC<ViewNoteModalProps> = ({
  showModal,
  noteToView,
  onClose,
  onEdit,
  onExportMd,
  onRevertVersion,
  getCategoryIcon,
  currentTheme,
  projectName,
  onTriggerAiAnalysis,
  operationModes,
  allNotes,
  allLoreEntries,
  activeProjectId,
  allProjects,
  onAppendAiResponseToNote,
  onSaveAiResponseAsNewNote,
}) => {
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [parsedContent, setParsedContent] = useState('');
  const [showAiAssistantPanel, setShowAiAssistantPanel] = useState(false);

  const relevantViewOperationModes = operationModes.filter(mode =>
    ['summarize-text', 'scene-analysis', 'character-analysis', 'continuity-check', 'custom'].includes(mode.value)
  );

  const [selectedAiModeModal, setSelectedAiModeModal] = useState<string>(
    relevantViewOperationModes.find(m => m.value === 'summarize-text')?.value || relevantViewOperationModes[0]?.value || ''
  );
  const [aiResponseInModal, setAiResponseInModal] = useState<string>(INITIAL_AI_RESPONSE_MESSAGE);
  const [isAiLoadingInModal, setIsAiLoadingInModal] = useState<boolean>(false);
  const [aiErrorInModal, setAiErrorInModal] = useState<string | null>(null);
  const aiResponseModalRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (noteToView) {
      const contentToParse = noteToView.rawMarkdownContent || noteToView.content || '';
      if (window.marked) {
        setParsedContent(window.marked.parse(contentToParse, { breaks: true, gfm: true, sanitize: false }));
      } else {
        setParsedContent(contentToParse.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br />"));
      }
      setShowAiAssistantPanel(false); // Reset AI panel visibility when note changes
      setAiResponseInModal(INITIAL_AI_RESPONSE_MESSAGE); // Reset AI response
      setIsAiLoadingInModal(false); // Reset AI loading state
      setAiErrorInModal(null); // Reset AI error state
      setSelectedAiModeModal(
        relevantViewOperationModes.find(m => m.value === 'summarize-text')?.value || relevantViewOperationModes[0]?.value || ''
      );
    }
  }, [noteToView, relevantViewOperationModes]); // Added relevantViewOperationModes to dependency array


  const checkHasYamlFrontmatter = (contentStr: string | undefined | null): boolean => {
    if (!contentStr) return false;
    const lines = contentStr.split('\n');
    if (lines.length < 2) return false;
    if (lines[0].trim() !== '---') return false;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '---') return true;
    }
    return false;
  };

  const hasYaml = noteToView ? checkHasYamlFrontmatter(noteToView.rawMarkdownContent) : false;

  const sortedVersions = noteToView?.versions?.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) || [];

  const getTitleFromYaml = (yamlString: string): string | null => {
    const match = yamlString.match(/^title:\s*(.*)$/m);
    return match && match[1] ? match[1].trim() : null;
  };

  const handleExportFormattedMarkdown = () => {
    const contentSource = noteToView?.rawMarkdownContent;
    if (!noteToView || !hasYaml || !contentSource) {
      alert("ไม่พบ YAML frontmatter หรือรูปแบบไม่ถูกต้อง");
      return;
    }
    const lines = contentSource.split('\n');
    let yamlLines: string[] = []; let contentLines: string[] = [];
    let inYamlBlock = false; let pastYamlBlock = false;
    if (lines[0].trim() === '---') inYamlBlock = true; else { alert("รูปแบบ Frontmatter ไม่ถูกต้อง"); return; }
    for (let i = 1; i < lines.length; i++) {
      if (inYamlBlock && lines[i].trim() === '---') { inYamlBlock = false; pastYamlBlock = true; continue; }
      if (inYamlBlock) yamlLines.push(lines[i]);
      if (pastYamlBlock) contentLines.push(lines[i]);
    }
    const yamlBlockString = yamlLines.join('\n');
    const mainContentString = contentLines.join('\n').trimStart();
    let rawFileName = getTitleFromYaml(yamlBlockString) || noteToView.title || 'formatted_note';
    let fileName = `${rawFileName.replace(/[\s\/\\?%*:|"<>]/g, '_').replace(/_{2,}/g, '_') || 'formatted_note'}.md`;
    const fullMdContent = `---
${yamlBlockString}
---

${mainContentString}`;
    const blob = new Blob([fullMdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = fileName;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };
  
  const handleQuickAiAnalysisAndOpenPanel = (mode: string) => {
    setShowAiAssistantPanel(true);
    setSelectedAiModeModal(mode);
    setTimeout(() => handleSubmitToAiInModal(), 0);
  };

  const handleSubmitToAiInModal = async () => {
    if (!noteToView || !noteToView.rawMarkdownContent) {
      setAiErrorInModal("ไม่มีเนื้อหาในโน้ตสำหรับส่งให้ AI");
      return;
    }
    const currentOperation = operationModes.find(m => m.value === selectedAiModeModal);
    if (!currentOperation) {
      setAiErrorInModal("ไม่พบโหมดการทำงานของ AI ที่เลือก");
      return;
    }

    setIsAiLoadingInModal(true);
    setAiErrorInModal(null);
    setAiResponseInModal(PROCESSING_AI_RESPONSE_MESSAGE);

    let systemInstructionToUse = currentOperation.systemInstruction;
    let userPromptFormatted = noteToView.rawMarkdownContent;
    let projectContextString = '';

    const activeProjectNotes = allNotes.filter(n => !activeProjectId || n.projectId === activeProjectId || n.projectId === null);
    const activeProjectLore = allLoreEntries.filter(l => !activeProjectId || l.projectId === activeProjectId || l.projectId === null);
    
    if (['scene-analysis', 'character-analysis', 'magic-system', 'tone-sentiment-analysis', 'lore-consistency-check', 'continuity-check', 'summarize-text', 'custom'].includes(selectedAiModeModal)) {
        const contextNotes = activeProjectNotes
            .filter(n => n.id !== noteToView.id) 
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
        if (selectedAiModeModal === 'lore-consistency-check') {
          contextDataForFormatter.projectLore = activeProjectLore;
        }
        userPromptFormatted = currentOperation.userPromptFormatter(noteToView.rawMarkdownContent, contextDataForFormatter);
    }
    
    const fullUserPrompt = userPromptFormatted + projectContextString;

    try {
      const responseText = await generateAiContent(systemInstructionToUse, fullUserPrompt);
      setAiResponseInModal(window.marked && !responseText.startsWith('<p class="text-red-400') ? window.marked.parse(responseText) : responseText);
    } catch (error: any) {
      const errorMessage = error.message || "เกิดข้อผิดพลาดในการสื่อสารกับ AI";
      setAiResponseInModal(`<p class="text-red-400 font-semibold">AI Error: ${errorMessage}</p>`);
      setAiErrorInModal(errorMessage);
    } finally {
      setIsAiLoadingInModal(false);
    }
  };

  const handleCopyAiResponseFromModal = async () => {
    if (aiResponseModalRef.current) {
      const textToCopy = aiResponseModalRef.current.innerText || aiResponseModalRef.current.textContent || "";
      if (textToCopy && textToCopy !== INITIAL_AI_RESPONSE_MESSAGE && textToCopy !== PROCESSING_AI_RESPONSE_MESSAGE) {
        try {
          await navigator.clipboard.writeText(textToCopy);
          alert('คัดลอกผลลัพธ์ AI สำเร็จ!');
        } catch (err) { alert('ไม่สามารถคัดลอกผลลัพธ์ AI ได้'); }
      } else { alert('ไม่มีข้อความผลลัพธ์ AI ให้คัดลอก'); }
    }
  };

  const handleAppendToCurrentNoteFromModal = () => {
    if (noteToView && aiResponseModalRef.current) {
      const aiText = aiResponseModalRef.current.innerText || aiResponseModalRef.current.textContent || "";
      if (aiText && aiText !== INITIAL_AI_RESPONSE_MESSAGE && aiText !== PROCESSING_AI_RESPONSE_MESSAGE && !aiErrorInModal) {
        onAppendAiResponseToNote(noteToView.id, aiText);
      } else {
        alert("ไม่มีผลลัพธ์ AI ที่ถูกต้องสำหรับเพิ่มเข้าไปในโน้ต");
      }
    }
  };
  
  const handleSaveAiAsNewNoteFromModal = () => {
     if (noteToView && aiResponseModalRef.current && aiResponseInModal !== INITIAL_AI_RESPONSE_MESSAGE && aiResponseInModal !== PROCESSING_AI_RESPONSE_MESSAGE && !aiErrorInModal) {
      const rawAiText = aiResponseModalRef.current.innerText || aiResponseModalRef.current.textContent || "";
      const currentOperationLabel = operationModes.find(m => m.value === selectedAiModeModal)?.label || selectedAiModeModal;
      const titleSuggestion = `AI: ${currentOperationLabel} - ${noteToView.title.substring(0,30)}`;
      onSaveAiResponseAsNewNote(titleSuggestion, rawAiText, selectedAiModeModal);
    } else {
      alert('ไม่มีผลลัพธ์ AI ที่ถูกต้องสำหรับบันทึกเป็นโน้ตใหม่');
    }
  };

  const isDarkTheme = currentTheme.text === 'text-white' || currentTheme.text === 'text-slate-200' || currentTheme.text === 'text-gray-100';
  const selectArrowSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='${isDarkTheme ? '%23CBD5E1' : '%236B7280'}'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E`;
  const optionStyle = isDarkTheme 
    ? { backgroundColor: '#1E293B', color: '#E2E8F0' } 
    : { backgroundColor: '#FFFFFF', color: '#1F2937' };


  if (!showModal || !noteToView) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-40 p-4">
      <div className={`${currentTheme.cardBg} rounded-2xl p-6 sm:p-8 w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]`}>
        <div className="flex justify-between items-start mb-5">
          <h3 className={`text-2xl sm:text-3xl font-semibold ${currentTheme.text} flex items-center break-all gap-2`}>
            <Eye className={`w-7 h-7 flex-shrink-0 ${currentTheme.accent.replace('bg-', 'text-')}`} />
            {noteToView.icon && <span className="text-3xl flex-shrink-0">{noteToView.icon}</span>}
            <span className="leading-tight">{noteToView.title}</span>
          </h3>
          <button
            onClick={() => { onClose(); setShowVersionHistory(false); setShowAiAssistantPanel(false); }}
            className={`${currentTheme.textSecondary} hover:text-opacity-100 p-1.5 rounded-md hover:bg-white/10 transition-all ml-2 flex-shrink-0`}
            aria-label="ปิดหน้าต่างดูโน้ต"
          >
            <X className="w-7 h-7" />
          </button>
        </div>
        <div className={`flex items-center gap-x-4 gap-y-1 mb-2 text-sm ${currentTheme.textSecondary} flex-wrap`}>
          <span className="flex items-center gap-1.5">{getCategoryIcon(noteToView.category)} {noteToView.category}</span>
          <span className="hidden sm:inline">|</span>
          <span className="whitespace-nowrap">สร้าง: {new Date(noteToView.createdAt).toLocaleString('th-TH', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          {noteToView.updatedAt && (<><span className="hidden sm:inline">|</span><span className="whitespace-nowrap">แก้ไข: {new Date(noteToView.updatedAt).toLocaleString('th-TH', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></>)}
        </div>
        {projectName && (<div className={`text-sm ${currentTheme.textSecondary} mb-4 flex items-center`}><Package size={16} className="mr-1.5 opacity-80"/> โปรเจกต์: {projectName}</div>)}
        {noteToView.tags.length > 0 && (<div className="flex gap-2 flex-wrap mb-4">{noteToView.tags.map(tag => (<span key={tag} className={`${currentTheme.accent} bg-opacity-20 text-xs px-3 py-1 rounded-full ${currentTheme.accent.replace('bg-','text-')} opacity-90`}>#{tag}</span>))}</div>)}

        <div className={`note-content-view flex-grow min-h-[150px] max-h-[40vh] sm:max-h-[45vh] overflow-y-auto p-4 rounded-lg ${currentTheme.inputBg} ${isDarkTheme ? 'prose-dark dark' : 'prose-sm'} max-w-none custom-scrollbar mb-4`}
          dangerouslySetInnerHTML={{ __html: parsedContent }}
        />

        <div className="mb-2">
            <button onClick={() => setShowVersionHistory(!showVersionHistory)} className={`flex items-center gap-1.5 text-sm ${currentTheme.textSecondary} hover:text-opacity-100 py-1`}>
                <GitFork className="w-4 h-4"/> ประวัติการแก้ไข ({sortedVersions.length})
                <ChevronDown className={`w-4 h-4 transition-transform ${showVersionHistory ? 'rotate-180' : ''}`}/>
            </button>
        </div>
        {showVersionHistory && (
          <div className="mb-4">
            {sortedVersions.length > 0 ? (
              <div className={`max-h-[150px] overflow-y-auto p-3 rounded-lg ${currentTheme.inputBg} bg-opacity-70 space-y-2.5 custom-scrollbar`}>
                {sortedVersions.map((version) => (
                  <div key={version.timestamp} className={`${currentTheme.cardBg} bg-opacity-70 p-3 rounded-md flex justify-between items-center`}>
                    <span className={`${currentTheme.textSecondary} text-xs`}>
                      แก้ไขเมื่อ: {new Date(version.timestamp).toLocaleString('th-TH')}
                    </span>
                    <button
                      onClick={() => noteToView && onRevertVersion(noteToView.id, version.timestamp)}
                      className={`${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} text-xs px-2 py-1 rounded hover:bg-opacity-80 flex items-center gap-1`}
                    >
                      <RotateCcw size={12} /> กู้คืนเวอร์ชันนี้
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`${currentTheme.textSecondary} text-xs italic`}>ไม่มีประวัติการแก้ไขสำหรับโน้ตนี้</p>
            )}
          </div>
        )}

        {/* AI Assistant Panel */}
        <div className="my-3">
            <button onClick={() => setShowAiAssistantPanel(!showAiAssistantPanel)} className={`w-full flex items-center justify-between gap-1.5 text-sm font-medium ${currentTheme.text} hover:opacity-80 py-2.5 px-3.5 rounded-lg ${currentTheme.inputBg} border ${currentTheme.inputBorder} transition-all`}>
                <span className="flex items-center gap-1.5"><Zap className="w-4 h-4"/> AI Assistant</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${showAiAssistantPanel ? 'rotate-180' : ''}`}/>
            </button>
        </div>
        {showAiAssistantPanel && (
            <div className={`${currentTheme.inputBg} bg-opacity-40 p-4 rounded-lg space-y-3 mb-4 border ${currentTheme.divider}`}>
                <div>
                <label htmlFor="ai-mode-view-modal" className={`block text-xs font-medium ${currentTheme.textSecondary} mb-1`}>เลือกโหมด AI:</label>
                <select id="ai-mode-view-modal" value={selectedAiModeModal} onChange={(e) => setSelectedAiModeModal(e.target.value)} disabled={isAiLoadingInModal}
                    className={`w-full py-2 px-3 pr-8 border-0 rounded-md ${currentTheme.inputBg} ${currentTheme.inputText} ${currentTheme.inputBorder} appearance-none focus:outline-none focus:ring-1 ${currentTheme.accent.replace('bg-','focus:ring-')} transition-colors text-sm bg-no-repeat bg-right-2`}
                    style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1em', color: isDarkTheme ? '#E2E8F0' : '#1F2937' }}>
                    {relevantViewOperationModes.map(mode => (<option key={mode.value} value={mode.value} style={optionStyle}>{mode.label}</option>))}
                </select>
                </div>
                <button onClick={handleSubmitToAiInModal} disabled={isAiLoadingInModal || !noteToView?.rawMarkdownContent?.trim()}
                className={`${currentTheme.button} ${currentTheme.buttonText} w-full py-2 px-3 rounded-md text-sm font-medium flex items-center justify-center gap-1.5 shadow-sm hover:scale-105 disabled:opacity-60`}>
                {isAiLoadingInModal ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>}
                {isAiLoadingInModal ? "กำลังประมวลผล..." : "ส่งให้ AI"}
                </button>
                {aiErrorInModal && <p className="text-red-400 text-xs p-2 bg-red-500/10 rounded-md flex items-center gap-1"><AlertTriangle size={14}/> {aiErrorInModal}</p>}
                <div ref={aiResponseModalRef} className={`ai-response-output p-3 min-h-[100px] max-h-[200px] overflow-y-auto rounded-md ${currentTheme.aiResponseBg} border ${currentTheme.divider} prose-sm ${isDarkTheme ? 'prose-dark' : ''} max-w-none ${currentTheme.text} opacity-90 custom-scrollbar`}
                     dangerouslySetInnerHTML={{ __html: aiResponseInModal }}
                />
                <div className="flex flex-wrap gap-2 text-xs">
                    <button onClick={handleCopyAiResponseFromModal} disabled={isAiLoadingInModal || aiResponseInModal === INITIAL_AI_RESPONSE_MESSAGE || !!aiErrorInModal} className={`${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} px-2.5 py-1.5 rounded-md flex items-center gap-1 disabled:opacity-50`}><CopyIcon size={12}/> คัดลอก</button>
                    <button onClick={handleAppendToCurrentNoteFromModal} disabled={isAiLoadingInModal || aiResponseInModal === INITIAL_AI_RESPONSE_MESSAGE || !!aiErrorInModal} className={`${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} px-2.5 py-1.5 rounded-md flex items-center gap-1 disabled:opacity-50`}><PlusSquare size={12}/> เพิ่มต่อท้ายโน้ต</button>
                    <button onClick={handleSaveAiAsNewNoteFromModal} disabled={isAiLoadingInModal || aiResponseInModal === INITIAL_AI_RESPONSE_MESSAGE || !!aiErrorInModal} className={`${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} px-2.5 py-1.5 rounded-md flex items-center gap-1 disabled:opacity-50`}><FileCode size={12}/> บันทึกเป็นโน้ตใหม่</button>
                </div>
            </div>
        )}

        <div className={`mt-auto flex flex-col sm:flex-row gap-3 pt-5 border-t ${currentTheme.divider}`}>
          <button
            onClick={() => noteToView && onEdit(noteToView)}
            className={`${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors hover:bg-opacity-80 flex items-center justify-center gap-1.5 shadow-sm`}
          >
            <Edit3 className="w-4 h-4" /> แก้ไข
          </button>
          <button
            onClick={() => noteToView && (hasYaml ? handleExportFormattedMarkdown() : onExportMd(noteToView))}
            className={`${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors hover:bg-opacity-80 flex items-center justify-center gap-1.5 shadow-sm`}
          >
            <LinkIcon className="w-4 h-4" /> {hasYaml ? 'ส่งออก MD (จัดรูปแบบ)' : 'ส่งออก MD'}
          </button>
          <button
            onClick={() => { onClose(); setShowVersionHistory(false); setShowAiAssistantPanel(false); }}
            className={`${currentTheme.button} ${currentTheme.buttonText} flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-transform hover:scale-105 shadow-md`}
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewNoteModal;
