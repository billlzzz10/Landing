
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MessageSquare, Send, Copy, Plus, XCircle, ChevronDown, ChevronUp, AlertTriangle, Repeat, Package, Edit, Loader2 } from 'lucide-react'; 
import { OPERATION_MODES, INITIAL_AI_RESPONSE_MESSAGE, PROCESSING_AI_RESPONSE_MESSAGE, AI_MAX_INPUT_CHARS } from './constants'; 
import { OperationMode, UserPreferences, LoreEntry, SceneCreatorFormData } from './types'; 
import SceneCreatorForm from './SceneCreatorForm'; 
import { AppTheme } from './NoteTaskApp'; 

interface AiWriterProps {
  showAiWriterSection: boolean;
  operationMode: string;
  customSystemInstruction: string;
  inputPrompt: string;
  aiResponse: string; // This will now be the full text including potential YAML
  isLoading: boolean;
  error: string | null;
  inputCharCount: number; 
  responseCharCount: number; 
  defaultCustomModeSI: string;
  currentTheme: AppTheme; 
  userPreferences: UserPreferences; 
  activeProjectName?: string | null;
  projectCharacters: LoreEntry[]; 
  projectArcanaSystems: LoreEntry[]; 
  onOperationModeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onCustomSystemInstructionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onInputPromptChange: (value: string) => void; 
  onClearInput: () => void;
  onSubmit: () => Promise<void>; 
  onCopyResponse: (isYaml?: boolean) => Promise<void>; 
  onSaveResponseAsNewNote: () => void;
  aiResponseRef: React.RefObject<HTMLDivElement>;
  onAutoCreateLoreEntries: (entries: Array<{ title: string; type: LoreEntry['type']; }>) => void; 
}

const MIN_WORD_LENGTH_FOR_REPETITION_CHECK = 2; 

const VALID_LORE_TYPES: LoreEntry['type'][] = ['Character', 'Place', 'Item', 'Concept', 'Event', 'Other', 'ArcanaSystem'];
const isValidLoreType = (typeString: string): typeString is LoreEntry['type'] => {
  return VALID_LORE_TYPES.includes(typeString as LoreEntry['type']);
};

const parseLoreNotations = (text: string): Array<{ title: string; type: LoreEntry['type']; }> => {
  const entries: Array<{ title: string; type: LoreEntry['type']; }> = [];
  const bracketRegex = /\[\[([^|\]]+)(?:\|([^\]]+))?\]\]/g; 
  const mentionRegex = /@([\w-]+)/g; 

  let match;

  while ((match = bracketRegex.exec(text)) !== null) {
    const title = match[1].trim();
    let typeString = match[2] ? match[2].trim() : 'Concept'; 
    if (title) {
        const type = isValidLoreType(typeString) ? typeString : 'Concept'; 
        entries.push({ title, type });
    }
  }

  while ((match = mentionRegex.exec(text)) !== null) {
    const title = match[1].trim();
    if (title) {
        entries.push({ title, type: 'Character' }); 
    }
  }
  return entries;
};


