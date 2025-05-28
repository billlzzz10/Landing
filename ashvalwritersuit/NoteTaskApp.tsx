
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, useNavigate } from 'react-router-dom'; // Import useNavigate
import { Home, FileText, Users, Aperture, Globe, BarChartHorizontalBig, Brain, ListChecks, Share2 as GraphIcon, BookText as DictionaryIcon, Settings as SettingsIcon, X, Menu, Edit3, Package, LucideProps, MessageSquare, CalendarDays, BookText, LayoutDashboard, BookOpen, LandPlot, Palette, Wand2 } from 'lucide-react'; 

import { OPERATION_MODES, INITIAL_AI_RESPONSE_MESSAGE, PROCESSING_AI_RESPONSE_MESSAGE, AI_MAX_INPUT_CHARS, MAX_CHAT_EXCHANGES, PROJECT_CONTEXT_MAX_NOTE_CHARS, PROJECT_CONTEXT_MAX_LORE_CHARS, MAX_PROJECT_NOTES_IN_CONTEXT, MAX_PROJECT_LORE_IN_CONTEXT, MODEL_NAME, NOTE_TEMPLATES, MIN_LEARNED_WORD_LENGTH, FONT_FAMILIES } from './constants'; 
import { AppNote, AppTask, AppSubtask, OperationMode, ChatTurn, PomodoroConfig, LoreEntry, NoteVersion, UserPreferences, Project, PlotOutlineNode, GraphNode, GraphEdge } from './types'; 
import { generateAiContent, generateSubtasksForTask } from './frontend/src/services/geminiService';
import { fetchAppDataFromServer, saveAppDataToServer, AppDataType } from './frontend/src/services/appDataService'; 

import App from './App'; 
import NoteModal from './NoteModal';
import TaskModal from './TaskModal';
import ViewNoteModal from './ViewNoteModal';
import AiSubtaskSuggestionModal from './AiSubtaskSuggestionModal';
import QuickActionsBar from './QuickActionsBar';
import HomePage from './HomePage'; 
import LoreOverviewPage from './LoreOverviewPage'; 


const plainTextCharCount = (text: string): number => {
  if (!text) return 0; 
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = text; 
  const plainText = tempDiv.textContent || tempDiv.innerText || "";
  return plainText.length; 
};

export interface AppTheme { 
  name: string;
  bg: string; 
  contentBg: string; 
  cardBg: string; 
  text: string; 
  textSecondary: string; 
  accent: string; 
  accentText: string; 
  button: string; 
  buttonText: string; 
  buttonSecondaryBg: string;
  buttonSecondaryText: string;
  inputBg: string; 
  inputText: string; 
  inputBorder: string; 
  inputPlaceholder: string; 
  focusRing: string; 
  aiResponseBg: string; 
  divider: string; 
}

const themes: Record<string, AppTheme> = {
  inkweaverDark: { name: 'Inkweaver Dark', bg: 'bg-[#1C1C1E]', contentBg: 'bg-[#2C2C2E]', cardBg: 'bg-[#3A3A3C]', text: 'text-gray-100', textSecondary: 'text-gray-400', accent: 'bg-teal-500', accentText: 'text-white', button: 'bg-teal-600', buttonText: 'text-white', buttonSecondaryBg: 'bg-gray-700', buttonSecondaryText: 'text-gray-200', inputBg: 'bg-gray-700', inputText: 'text-gray-100', inputBorder: 'border-gray-600', inputPlaceholder: 'placeholder-gray-500', focusRing: 'focus:ring-teal-500', aiResponseBg: 'bg-gray-700', divider: 'border-gray-600'},
  deepSpace: { name: 'Deep Space', bg: 'bg-slate-900', contentBg: 'bg-slate-800', cardBg: 'bg-slate-800', text: 'text-slate-200', textSecondary: 'text-slate-400', accent: 'bg-sky-500', accentText: 'text-white', button: 'bg-sky-600', buttonText: 'text-white', buttonSecondaryBg: 'bg-slate-700', buttonSecondaryText: 'text-slate-200', inputBg: 'bg-slate-700', inputText: 'text-slate-100', inputBorder: 'border-slate-600', inputPlaceholder: 'placeholder-slate-500', focusRing: 'focus:ring-sky-500', aiResponseBg: 'bg-slate-700', divider: 'border-slate-700'},
  midnightNavy: { name: 'Midnight Navy', bg: 'bg-gray-900', contentBg: 'bg-gray-800', cardBg: 'bg-gray-800', text: 'text-blue-100', textSecondary: 'text-blue-300', accent: 'bg-cyan-500', accentText: 'text-white', button: 'bg-cyan-600', buttonText: 'text-white', buttonSecondaryBg: 'bg-gray-700', buttonSecondaryText: 'text-blue-100', inputBg: 'bg-gray-700', inputText: 'text-blue-50', inputBorder: 'border-gray-600', inputPlaceholder: 'placeholder-gray-500', focusRing: 'focus:ring-cyan-500', aiResponseBg: 'bg-gray-700', divider: 'border-gray-600'},
  classicLight: { name: 'Classic Light', bg: 'bg-gray-100', contentBg: 'bg-white', cardBg: 'bg-white', text: 'text-gray-800', textSecondary: 'text-gray-500', accent: 'bg-indigo-500', accentText: 'text-white', button: 'bg-indigo-600', buttonText: 'text-white', buttonSecondaryBg: 'bg-gray-200', buttonSecondaryText: 'text-gray-700', inputBg: 'bg-gray-50', inputText: 'text-gray-900', inputBorder: 'border-gray-300', inputPlaceholder: 'placeholder-gray-400', focusRing: 'focus:ring-indigo-500', aiResponseBg: 'bg-gray-50', divider: 'border-gray-200'},
};

const initialPomodoroConfig: PomodoroConfig = { work: 25, shortBreak: 5, longBreak: 15, rounds: 4 };
const initialUserPreferences: UserPreferences = {
  notificationPreferences: { taskReminders: true, projectUpdates: false },
  aiWriterPreferences: { 
    repetitionThreshold: 3,
    autoAddLoreFromAi: false,
    autoAnalyzeScenes: false,
    contextualAiMenuStyle: 'simple',
  },
  selectedFontFamily: FONT_FAMILIES[0].value, 
};
const initialActiveThemeKey = 'inkweaverDark'; // Changed default theme