const AiWriter: React.FC<AiWriterProps> = ({
  showAiWriterSection,
  operationMode,
  customSystemInstruction,
  inputPrompt,
  aiResponse, 
  isLoading,
  error,
  inputCharCount, 
  responseCharCount, 
  defaultCustomModeSI,
  currentTheme,
  userPreferences,
  activeProjectName,
  projectCharacters, 
  projectArcanaSystems, 
  onOperationModeChange,
  onCustomSystemInstructionChange,
  onInputPromptChange, 
  onClearInput,
  onSubmit,
  onCopyResponse, 
  onSaveResponseAsNewNote,
  aiResponseRef, 
  onAutoCreateLoreEntries 
}) => {
  const [wordRepetitions, setWordRepetitions] = useState<Record<string, number>>({});
  const [showRepetitionPopover, setShowRepetitionPopover] = useState(false);
  const [showSceneCreator, setShowSceneCreator] = useState(false);
  
  const [proseContent, setProseContent] = useState<string>(INITIAL_AI_RESPONSE_MESSAGE);
  const [yamlContent, setYamlContent] = useState<string | null>(null);
  const yamlOutputRef = useRef<HTMLPreElement>(null);

  const repetitionThreshold = userPreferences.aiWriterPreferences.repetitionThreshold || 3;

  useEffect(() => {
    if (operationMode === 'scene-creation' || operationMode === 'scene-analysis') {
      setShowSceneCreator(true);
    } else {
      setShowSceneCreator(false);
      // Do not clear inputPrompt here, as it might be set by analyzing a note.
      // Clearing should be explicit via onClearInput or when switching from a non-scene mode to another non-scene mode if desired.
    }
  }, [operationMode]);

  useEffect(() => {
    if (isLoading) {
        setProseContent(PROCESSING_AI_RESPONSE_MESSAGE);
        setYamlContent(null);
        return;
    }
    // Error from props takes precedence if AI is not loading
    if (error && !isLoading) {
        setProseContent(`<p class="text-red-400 font-semibold">ข้อผิดพลาด: ${error}</p>`);
        setYamlContent(null);
        return;
    }

    if (aiResponse === INITIAL_AI_RESPONSE_MESSAGE || aiResponse === PROCESSING_AI_RESPONSE_MESSAGE) {
        setProseContent(aiResponse);
        setYamlContent(null);
        return;
    }
    // Check if aiResponse itself contains a Gemini error message
    if (aiResponse.includes("AI Error:") || aiResponse.includes("AI ไม่ได้ส่งข้อความตอบกลับ")) {
        setProseContent(aiResponse); // Display the error/message as is
        setYamlContent(null);
        return;
    }


    const yamlRegex = /```yaml\n([\s\S]*?)\n```|---\n([\s\S]*?)\n---/;
    const match = aiResponse.match(yamlRegex);

    if (match) {
      const extractedYaml = match[1] || match[2];
      setYamlContent(extractedYaml.trim());
      const prose = aiResponse.replace(match[0], '').trim();
      const htmlProse = window.marked ? window.marked.parse(prose || INITIAL_AI_RESPONSE_MESSAGE) : `<pre>${prose.replace(/</g, "&lt;").replace(/>/g, "&gt;") || INITIAL_AI_RESPONSE_MESSAGE}</pre>`;
      setProseContent(htmlProse);
    } else {
      const htmlProse = window.marked ? window.marked.parse(aiResponse) : `<pre>${aiResponse.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`;
      setProseContent(htmlProse);
      setYamlContent(null);
    }
  }, [aiResponse, isLoading, error]);


  useEffect(() => {
    if (!inputPrompt || inputPrompt.trim() === '') {
      setWordRepetitions({});
      return;
    }

    const analyze = () => {
      const cleanedText = inputPrompt.toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"“”…‘’\[\]\n\r\t]/g, ' ') 
        .replace(/\s+/g, ' '); 
      
      const words = cleanedText.split(' ').filter(word => word.length >= MIN_WORD_LENGTH_FOR_REPETITION_CHECK);
      const counts: Record<string, number> = {};
      words.forEach(word => {
        counts[word] = (counts[word] || 0) + 1;
      });
      setWordRepetitions(counts);
    };
    
    const timeoutId = setTimeout(analyze, 300);
    return () => clearTimeout(timeoutId);

  }, [inputPrompt, MIN_WORD_LENGTH_FOR_REPETITION_CHECK]);

  const wordsOverThreshold = Object.entries(wordRepetitions)
    .filter(([_, count]) => count > repetitionThreshold)
    .sort(([, countA], [, countB]) => countB - countA);


  const selectArrowSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='${currentTheme.text === 'text-white' || currentTheme.text === 'text-slate-300' ? '%23CBD5E1' : '%2364748B'}'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E`;
  
  const isDarkTheme = currentTheme.text === 'text-white' || currentTheme.text === 'text-slate-300' || currentTheme.text === 'text-gray-100';
  const optionStyle = isDarkTheme 
    ? { backgroundColor: '#1E293B', color: '#E2E8F0' } 
    : { backgroundColor: '#FFFFFF', color: '#1F2937' }; 

  const handleSubmitWithLoreParsing = async (currentPrompt: string) => {
    const parsedEntries = parseLoreNotations(currentPrompt);
    if (parsedEntries.length > 0) {
        onAutoCreateLoreEntries(parsedEntries);
    }
    if (currentPrompt !== inputPrompt) { 
      onInputPromptChange(currentPrompt); 
      setTimeout(async () => {
        await onSubmit();
      }, 0);
    } else {
        await onSubmit(); 
    }
  };
  
  const getLoreEntryTitleById = (id: string, loreList: LoreEntry[]): string => {
    return loreList.find(l => l.id === id)?.title || id;
  };

  const handleSceneFormSubmit = (sceneData: SceneCreatorFormData) => {
    let formattedPrompt = `${operationMode === 'scene-creation' ? 'สร้างฉากใหม่' : 'วิเคราะห์ฉาก'} โดยมีรายละเอียดดังนี้:\n`;
    formattedPrompt += `ชื่อฉาก: ${sceneData.title || '(ไม่ได้ระบุ)'}\n`;
    if (sceneData.chapter) formattedPrompt += `บทที่/ตอน: ${sceneData.chapter}\n`;
    if (sceneData.sceneNumber) formattedPrompt += `หมายเลขฉาก: ${sceneData.sceneNumber}\n`;

    if (sceneData.settingLocation) formattedPrompt += `สถานที่: ${sceneData.settingLocation}\n`;
    if (sceneData.timeOfDay) formattedPrompt += `ช่วงเวลาของวัน: ${sceneData.timeOfDay}\n`;
    if (sceneData.weather) formattedPrompt += `สภาพอากาศ: ${sceneData.weather}\n`;
    
    const characterNames = sceneData.charactersInvolved.map(id => getLoreEntryTitleById(id, projectCharacters));
    formattedPrompt += `ตัวละครที่เกี่ยวข้อง: ${characterNames.length > 0 ? characterNames.join(', ') : '(ไม่ได้ระบุ)'}\n`;
    
    const povCharacterName = sceneData.povCharacter ? getLoreEntryTitleById(sceneData.povCharacter, projectCharacters) : '(ไม่ได้ระบุ)';
    formattedPrompt += `ตัวละคร POV: ${povCharacterName}\n`;
    
    if (sceneData.emotionalArc) formattedPrompt += `เส้นอารมณ์: ${sceneData.emotionalArc}\n`;
    if (sceneData.conflictType) formattedPrompt += `ประเภทความขัดแย้ง: ${sceneData.conflictType}\n`;
    
    formattedPrompt += `คำอธิบายฉากโดยรวม: ${sceneData.description || '(ไม่ได้ระบุ)'}\n`;

    if (sceneData.keyPlotPoints) formattedPrompt += `จุดสำคัญของเนื้อเรื่อง: ${sceneData.keyPlotPoints}\n`;
    if (sceneData.foreshadowing) formattedPrompt += `การปูเรื่อง/บอกใบ้: ${sceneData.foreshadowing}\n`;
    
    const arcanaNames = sceneData.arcanaElements.map(id => getLoreEntryTitleById(id, projectArcanaSystems));
    formattedPrompt += `ระบบ Arcana ที่ใช้: ${arcanaNames.length > 0 ? arcanaNames.join(', ') : '(ไม่ได้ระบุ)'}\n`;

    formattedPrompt += `จุดประสงค์ของฉาก: ${sceneData.purpose || '(ไม่ได้ระบุ)'}\n`;

    if (sceneData.advancedYaml && sceneData.advancedYaml.trim()) {
      formattedPrompt += `\nYAML ขั้นสูง:\n---\n${sceneData.advancedYaml.trim()}\n---\n`;
    }
    
    handleSubmitWithLoreParsing(formattedPrompt);
  };

  const handleCopyToClipboard = async (isYamlBlock: boolean) => {
    let textToCopy = "";
    if (isYamlBlock && yamlOutputRef.current) {
      textToCopy = yamlOutputRef.current.textContent || "";
    } else if (!isYamlBlock && aiResponseRef.current) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = proseContent; 
      textToCopy = tempDiv.textContent || tempDiv.innerText || "";
    }

    if (!textToCopy.trim() || textToCopy.includes('ผลลัพธ์จาก AI จะปรากฏที่นี่...') || textToCopy.includes('กำลังประมวลผล...')) {
      alert(`ไม่มีข้อความ${isYamlBlock ? ' YAML ' : ' '}ให้คัดลอก`);
      return;
    }
    try {
      await navigator.clipboard.writeText(textToCopy);
      alert(`คัดลอก${isYamlBlock ? ' YAML ' : 'ผลลัพธ์ AI '}สำเร็จ`);
    } catch (err) {
      alert(`ไม่สามารถคัดลอก${isYamlBlock ? ' YAML ' : 'ผลลัพธ์ AI '}ได้`);
    }
  };
  

  if (!showAiWriterSection) return null;

  return (
    <div className={`${currentTheme.cardBg} rounded-xl p-4 sm:p-6 mb-6 shadow-lg`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-xl font-semibold ${currentTheme.text} flex items-center`}>
            <MessageSquare className={`w-5 h-5 mr-2 ${currentTheme.accent.replace('bg-','text-')}`}/> AI ผู้ช่วยนักเขียน
        </h3>
        {activeProjectName && (
            <div className={`text-xs ${currentTheme.text} opacity-70 flex items-center bg-white/5 px-2 py-1 rounded-md`}>
                <Package size={12} className="mr-1.5 opacity-80" />
                Context: โปรเจกต์ "{activeProjectName}"
            </div>
        )}
      </div>
      <div className="mb-4">
        <label htmlFor="operation-mode-ai" className={`block text-sm font-medium ${currentTheme.text} opacity-90 mb-1`}>โหมด AI:</label>
        <div className="relative">
          <select
            id="operation-mode-ai" value={operationMode} onChange={onOperationModeChange} disabled={isLoading}
            className={`w-full py-2.5 px-3.5 pr-10 border-0 rounded-lg ${currentTheme.inputBg} ${currentTheme.inputText} ${currentTheme.inputBorder} appearance-none focus:outline-none focus:ring-2 ${currentTheme.accent.replace('bg-','focus:ring-')} transition-colors text-sm bg-no-repeat bg-right-2.5`}
            style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1.25em', color: isDarkTheme ? '#E2E8F0' : '#1F2937' }}
            aria-label="เลือกโหมด AI"
          >
            {OPERATION_MODES.map((mode: OperationMode) => (<option key={mode.value} value={mode.value} style={optionStyle}>{mode.label}</option>))}
          </select>
        </div>
      </div>

      {operationMode === 'custom' && !showSceneCreator && (
        <div className="mb-4">
          <label htmlFor="custom-system-instruction-ai" className={`block text-sm font-medium ${currentTheme.text} opacity-90 mb-1`}>System Instruction (AI กำหนดเอง):</label>
          <textarea
            id="custom-system-instruction-ai" value={customSystemInstruction} onChange={onCustomSystemInstructionChange} disabled={isLoading} placeholder={defaultCustomModeSI}
            className={`w-full p-3 border-0 rounded-lg min-h-[80px] resize-y ${currentTheme.inputBg} ${currentTheme.inputText} ${currentTheme.inputBorder} focus:outline-none focus:ring-2 ${currentTheme.accent.replace('bg-','focus:ring-')} transition-colors text-sm`}
            aria-describedby="custom-si-ai-helper"
          />
           <p id="custom-si-ai-helper" className={`text-xs ${currentTheme.text} opacity-70 mt-1`}>ป้อน System Instruction สำหรับ AI ที่นี่ (ถ้าเว้นว่างจะใช้ค่าเริ่มต้น)</p>
        </div>
      )}

      {showSceneCreator ? (
        <SceneCreatorForm
          currentTheme={currentTheme}
          onSubmitSceneData={handleSceneFormSubmit}
          isLoading={isLoading}
          projectCharacters={projectCharacters}
          projectArcanaSystems={projectArcanaSystems}
        />
      ) : (
        <div className="mb-4">
          <label htmlFor="input-prompt-ai" className={`block text-sm font-medium ${currentTheme.text} opacity-90 mb-1`}>คำสั่งสำหรับ AI:</label>
          <textarea
            id="input-prompt-ai" value={inputPrompt} onChange={(e) => onInputPromptChange(e.target.value)} disabled={isLoading}
            placeholder={`ใส่เนื้อหา, คำถาม, หรือคำสั่งสำหรับ AI... สามารถใช้ [[ชื่อข้อมูล]] [[ชื่อข้อมูล|ประเภท]] หรือ @ชื่อตัวละคร เพื่อสร้างข้อมูลโลกอัตโนมัติ`}
            className={`w-full p-3 border-0 rounded-lg min-h-[100px] resize-y ${currentTheme.inputBg} ${currentTheme.inputText} ${currentTheme.inputBorder} focus:outline-none focus:ring-2 ${currentTheme.accent.replace('bg-','focus:ring-')} transition-colors text-sm`}
            aria-describedby="input-char-count-ai input-repetition-info-ai"
          />
          <div className="flex justify-between items-center mt-1">
              {wordsOverThreshold.length > 0 && (
                  <div className="relative">
                      <button
                          onClick={() => setShowRepetitionPopover(!showRepetitionPopover)}
                          onMouseEnter={() => setShowRepetitionPopover(true)} onMouseLeave={() => setShowRepetitionPopover(false)}
                          className={`flex items-center text-xs px-2 py-1 rounded-md transition-colors ${wordsOverThreshold.length > 2 ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'}`}
                          aria-describedby="repetition-popover" id="input-repetition-info-ai"
                      >
                          <AlertTriangle className="w-3.5 h-3.5 mr-1" />พบคำซ้ำ ({wordsOverThreshold.length} คำ)
                      </button>
                      {showRepetitionPopover && (
                          <div id="repetition-popover" role="tooltip" className={`absolute bottom-full left-0 mb-2 w-64 p-3 rounded-lg shadow-xl ${currentTheme.cardBg} border ${currentTheme.text === 'text-white' || currentTheme.text === 'text-slate-300' || currentTheme.text === 'text-gray-100' ? 'border-slate-600' : 'border-gray-300'} z-10`}>
                              <p className={`text-sm font-semibold ${currentTheme.text} mb-1`}>คำที่ใช้ซ้ำเกิน {repetitionThreshold} ครั้ง:</p>
                              <ul className="list-disc list-inside text-xs max-h-32 overflow-y-auto">
                                  {wordsOverThreshold.map(([word, count]) => (<li key={word} className={`${currentTheme.text} opacity-90`}>"{word}": {count} ครั้ง</li>))}
                              </ul>
                          </div>
                      )}
                  </div>
              )}
               <div className="flex-grow"></div> {}
              <div id="input-char-count-ai" className={`text-xs text-right pr-1 ${inputCharCount > AI_MAX_INPUT_CHARS ? 'text-red-400 font-semibold' : `${currentTheme.text} opacity-70`}`} aria-live="polite">
                  จำนวนตัวอักษร: {inputCharCount} 
              </div>
          </div>
        </div>
      )}
      
      {!showSceneCreator && (
        <div className="flex flex-col sm:flex-row justify-end items-center my-4 gap-3">
          <button onClick={onClearInput} disabled={isLoading} className={`${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} w-full sm:w-auto flex items-center justify-center gap-2 font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 hover:bg-opacity-80`}>
            <XCircle className="w-4 h-4" /> ล้าง
          </button>
          <button onClick={() => handleSubmitWithLoreParsing(inputPrompt)} disabled={isLoading || !inputPrompt.trim() || inputCharCount > AI_MAX_INPUT_CHARS} className={`${currentTheme.button} ${currentTheme.buttonText} w-full sm:w-auto flex items-center justify-center gap-2 font-medium py-2.5 px-5 rounded-lg transition-transform duration-200 shadow-md hover:scale-105 disabled:opacity-60 disabled:hover:scale-100`}>
            {isLoading ? (<Loader2 className={`w-5 h-5 ${currentTheme.buttonText} animate-spin`} aria-hidden="true" />) : (<Send className="w-4 h-4" />)}
            {isLoading ? 'กำลังส่ง...' : 'ส่งให้ AI'}
          </button>
        </div>
      )}
      
      {/* More prominent error display, separate from AI response content box */}
      {error && !isLoading && (
        <div className={`bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-md mb-4 flex items-center gap-2 shadow-md`} role="alert">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div>
            <strong className="font-semibold block">เกิดข้อผิดพลาดกับ AI:</strong>
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}
      
      {yamlContent && !isLoading && !error && (
        <div className="mb-4">
          <label className={`block text-sm font-medium ${currentTheme.text} opacity-90 mb-1`}>YAML Metadata จาก AI:</label>
          <div className="yaml-output">
            <pre ref={yamlOutputRef} className={`${isDarkTheme ? 'dark' : 'light'} rounded-md`} tabIndex={0}>{yamlContent}</pre>
          </div>
           <button 
            onClick={() => handleCopyToClipboard(true)} 
            disabled={isLoading || !yamlContent} 
            className={`${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} text-xs mt-1.5 px-2.5 py-1.5 rounded-md transition-colors duration-200 disabled:opacity-60 flex items-center gap-1 hover:bg-opacity-80 shadow-sm`}
          >
            <Copy size={12}/> คัดลอก YAML
          </button>
        </div>
      )}

      <div className="mb-2">
          <label className={`block text-sm font-medium ${currentTheme.text} opacity-90 mb-1`}>ผลลัพธ์จาก AI (ข้อความ):</label>
          <div
              ref={aiResponseRef} tabIndex={0} aria-live="assertive"
              className={`ai-response-output p-3.5 min-h-[150px] max-h-[400px] overflow-y-auto rounded-lg ${currentTheme.aiResponseBg} border ${currentTheme.divider} prose-sm ${isDarkTheme ? 'prose-dark' : ''} max-w-none ${currentTheme.text} opacity-90`}
              dangerouslySetInnerHTML={{ __html: proseContent }}
              style={{fontFamily: 'Sarabun, sans-serif'}}
          />
          <div className={`text-xs ${currentTheme.text} opacity-70 mt-1 text-right pr-1`}>จำนวนตัวอักษร: {responseCharCount}</div>
      </div>

       <div className="flex flex-col sm:flex-row justify-end mt-4 gap-3">
          <button onClick={() => handleCopyToClipboard(false)} disabled={isLoading || proseContent === INITIAL_AI_RESPONSE_MESSAGE || proseContent === PROCESSING_AI_RESPONSE_MESSAGE || !!error || proseContent.includes("AI Error:")} className={`${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} w-full sm:w-auto flex items-center justify-center gap-2 font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 disabled:opacity-60 hover:bg-opacity-80 shadow-sm`}>
              <Copy className="w-4 h-4" /> คัดลอกผลลัพธ์ (ข้อความ)
          </button>
          <button onClick={onSaveResponseAsNewNote} disabled={isLoading || proseContent === INITIAL_AI_RESPONSE_MESSAGE || proseContent === PROCESSING_AI_RESPONSE_MESSAGE || !!error || proseContent.includes("AI Error:")} className={`${currentTheme.button} ${currentTheme.buttonText} w-full sm:w-auto flex items-center justify-center gap-2 font-medium py-2.5 px-4 rounded-lg transition-transform duration-200 disabled:opacity-60 shadow-md hover:scale-105`}>
              <Plus className="w-4 h-4" /> บันทึกเป็นโน้ต
          </button>
      </div>
    </div>
  );
};

export default AiWriter;