const categoryIconLookup: Array<[string, React.ElementType]> = [
  ['writing', Edit3], ['plot', BarChartHorizontalBig], ['character', Users], ['worldbuilding', Globe],
  ['place', LandPlot], ['research', Brain], ['design', Palette], ['ideas', Brain], ['magic', Wand2], ['item', Package],
  ['feedback', MessageSquare], ['ai generated', Brain], ['imported', FileText],
  ['general', FileText], ['personal', Users], ['item', Package], ['concept', Brain],
  ['event', CalendarDays], ['arcanasystem', Aperture], ['scene', Aperture], ['chapter', BookText], ['episode', BookText],
  ['editing', Edit3], ['marketing', BarChartHorizontalBig]
];

export const getCategoryIcon = (category: string): JSX.Element => {
    const catLower = category.toLowerCase();
    for (const [key, IconComponent] of categoryIconLookup) {
        if (catLower.includes(key)) {
            return <IconComponent size={18} className="opacity-80" />; 
        }
    }
    return <Package size={18} className="opacity-80" />; 
};

export const formatPomodoroTime = (seconds: number): string => {
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
};

export interface NavItemDefinition {
  id: string;
  label: string;
  icon: React.ElementType<LucideProps>;
  path: string;
}

const mainNavItemsList: NavItemDefinition[] = [
  { id: 'my-projects', label: 'โครงการของฉัน', icon: Home, path: '/home' },
  { id: 'novels-chapters', label: 'นิยาย/บท', icon: FileText, path: '/notes' },
  { id: 'world-building', label: 'สร้างโลก', icon: Globe, path: '/lore-overview' },
  { id: 'characters', label: 'ตัวละคร', icon: Users, path: '/characters' },
  { id: 'magic-systems', label: 'ระบบเวทมนตร์', icon: Wand2, path: '/magic-systems' },
  { id: 'plot-outline', label: 'โครงเรื่อง', icon: BarChartHorizontalBig, path: '/plot-outline' },
  { id: 'ai-assistant', label: 'ผู้ช่วย AI', icon: Brain, path: '/ai-writer' },
  { id: 'tasks-focus', label: 'งานและโฟกัส', icon: ListChecks, path: '/tasks' },
  // { id: 'dashboard', label: 'แดชบอร์ด', icon: LayoutDashboard, path: '/dashboard' },
  // { id: 'graph', label: 'กราฟความสัมพันธ์', icon: GraphIcon, path: '/graph' }, 
  // { id: 'dictionary', label: 'พจนานุกรม AI', icon: DictionaryIcon, path: '/dictionary' }, 
  { id: 'settings', label: 'ตั้งค่า', icon: SettingsIcon, path: '/settings' },
];


export const NoteTaskApp = () => {
  const [activeThemeKey, setActiveThemeKey] = useState(initialActiveThemeKey);
  
  const [notes, setNotes] = useState<AppNote[]>([]);
  const [tasks, setTasks] = useState<AppTask[]>([]);
  const [loreEntries, setLoreEntries] = useState<LoreEntry[]>([]); 
  const [projects, setProjects] = useState<Project[]>([]); 
  const [plotOutlines, setPlotOutlines] = useState<PlotOutlineNode[]>([]);
  const [activeProjectId, setActiveProjectIdStateHook] = useState<string | null>(null);

  const [graphNodes, setGraphNodes] = useState<GraphNode[]>([]);
  const [graphEdges, setGraphEdges] = useState<GraphEdge[]>([]);

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [currentNoteData, setCurrentNoteData] = useState<Pick<AppNote, 'title' | 'icon' | 'content' | 'rawMarkdownContent' | 'category' | 'tags' | 'projectId'>>({ title: '', icon: '', content: '', rawMarkdownContent: '', category: 'ทั่วไป', tags: [], projectId: null });
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  
  const [currentTaskData, setCurrentTaskData] = useState<Pick<AppTask, 'title' | 'icon' | 'priority' | 'dueDate' | 'category' | 'projectId'>>({ title: '', icon: '', priority: 'medium', dueDate: '', category: 'ทั่วไป', projectId: null });

  const [showViewNoteModal, setShowViewNoteModal] = useState(false);
  const [noteToView, setNoteToView] = useState<AppNote | null>(null);
  
  const [showAiWriterSection, setShowAiWriterSection] = useState(true); 
  const [operationModeAi, setOperationModeAi] = useState<string>(OPERATION_MODES[0].value);
  const [customSystemInstructionAi, setCustomSystemInstructionAi] = useState<string>('');
  const [inputPromptAi, setInputPromptAi] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>(INITIAL_AI_RESPONSE_MESSAGE); 
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [errorAi, setErrorAi] = useState<string | null>(null);
  const [chatHistoryAi, setChatHistoryAi] = useState<ChatTurn[]>([]);
  const [learnedWordsAi, setLearnedWordsAi] = useState<Set<string>>(new Set());
  const [inputCharCountAi, setInputCharCountAi] = useState<number>(0); 
  const [responseCharCountAi, setResponseCharCountAi] = useState<number>(0); 
  
  const aiResponseRef = useRef<HTMLDivElement>(null); 
  const defaultCustomModeSIAi = OPERATION_MODES.find(m => m.value === 'custom')?.systemInstruction || '';

  const [taskForSubtaskGeneration, setTaskForSubtaskGeneration] = useState<AppTask | null>(null);
  const [aiSuggestedSubtasks, setAiSuggestedSubtasks] = useState<string[]>([]);
  const [showAiSubtaskModal, setShowAiSubtaskModal] = useState<boolean>(false);
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState<boolean>(false);
  const [subtaskGenerationError, setSubtaskGenerationError] = useState<string | null>(null);

  const [pomodoroConfig, setPomodoroConfig] = useState<PomodoroConfig>(initialPomodoroConfig);
  const [pomodoroCurrentMode, setPomodoroCurrentMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [pomodoroTimeLeft, setPomodoroTimeLeft] = useState<number>(initialPomodoroConfig.work * 60);
  const [pomodoroIsActive, setPomodoroIsActive] = useState<boolean>(false);
  const [pomodoroCurrentRound, setPomodoroCurrentRound] = useState<number>(1);
  const pomodoroIntervalRef = useRef<number | null>(null);
  const [tempPomodoroConfig, setTempPomodoroConfig] = useState<PomodoroConfig>(initialPomodoroConfig);

  const [userPreferences, setUserPreferences] = useState<UserPreferences>(initialUserPreferences);
  
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const [appVersion, setAppVersion] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const normalizeProject = (project: any): Project => ({ id: String(project.id || Date.now().toString()), name: String(project.name || 'โปรเจกต์ไม่มีชื่อ'), genre: project.genre ? String(project.genre) : undefined, description: project.description ? String(project.description) : undefined, createdAt: String(project.createdAt || new Date().toISOString()), updatedAt: project.updatedAt ? String(project.updatedAt) : String(project.createdAt || new Date().toISOString()), });
  const normalizeLoreEntry = (entry: any): LoreEntry => ({ id: String(entry.id || Date.now().toString() + Math.random()), title: String(entry.title || 'ข้อมูลโลกไม่มีชื่อ'), type: entry.type || 'Concept', content: String(entry.content || ''), tags: Array.isArray(entry.tags) ? entry.tags.map(String) : [], createdAt: String(entry.createdAt || new Date().toISOString()), projectId: entry.projectId || null, role: entry.role || undefined, characterArcana: Array.isArray(entry.characterArcana) ? entry.characterArcana.map(String) : [], relationships: Array.isArray(entry.relationships) ? entry.relationships.map((r: any) => ({ targetCharacterId: String(r.targetCharacterId || ''), targetCharacterName: r.targetCharacterName ? String(r.targetCharacterName) : undefined, relationshipType: String(r.relationshipType || ''), description: r.description ? String(r.description) : undefined, })) : [], age: entry.age, gender: entry.gender, status: entry.status, avatarUrl: entry.avatarUrl, customFields: typeof entry.customFields === 'object' && entry.customFields !== null ? entry.customFields : {}, });
  const normalizeNote = (note: any): AppNote => ({ id: note.id || Date.now(), title: String(note.title || 'โน้ตไม่มีชื่อ'), icon: note.icon || undefined, content: String(note.content || ''), rawMarkdownContent: String(note.rawMarkdownContent || note.content || ''), category: String(note.category || 'ทั่วไป'), tags: Array.isArray(note.tags) ? note.tags.map(String) : [], createdAt: String(note.createdAt || new Date().toISOString()), updatedAt: note.updatedAt ? String(note.updatedAt) : undefined, versions: Array.isArray(note.versions) ? note.versions.map((v: any) => ({ timestamp: String(v.timestamp || new Date().toISOString()), content: String(v.content || ''), rawMarkdownContent: String(v.rawMarkdownContent || v.content || '') })) : [], projectId: note.projectId || null });
  const normalizeTask = (task: any): AppTask => ({ id: task.id || Date.now(), title: String(task.title || 'งานไม่มีชื่อ'), icon: task.icon || undefined, completed: typeof task.completed === 'boolean' ? task.completed : false, priority: String(task.priority || 'medium'), dueDate: String(task.dueDate || ''), category: String(task.category || 'ทั่วไป'), subtasks: Array.isArray(task.subtasks) ? task.subtasks.map((st: any): AppSubtask => ({ id: String(st.id || Date.now().toString() + Math.random().toString(36).substring(2, 9)), title: String(st.title || 'งานย่อย'), completed: typeof st.completed === 'boolean' ? st.completed : false, })) : [], createdAt: String(task.createdAt || new Date().toISOString()), projectId: task.projectId || null });
  const normalizePlotOutlineNode = (node: any): PlotOutlineNode => ({ id: String(node.id || Date.now().toString() + Math.random()), text: String(node.text || 'จุดโครงเรื่องไม่มีชื่อ'), order: typeof node.order === 'number' ? node.order : 0, parentId: node.parentId !== undefined ? String(node.parentId) : null, childrenIds: Array.isArray(node.childrenIds) ? node.childrenIds.map(String) : [], linkedNoteId: node.linkedNoteId !== undefined ? Number(node.linkedNoteId) : null, linkedLoreEntryId: node.linkedLoreEntryId !== undefined ? String(node.linkedLoreEntryId) : null, projectId: node.projectId !== undefined ? String(node.projectId) : null, createdAt: String(node.createdAt || new Date().toISOString()), isExpanded: typeof node.isExpanded === 'boolean' ? node.isExpanded : true, });

  useEffect(() => {
    const loadInitialData = async () => {
      if (window.pdfjsLib) {
        const pdfJsVersion = window.pdfjsLib.version || '3.11.174'; 
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfJsVersion}/pdf.worker.min.js`;
      }
      try {
        const response = await fetch('/metadata.json');
        if (response.ok) {
          const metadata = await response.json();
          setAppVersion(metadata.version || 'N/A');
        } else { setAppVersion('N/A'); }
      } catch (error) { setAppVersion('N/A');}
      
      try {
        const storedAppData = localStorage.getItem('smartNotesAppData');
        if (storedAppData) {
          const parsedData = JSON.parse(storedAppData) as AppDataType;
          setNotes((parsedData.notes || []).map(normalizeNote));
          setTasks((parsedData.tasks || []).map(normalizeTask));
          setLoreEntries((parsedData.loreEntries || []).map(normalizeLoreEntry)); 
          setProjects((parsedData.projects || []).map(normalizeProject)); 
          setPlotOutlines((parsedData.plotOutlines || []).map(normalizePlotOutlineNode));
          setActiveThemeKey(parsedData.activeTheme || initialActiveThemeKey);
          const loadedPomodoro = parsedData.pomodoroConfig || initialPomodoroConfig;
          setPomodoroConfig(loadedPomodoro); setTempPomodoroConfig(loadedPomodoro); 
          setPomodoroTimeLeft(loadedPomodoro.work * 60); 
          
          const loadedUserPreferences = { 
            ...initialUserPreferences, 
            ...(parsedData.userPreferences || {}), 
            notificationPreferences: {...initialUserPreferences.notificationPreferences,...(parsedData.userPreferences?.notificationPreferences || {}),}, 
            aiWriterPreferences: {...initialUserPreferences.aiWriterPreferences,...(parsedData.userPreferences?.aiWriterPreferences || {}),},
            selectedFontFamily: parsedData.userPreferences?.selectedFontFamily || initialUserPreferences.selectedFontFamily
          };
          setUserPreferences(loadedUserPreferences);
          
          const lastActiveProjectId = localStorage.getItem('ashvalLastActiveProjectId');
          if (lastActiveProjectId && (parsedData.projects || []).some(p => p.id === lastActiveProjectId)) {
            setActiveProjectIdStateHook(lastActiveProjectId);
          }

        } else {
          setPomodoroTimeLeft(initialPomodoroConfig.work * 60); setTempPomodoroConfig(initialPomodoroConfig); setUserPreferences(initialUserPreferences); 
        }
      } catch (e) {
        console.error("Could not load data from localStorage:", e);
        setNotes([]); setTasks([]); setLoreEntries([]); setProjects([]); setPlotOutlines([]);
        setActiveThemeKey(initialActiveThemeKey); setPomodoroConfig(initialPomodoroConfig); setTempPomodoroConfig(initialPomodoroConfig);
        setPomodoroTimeLeft(initialPomodoroConfig.work * 60); setUserPreferences(initialUserPreferences);
      }
      try {
        const storedWords = localStorage.getItem('smartNotesLearnedWordsAi');
        if (storedWords) setLearnedWordsAi(new Set(JSON.parse(storedWords)));
      } catch(e) { setLearnedWordsAi(new Set()); }
      setIsInitialLoadComplete(true);
    };
    loadInitialData();
  }, []);
  
 useEffect(() => {
    if (!isInitialLoadComplete) return; 
    try {
      const appData: AppDataType = { notes, tasks, loreEntries, projects, plotOutlines, activeTheme: activeThemeKey, pomodoroConfig, userPreferences };
      localStorage.setItem('smartNotesAppData', JSON.stringify(appData));
      saveAppDataToServer(appData); 
    } catch (e) { console.error("Failed to save data to localStorage:", e); }
  }, [notes, tasks, loreEntries, projects, plotOutlines, activeThemeKey, pomodoroConfig, userPreferences, isInitialLoadComplete]); 

  useEffect(() => {
    if (!isInitialLoadComplete) return;
    try { localStorage.setItem('smartNotesLearnedWordsAi', JSON.stringify(Array.from(learnedWordsAi))); } 
    catch (e) { console.error("Failed to save learned words:", e); }
  }, [learnedWordsAi, isInitialLoadComplete]);

  useEffect(() => {
    if (!isInitialLoadComplete || activeProjectId === undefined) return; 
    if (activeProjectId === null) {
        localStorage.removeItem('ashvalLastActiveProjectId');
    } else {
        localStorage.setItem('ashvalLastActiveProjectId', activeProjectId);
    }
  }, [activeProjectId, isInitialLoadComplete]);
  
  useEffect(() => { setInputCharCountAi(plainTextCharCount(String(inputPromptAi || ''))); }, [inputPromptAi]);
  useEffect(() => { setResponseCharCountAi(plainTextCharCount(String(aiResponse || ''))); }, [aiResponse]);

  useEffect(() => {
    const htmlElement = document.documentElement;
    const currentThemeObject = themes[activeThemeKey] || themes.inkweaverDark;
    // Add 'dark' class for all themes except 'classicLight'
    if (activeThemeKey !== 'classicLight') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
    document.body.className = currentThemeObject.bg; 
    
    const selectedFont = FONT_FAMILIES.find(f => f.value === userPreferences.selectedFontFamily) || FONT_FAMILIES[0];
    document.body.style.fontFamily = selectedFont.css;
    
    const headerHeight = document.querySelector('header')?.offsetHeight || 68; 
    htmlElement.style.setProperty('--header-height', `${headerHeight}px`);
  }, [activeThemeKey, userPreferences.selectedFontFamily]);

  useEffect(() => { 
    const projectLore = loreEntries.filter(l => !activeProjectId || l.projectId === activeProjectId || l.projectId === null);
    const newNodes: GraphNode[] = projectLore.map((lore, index) => ({
      id: lore.id, label: lore.title, type: lore.type,
      x: (lore.id.charCodeAt(0) * 13 + lore.id.length * 7) % 700 + 50 + (index % 7) * 20, 
      y: (lore.id.charCodeAt(1) * 17 + lore.id.length * 5) % 500 + 50 + Math.floor(index / 7) * 20,
      rawEntity: lore,
    }));
    setGraphNodes(newNodes);
    const characterLore = projectLore.filter(l => l.type === 'Character');
    const newEdges: GraphEdge[] = [];
    characterLore.forEach(char => {
        if (char.relationships) {
        char.relationships.forEach(rel => {
            if (projectLore.some(targetChar => targetChar.id === rel.targetCharacterId)) {
            newEdges.push({ id: `${char.id}-${rel.targetCharacterId}-${String(rel.relationshipType)}`, source: char.id, target: rel.targetCharacterId, label: String(rel.relationshipType) });
            }
        }); }
    });
    setGraphEdges(newEdges);
  }, [loreEntries, activeProjectId]);

  const handleOpenAddNoteModal = () => { setCurrentNoteData({ title: '', icon: '', content: '', rawMarkdownContent: '', category: 'ทั่วไป', tags: [], projectId: activeProjectId }); setEditingNoteId(null); setShowNoteModal(true); };
  const handleEditNoteModalOpen = (note: AppNote) => { setCurrentNoteData({ title: note.title, icon: note.icon, content: note.content, rawMarkdownContent: note.rawMarkdownContent, category: note.category, tags: note.tags, projectId: note.projectId, }); setEditingNoteId(note.id); setShowNoteModal(true); setShowViewNoteModal(false); };
  const handleSaveNote = () => { 
    if (!currentNoteData.title.trim()) { alert('กรุณากรอกชื่อโน้ต'); return; }
    const finalProjectId = currentNoteData.projectId === "" ? null : currentNoteData.projectId;
    const newRawMarkdownContent = currentNoteData.rawMarkdownContent || '';
    const newHtmlContent = window.marked ? window.marked.parse(newRawMarkdownContent) : newRawMarkdownContent;
    let newNote: AppNote;
    if (editingNoteId !== null) {
      const originalNote = notes.find(n => n.id === editingNoteId); if (!originalNote) return;
      const newVersion: NoteVersion = { timestamp: new Date().toISOString(), content: originalNote.content, rawMarkdownContent: originalNote.rawMarkdownContent, };
      const updatedVersions = [...(originalNote.versions || []), newVersion].slice(-10);
      newNote = { ...originalNote, ...currentNoteData, id: editingNoteId, projectId: finalProjectId, rawMarkdownContent: newRawMarkdownContent, content: newHtmlContent, updatedAt: new Date().toISOString(), versions: updatedVersions, };
      setNotes(notes.map(note => (note.id === editingNoteId ? newNote : note)).sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()));
    } else {
      const noteId = Date.now();
      newNote = { ...currentNoteData, id: noteId, projectId: finalProjectId, rawMarkdownContent: newRawMarkdownContent, content: newHtmlContent, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), versions: [], };
      setNotes([newNote, ...notes].sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()));
    }
    setShowNoteModal(false); setEditingNoteId(null); setCurrentNoteData({ title: '', icon: '', content: '', rawMarkdownContent: '', category: 'ทั่วไป', tags: [], projectId: activeProjectId });
  };
  const handleDeleteNote = (id: number) => { if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบโน้ตนี้?')) { setNotes(notes.filter(note => note.id !== id)); } };
  const handleViewNote = (note: AppNote) => { setNoteToView(note); setShowViewNoteModal(true); };
  const handleAnalyzeNoteWithAi = (noteToAnalyze: AppNote) => { setInputPromptAi(noteToAnalyze.rawMarkdownContent || noteToAnalyze.content); setOperationModeAi(OPERATION_MODES.find(m => m.value === 'scene-analysis')?.value || OPERATION_MODES[0].value); };
  const handleRevertNoteVersion = (noteId: number, versionTimestamp: string) => { 
    const noteToRevert = notes.find(n => n.id === noteId); if (!noteToRevert || !noteToRevert.versions) return;
    const versionToRestore = noteToRevert.versions.find(v => v.timestamp === versionTimestamp); if (!versionToRestore) return;
    const currentAsNewVersion: NoteVersion = { timestamp: new Date().toISOString(), content: noteToRevert.content, rawMarkdownContent: noteToRevert.rawMarkdownContent, };
    const updatedVersions = [...(noteToRevert.versions || []), currentAsNewVersion].slice(-10);
    const revertedNote: AppNote = { ...noteToRevert, content: versionToRestore.content, rawMarkdownContent: versionToRestore.rawMarkdownContent, updatedAt: new Date().toISOString(), versions: updatedVersions, };
    setNotes(notes.map(n => n.id === noteId ? revertedNote : n)); setNoteToView(revertedNote);
  };
  const handleExportNoteMd = (note: AppNote) => { 
    const filename = `${note.title.replace(/[^\w\s]/gi, '_') || 'note'}.md`; const contentToExport = note.rawMarkdownContent || note.content;
    const blob = new Blob([contentToExport], { type: 'text/markdown;charset=utf-8' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };
  const handleOpenAddTaskModal = () => { setCurrentTaskData({ title: '', icon: '', priority: 'medium', dueDate: '', category: 'ทั่วไป', projectId: activeProjectId }); setShowTaskModal(true); };
  const handleSaveTask = () => { 
    if (!currentTaskData.title.trim()) { alert('กรุณากรอกชื่องาน'); return; }
    const finalProjectId = currentTaskData.projectId === "" ? null : currentTaskData.projectId;
    const newTask: AppTask = { ...currentTaskData, id: Date.now(), completed: false, subtasks: [], createdAt: new Date().toISOString(), projectId: finalProjectId, };
    setTasks([newTask, ...tasks].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setShowTaskModal(false); setCurrentTaskData({ title: '', icon: '', priority: 'medium', dueDate: '', category: 'ทั่วไป', projectId: activeProjectId });
  };
  const handleToggleTask = (id: number) => { setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task)); };
  const handleDeleteTask = (id: number) => { if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบงานนี้?')) { setTasks(tasks.filter(task => task.id !== id)); } };
  const handleToggleSubtask = (taskId: number, subtaskId: string) => { setTasks(tasks.map(task => task.id === taskId ? { ...task, subtasks: task.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st) } : task )); };
  const getPriorityColor = (priority: string): string => { 
    const current = themes[activeThemeKey] || themes.inkweaverDark;
    const isDark = activeThemeKey !== 'classicLight';
    switch (priority?.toLowerCase()) {
      case 'high': return isDark ? 'text-red-400' : 'text-red-600'; case 'medium': return isDark ? 'text-yellow-400' : 'text-yellow-500';
      case 'low': return isDark ? 'text-green-400' : 'text-green-600'; default: return current.textSecondary;
    }
  };
  const handleAddSuggestedSubtasks = (selectedTitles: string[]) => { 
    if (!taskForSubtaskGeneration) return;
    const newSubtasks: AppSubtask[] = selectedTitles.map(title => ({ id: Date.now().toString() + Math.random().toString(36).substring(2, 9), title: title, completed: false, }));
    setTasks(prevTasks => prevTasks.map(task => task.id === taskForSubtaskGeneration.id ? { ...task, subtasks: [...task.subtasks, ...newSubtasks] } : task ));
    setShowAiSubtaskModal(false); setTaskForSubtaskGeneration(null);
  };
  const handleAiDecomposeTaskRequest = async (task: AppTask) => { 
    setTaskForSubtaskGeneration(task); setShowAiSubtaskModal(true); setIsGeneratingSubtasks(true); setSubtaskGenerationError(null); setAiSuggestedSubtasks([]);
    try {
      const suggestions = await generateSubtasksForTask(task.title, task.category); setAiSuggestedSubtasks(suggestions);
      if (suggestions.length === 0 && !isInitialLoadComplete) {} else if (suggestions.length === 0) { setSubtaskGenerationError("AI ไม่ได้ให้คำแนะนำงานย่อย หรือไม่สามารถสร้างได้");}
    } catch (error: any) { setSubtaskGenerationError(`เกิดข้อผิดพลาดในการสร้างงานย่อย: ${error.message}`); } 
    finally { setIsGeneratingSubtasks(false); }
  };
  const handleSubmitAiWriter = async () => { 
    if (!inputPromptAi.trim()) { setErrorAi("กรุณาป้อนคำสั่งสำหรับ AI"); return; }
    if (inputCharCountAi > AI_MAX_INPUT_CHARS) { setErrorAi(`คำสั่งยาวเกินไป (${inputCharCountAi}/${AI_MAX_INPUT_CHARS} ตัวอักษร)`); return; }
    setIsLoadingAi(true); setErrorAi(null); setAiResponse(PROCESSING_AI_RESPONSE_MESSAGE);
    const currentOperation = OPERATION_MODES.find(op => op.value === operationModeAi); if (!currentOperation) { setErrorAi("ไม่พบโหมดการทำงานของ AI"); setIsLoadingAi(false); return; }
    let systemInstructionToUse = operationModeAi === 'custom' ? (customSystemInstructionAi || defaultCustomModeSIAi) : currentOperation.systemInstruction;
    let projectContextData: any = {};
    const activeProjectNotesContext = notes.filter(n => !activeProjectId || n.projectId === activeProjectId || n.projectId === null);
    const activeProjectLoreContext = loreEntries.filter(l => !activeProjectId || l.projectId === activeProjectId || l.projectId === null);
    if (['lore-consistency-check'].includes(operationModeAi)) { projectContextData.projectLore = activeProjectLoreContext; }
    const contextNotes = activeProjectNotesContext.slice(0, MAX_PROJECT_NOTES_IN_CONTEXT).map(n => `โน้ต "${n.title}": ${(n.rawMarkdownContent || n.content).substring(0, PROJECT_CONTEXT_MAX_NOTE_CHARS)}...`).join('\n');
    const contextLore = activeProjectLoreContext.slice(0, MAX_PROJECT_LORE_IN_CONTEXT).map(l => `ข้อมูลโลก "${l.title}" (ประเภท: ${l.type}): ${l.content.substring(0, PROJECT_CONTEXT_MAX_LORE_CHARS)}...`).join('\n');
    let projectContextString = ''; if (contextNotes || contextLore) { projectContextString = "\n\n## ข้อมูลโปรเจกต์ (Project Context):\n"; const currentProjectObj = activeProjectId ? projects.find(p=>p.id === activeProjectId) : null; if (currentProjectObj) { projectContextString += `ชื่อโปรเจกต์: ${currentProjectObj.name}\n`; } if(contextNotes) projectContextString += contextNotes + "\n"; if(contextLore) projectContextString += contextLore + "\n"; }
    const userPromptFormatted = currentOperation.userPromptFormatter(inputPromptAi, projectContextData) + projectContextString;
    try {
      const responseText = await generateAiContent(systemInstructionToUse, userPromptFormatted, chatHistoryAi); setAiResponse(responseText); 
      if (chatHistoryAi.length < MAX_CHAT_EXCHANGES * 2) { setChatHistoryAi(prev => [...prev, { role: 'user', text: inputPromptAi }, { role: 'model', text: responseText }]); } else { setChatHistoryAi([{ role: 'user', text: inputPromptAi }, { role: 'model', text: responseText }]); }
      const words = inputPromptAi.toLowerCase().replace(/[^\w\sà-ฮçığüşö]/gi, '').split(/\s+/); const newLearned = new Set(learnedWordsAi); words.forEach(word => { if (word.length >= MIN_LEARNED_WORD_LENGTH && isNaN(Number(word))) newLearned.add(word); }); setLearnedWordsAi(newLearned);
    } catch (error: any) { const errorMessage = error.message || "เกิดข้อผิดพลาดในการสื่อสารกับ AI"; setAiResponse(`<p class="text-red-400 font-semibold">AI Error: ${errorMessage}</p>`); setErrorAi(errorMessage); } 
    finally { setIsLoadingAi(false); }
  };
  const handleSaveAiWriterResponseAsNote = () => { 
    if (!aiResponseRef.current || aiResponse === INITIAL_AI_RESPONSE_MESSAGE || aiResponse === PROCESSING_AI_RESPONSE_MESSAGE || errorAi || aiResponse.includes("AI Error:") || aiResponse.includes("AI ไม่ได้ส่งข้อความตอบกลับ")) {
        alert('ไม่มีผลลัพธ์ AI ที่ถูกต้องสำหรับบันทึก');
        return;
    }

    // Get the raw response from the state, not the rendered HTML from the ref
    let fullAiText = aiResponse; 
    let proseToSave = fullAiText;
    let yamlToSave: string | null = null;

    const yamlRegex = /```yaml\n([\s\S]*?)\n```|---\n([\s\S]*?)\n---/;
    const yamlBlockMatch = fullAiText.match(yamlRegex);

    if (yamlBlockMatch) {
        yamlToSave = (yamlBlockMatch[1] || yamlBlockMatch[2]).trim();
        proseToSave = fullAiText.replace(yamlBlockMatch[0], '').trim();
    }
    
    let contentToSave = proseToSave;
    if (yamlToSave) {
        contentToSave = `---\n${yamlToSave}\n---\n\n${proseToSave}`;
    }

    const currentOperationLabel = OPERATION_MODES.find(m => m.value === operationModeAi)?.label || operationModeAi;
    const titleSuggestion = `AI: ${currentOperationLabel} - ${inputPromptAi.substring(0, 30)}...`;
    const newNote: AppNote = {
        id: Date.now(),
        title: titleSuggestion,
        icon: '🤖',
        rawMarkdownContent: contentToSave,
        content: window.marked ? window.marked.parse(contentToSave) : contentToSave,
        category: 'ai generated',
        tags: ['ai', operationModeAi.replace(/-/g, ' ')],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        projectId: activeProjectId,
        versions: [],
    };
    setNotes(prev => [newNote, ...prev].sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()));
    alert(`บันทึกโน้ตใหม่ชื่อ "${titleSuggestion}" แล้ว`);
  };
  const handleAutoCreateLoreEntriesFromAiWriter = (entriesToCreate: Array<{ title: string; type: LoreEntry['type']; }>) => { 
    const newLoreEntries: LoreEntry[] = entriesToCreate.filter(item => !loreEntries.some(existing => existing.title.toLowerCase() === item.title.toLowerCase() && existing.projectId === activeProjectId)).map(item => ({ id: Date.now().toString() + Math.random().toString(36).substring(2,9), title: item.title, type: item.type, content: `สร้างอัตโนมัติจาก AI Writer เมื่อ ${new Date().toLocaleDateString('th-TH')}`, tags: ['ai-generated', item.type.toLowerCase()], createdAt: new Date().toISOString(), projectId: activeProjectId, customFields: {}, }));
    if (newLoreEntries.length > 0) { setLoreEntries(prev => [...prev, ...newLoreEntries].sort((a,b) => a.title.localeCompare(b.title, 'th'))); alert(`สร้างข้อมูลโลกใหม่ ${newLoreEntries.length} รายการ`); }
  };
  const handleAppendAiResponseToNoteInView = (noteId: number, responseText: string) => { 
    const noteToUpdate = notes.find(n => n.id === noteId); if (!noteToUpdate) return;
    const newVersion: NoteVersion = { timestamp: new Date().toISOString(), content: noteToUpdate.content, rawMarkdownContent: noteToUpdate.rawMarkdownContent, };
    const updatedVersions = [...(noteToUpdate.versions || []), newVersion].slice(-10);
    const updatedRawMarkdown = `${noteToUpdate.rawMarkdownContent}\n\n---\n*AI Response (appended ${new Date().toLocaleString('th-TH')}):*\n${responseText}`; const updatedHtmlContent = window.marked ? window.marked.parse(updatedRawMarkdown) : updatedRawMarkdown;
    const updatedNote: AppNote = { ...noteToUpdate, rawMarkdownContent: updatedRawMarkdown, content: updatedHtmlContent, updatedAt: new Date().toISOString(), versions: updatedVersions, };
    setNotes(prevNotes => prevNotes.map(n => (n.id === noteId ? updatedNote : n)).sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())); setNoteToView(updatedNote);
  };
  const handleSaveAiResponseAsNewNoteFromView = (titleSuggestion: string, contentToSave: string, originalOperationMode: string) => { 
    const newNote: AppNote = { id: Date.now(), title: titleSuggestion, icon: '🤖', rawMarkdownContent: contentToSave, content: window.marked ? window.marked.parse(contentToSave) : contentToSave, category: 'ai generated', tags: ['ai', originalOperationMode.replace(/-/g,' ')], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), projectId: activeProjectId, versions: [], };
    setNotes(prevNotes => [newNote, ...prevNotes].sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())); setShowViewNoteModal(false);  alert(`บันทึกโน้ตใหม่ชื่อ "${titleSuggestion}" จาก AI แล้ว`);
  };
  const handlePomodoroStartPause = useCallback(() => { setPomodoroIsActive(prev => !prev); }, []);
  const handleResetCurrentPomodoro = useCallback(() => { setPomodoroIsActive(false); if (pomodoroIntervalRef.current) clearInterval(pomodoroIntervalRef.current); if (pomodoroCurrentMode === 'work') setPomodoroTimeLeft(pomodoroConfig.work * 60); else if (pomodoroCurrentMode === 'shortBreak') setPomodoroTimeLeft(pomodoroConfig.shortBreak * 60); else setPomodoroTimeLeft(pomodoroConfig.longBreak * 60); }, [pomodoroConfig, pomodoroCurrentMode]);
  const handleSkipPomodoro = useCallback(() => { 
    setPomodoroIsActive(false); if (pomodoroIntervalRef.current) clearInterval(pomodoroIntervalRef.current);
    if (pomodoroCurrentMode === 'work') { if (pomodoroCurrentRound % pomodoroConfig.rounds === 0) { setPomodoroCurrentMode('longBreak'); setPomodoroTimeLeft(pomodoroConfig.longBreak * 60); } else { setPomodoroCurrentMode('shortBreak'); setPomodoroTimeLeft(pomodoroConfig.shortBreak * 60); } } 
    else { setPomodoroCurrentMode('work'); setPomodoroTimeLeft(pomodoroConfig.work * 60); if (pomodoroCurrentMode === 'longBreak') { setPomodoroCurrentRound(1); } else if (pomodoroCurrentMode === 'shortBreak' && pomodoroCurrentRound < pomodoroConfig.rounds) { setPomodoroCurrentRound(prev => prev + 1); } else if (pomodoroCurrentMode === 'shortBreak' && pomodoroCurrentRound >= pomodoroConfig.rounds) { setPomodoroCurrentRound(1); }}
  }, [pomodoroConfig, pomodoroCurrentMode, pomodoroCurrentRound]);
  const handlePomodoroConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => { const { name, value } = e.target; setTempPomodoroConfig(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 })); };
  const handleSavePomodoroConfig = () => { setPomodoroConfig(tempPomodoroConfig); if (!pomodoroIsActive) { handleResetCurrentPomodoro(); } alert('บันทึกการตั้งค่า Pomodoro แล้ว'); };
  useEffect(() => { 
    if (pomodoroIsActive) {
      pomodoroIntervalRef.current = window.setInterval(() => {
        setPomodoroTimeLeft(prevTime => {
          if (prevTime <= 1) { handleSkipPomodoro(); if (userPreferences.notificationPreferences.taskReminders && Notification.permission === "granted") { new Notification("Pomodoro Timer", { body: `สิ้นสุดรอบ ${pomodoroCurrentMode === 'work' ? 'ทำงาน' : pomodoroCurrentMode === 'shortBreak' ? 'พักสั้น' : 'พักยาว'}! เริ่มรอบต่อไปแล้ว`, icon: '/favicon.ico' });} return 0; }
          return prevTime - 1;
        });
      }, 1000);
    } else { if (pomodoroIntervalRef.current) clearInterval(pomodoroIntervalRef.current); }
    return () => { if (pomodoroIntervalRef.current) clearInterval(pomodoroIntervalRef.current); };
  }, [pomodoroIsActive, handleSkipPomodoro, pomodoroCurrentMode, userPreferences.notificationPreferences.taskReminders]);
  
  const createProjectHandler = (projectName: string): string => { 
    const newProject: Project = { id: Date.now().toString(), name: projectName, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setProjects(prev => [...prev, newProject]); 
    setActiveProjectIdStateHook(newProject.id);
    return newProject.id; 
  };

  const handleUpdateProjectDetails = (projectId: string, details: Partial<Pick<Project, 'name' | 'genre' | 'description'>>) => { 
    setProjects(prev => prev.map(p => p.id === projectId ? {...p, ...details, updatedAt: new Date().toISOString()} : p)); 
  };

  const appProps = {
    notes, tasks, loreEntries, projects, plotOutlines, activeProjectId,
    currentTheme: themes[activeThemeKey], themes, appVersion,
    pomodoroConfig, pomodoroTempConfig: tempPomodoroConfig, pomodoroCurrentMode, pomodoroTimeLeft, pomodoroIsActive, pomodoroCurrentRound,
    showAiWriterSection, operationModeAi, customSystemInstructionAi, inputPromptAi, aiResponse, isLoadingAi, errorAi,
    inputCharCountAi, responseCharCountAi, defaultCustomModeSIAi, learnedWordsAi, userPreferences,
    graphNodes, graphEdges,
    setActiveTheme: setActiveThemeKey,
    setActiveProjectIdState: setActiveProjectIdStateHook, 
    createProjectHandler,
    handleOpenAddNoteModal, handleViewNote, handleDeleteNote, handleAnalyzeNoteWithAi,
    handleOpenAddTaskModal, handleToggleTask, handleDeleteTask, handleToggleSubtask, handleAiDecomposeTaskRequest,
    setLoreEntries, setPlotOutlines,
    setOperationModeAi, setCustomSystemInstructionAi, setInputPromptAi, clearInputPromptAi: () => setInputPromptAi(''), 
    handleSubmitAiWriter, handleSaveAiWriterResponseAsNote, aiResponseRef, handleAutoCreateLoreEntriesFromAiWriter,
    handlePomodoroStartPause, 
    handlePomodoroResetCurrent: handleResetCurrentPomodoro, 
    handlePomodoroSkip: handleSkipPomodoro, 
    handlePomodoroConfigChange, 
    handlePomodoroSaveConfig: handleSavePomodoroConfig,
    formatPomodoroTime,
    setLearnedWordsAi, setUserPreferences, handleUpdateProjectDetails,
    getCategoryIcon, getPriorityColor, mainNavItems: mainNavItemsList,
    isMobileMenuOpen, setIsMobileMenuOpen,
  };

  return ( 
    <Router>
      <App {...appProps} />
      {showNoteModal && (
        <NoteModal
          showModal={showNoteModal} isEditing={!!editingNoteId} editingNoteId={editingNoteId} noteData={currentNoteData}
          onNoteDataChange={(field, value) => {
            if (field === 'tagsString' && typeof value === 'string') { setCurrentNoteData(prev => ({ ...prev, tags: value.split(',').map(tag => tag.trim()).filter(tag => tag) })); } 
            else if (field === 'projectId') { setCurrentNoteData(prev => ({ ...prev, projectId: value as string | null})); } 
            else if (field === 'rawMarkdownContent' && typeof value === 'string') { setCurrentNoteData(prev => ({...prev, rawMarkdownContent: value })); }
            else { setCurrentNoteData(prev => ({ ...prev, [field as keyof AppNote]: value })); }
          }}
          onSave={handleSaveNote}
          onCancel={() => { setShowNoteModal(false); setEditingNoteId(null); setCurrentNoteData({ title: '', icon: '', content: '', rawMarkdownContent: '', category: 'ทั่วไป', tags: [], projectId: activeProjectId });}}
          currentTheme={themes[activeThemeKey]}
          projects={projects} activeProjectId={activeProjectId}
          operationModes={OPERATION_MODES} allNotes={notes} allLoreEntries={loreEntries} allProjects={projects}
        />
      )}
      {showTaskModal && (
        <TaskModal
          showModal={showTaskModal} taskData={currentTaskData}
          onTaskDataChange={(field, value) => setCurrentTaskData(prev => ({ ...prev, [field]: value }))}
          onSave={handleSaveTask} onCancel={() => setShowTaskModal(false)} currentTheme={themes[activeThemeKey]}
        />
      )}
      {showViewNoteModal && noteToView && (
        <ViewNoteModal
          showModal={showViewNoteModal} noteToView={noteToView}
          onClose={() => setShowViewNoteModal(false)} onEdit={handleEditNoteModalOpen}
          onExportMd={handleExportNoteMd} onRevertVersion={handleRevertNoteVersion}
          getCategoryIcon={getCategoryIcon} currentTheme={themes[activeThemeKey]}
          projectName={noteToView.projectId ? projects.find(p => p.id === noteToView.projectId)?.name : undefined}
          onTriggerAiAnalysis={() => {}} 
          operationModes={OPERATION_MODES} 
          allNotes={notes} 
          allLoreEntries={loreEntries} 
          activeProjectId={activeProjectId} 
          allProjects={projects}
          onAppendAiResponseToNote={handleAppendAiResponseToNoteInView}
          onSaveAiResponseAsNewNote={handleSaveAiResponseAsNewNoteFromView}
        />
      )}
      {showAiSubtaskModal && taskForSubtaskGeneration && (
          <AiSubtaskSuggestionModal
              show={showAiSubtaskModal} taskTitle={taskForSubtaskGeneration.title}
              suggestedSubtasks={aiSuggestedSubtasks} isLoadingSuggestions={isGeneratingSubtasks}
              errorSubtaskGeneration={subtaskGenerationError} currentTheme={themes[activeThemeKey]}
              onClose={() => setShowAiSubtaskModal(false)} onAddSubtasks={handleAddSuggestedSubtasks}
          />
      )}
      <QuickActionsBar
          currentTheme={themes[activeThemeKey]}
          onAddNote={handleOpenAddNoteModal}
      />
    </Router>
  );
};