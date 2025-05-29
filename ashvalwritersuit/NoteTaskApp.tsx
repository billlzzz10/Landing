

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'; // Added useNavigate
import { Plus, Search, LayoutDashboard, Edit3, Check, Settings, BookOpen, Palette, Moon, Sun, Zap, Heart, Send, Copy, XCircle, ChevronDown, ChevronUp, MessageSquare, Brain, Eye, Play, Pause, RotateCcw, SkipForward, Save, ListFilter, FileText, AlertTriangle, UploadCloud, GitFork, Info, Drama, FileSignature, Tag, Calendar, MapPin, Gift, Cpu, CalendarDays, BookText, Repeat, Package, Layers, Users, Aperture, Clock, Archive, Trash2, LayoutList, GitBranch as PlotIcon, GitMerge, Download, Home, FileArchive, UserCog, StickyNote, Menu as MenuIcon, SlidersHorizontal, FileInput, BarChart3, ActivityIcon } from 'lucide-react'; 

import { OPERATION_MODES, INITIAL_AI_RESPONSE_MESSAGE, PROCESSING_AI_RESPONSE_MESSAGE, AI_MAX_INPUT_CHARS, MAX_CHAT_EXCHANGES, PROJECT_CONTEXT_MAX_NOTE_CHARS, PROJECT_CONTEXT_MAX_LORE_CHARS, MAX_PROJECT_NOTES_IN_CONTEXT, MAX_PROJECT_LORE_IN_CONTEXT, MODEL_NAME as DEFAULT_MODEL_NAME, AVAILABLE_AI_MODELS, NOTE_TEMPLATES as SYSTEM_NOTE_TEMPLATES, EXPORT_TEMPLATES } from './constants'; 
import { AppNote, AppTask, AppSubtask, OperationMode, ChatTurn, PomodoroConfig, LoreEntry, NoteVersion, UserPreferences, NotificationPreferences, AiWriterPreferences, Project, UserNoteTemplate, NoteTemplate, PlotOutlineNode, NoteLink, AppTheme, ExportTemplate } from './types';
import { generateAiContentStream, generateSubtasksForTask } from './frontend/src/services/geminiService';
import { fetchAppDataFromServer, saveAppDataToServer, AppDataType } from './frontend/src/services/appDataService'; 

import Header from './Header';
import Sidebar, { NavItem } from './Sidebar';
import NoteModal from './NoteModal';
import TaskModal from './TaskModal';
import ViewNoteModal from './ViewNoteModal';
import AiWriter from './AiWriter';
import PomodoroTimer from './PomodoroTimer';
import NoteItem from './NoteItem';
import TaskList from './TaskList'; 
import TaskItem from './TaskItem'; 
import CategoryFilterControl from './CategoryFilterControl';
import AiSubtaskSuggestionModal from './AiSubtaskSuggestionModal';
import ProjectDashboard from './ProjectDashboard'; 
import WorldAnvilManager from './WorldAnvilManager'; 
import AppSettingsPage from './AppSettingsPage'; 
import DictionaryManager from './DictionaryManager'; 
import EmojiPicker from './EmojiPicker'; 
// ProjectSelector is now used within Header
import UserTemplateManager from './UserTemplateManager';
import PlotOutlineManager from './PlotOutlineManager';
import GraphView from './GraphView';
import ExportPage from './ExportPage';
import UtilitiesPage from './UtilitiesPage'; // Added UtilitiesPage
import AshvalMascot from './AshvalMascot'; // Added AshvalMascot
import BottomNavBar from './BottomNavBar'; // Added BottomNavBar
import ContentAnalytics from './ContentAnalytics'; // Added ContentAnalytics


const MIN_LEARNED_WORD_LENGTH = 3;
const STREAM_ERROR_MARKER = "[[STREAM_ERROR]]"; 

const plainTextCharCount = (text: string): number => {
  if (!text) return 0; 
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = text; 
  const plainText = tempDiv.textContent || tempDiv.innerText || "";
  return plainText.length; 
};

const parseNoteLinks = (content: string): NoteLink[] => {
  const links: NoteLink[] = [];
  const regex = /\[\[(.*?)\]\]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const fullMatch = match[1];
    const pipeIndex = fullMatch.indexOf('|');
    const targetTitle = pipeIndex !== -1 ? fullMatch.substring(0, pipeIndex).trim() : fullMatch.trim();
    if (targetTitle) {
        links.push({ targetTitle });
    }
  }
  return links;
};

const parseInputForContext = (text: string): Record<string, any> => {
    const lines = text.split('\n');
    const context: Record<string, any> = {};
    let tempCharacters: string[] = [];
    lines.forEach(line => {
        const titleMatch = line.match(/^#\s+(.*)/);
        if (titleMatch) context.title = titleMatch[1].trim();
        const sectionMatch = line.match(/^##\s+(.*)/);
        if (sectionMatch) {
            if (!context.sections) context.sections = [];
            context.sections.push(sectionMatch[1].trim());
        }
        const charMatch = line.match(/^- (?:Character|ตัวละคร|Char):\s*(.*)/i);
        if (charMatch) tempCharacters = tempCharacters.concat(charMatch[1].split(',').map(s => s.trim()).filter(s => s));
        const mentionMatches = line.matchAll(/@([\w\s-]+)(?=\s|\[\[|$)/g);
        for (const mentionMatch of mentionMatches) tempCharacters.push(mentionMatch[1].trim());
        const settingMatch = line.match(/^- (?:Setting|สถานที่|Location):\s*(.*)/i);
        if (settingMatch) context.setting = settingMatch[1].trim();
        const plotMatch = line.match(/^- (?:Plot Point|Plot|โครงเรื่องย่อย|โครงฉาก):\s*(.*)/i);
        if (plotMatch) {
            if (!context.plotPoints) context.plotPoints = [];
            context.plotPoints.push(plotMatch[1].trim());
        }
        const toneMatch = line.match(/^- (?:Tone|โทน|อารมณ์):\s*(.*)/i);
        if (toneMatch) context.tone = toneMatch[1].trim();
        const objectiveMatch = line.match(/^- (?:Objective|เป้าหมาย|จุดประสงค์):\s*(.*)/i);
        if (objectiveMatch) context.objective = objectiveMatch[1].trim();
    });
    if (tempCharacters.length > 0) context.characters = Array.from(new Set(tempCharacters.map(c => c.replace(/_/g, ' ')))).filter(c => c.length > 0 && c.trim() !== '');
    return context;
};

const formatParsedContextForPrompt = (parsedContext: Record<string, any>): string => {
    let contextString = "\n\n## ข้อมูลเพิ่มเติมจากคำสั่ง (Parsed Input Context):\n";
    let hasParsedContext = false;
    if (parsedContext.title) { contextString += `ชื่อเรื่อง/ฉากที่ระบุ: ${parsedContext.title}\n`; hasParsedContext = true; }
    if (parsedContext.sections && parsedContext.sections.length > 0) { contextString += `ส่วนย่อยที่ระบุ: ${parsedContext.sections.join(', ')}\n`; hasParsedContext = true; }
    if (parsedContext.characters && parsedContext.characters.length > 0) { contextString += `ตัวละครที่เกี่ยวข้อง: ${parsedContext.characters.join(', ')}\n`; hasParsedContext = true; }
    if (parsedContext.setting) { contextString += `สถานที่/ฉากหลัง: ${parsedContext.setting}\n`; hasParsedContext = true; }
    if (parsedContext.plotPoints && parsedContext.plotPoints.length > 0) { contextString += `ประเด็นสำคัญ/โครงเรื่องย่อย:\n${parsedContext.plotPoints.map((p: string) => `- ${p}`).join('\n')}\n`; hasParsedContext = true; }
    if (parsedContext.tone) { contextString += `โทน/อารมณ์ที่ต้องการ: ${parsedContext.tone}\n`; hasParsedContext = true; }
    if (parsedContext.objective) { contextString += `เป้าหมาย/จุดประสงค์ของคำสั่งนี้: ${parsedContext.objective}\n`; hasParsedContext = true; }
    return hasParsedContext ? contextString : "";
};

const initialPomodoroConfig: PomodoroConfig = { work: 25, shortBreak: 5, longBreak: 15, rounds: 4 };
const initialUserPreferences: UserPreferences = {
  notificationPreferences: { taskReminders: true, projectUpdates: false },
  aiWriterPreferences: { repetitionThreshold: 3, autoAddLoreFromAi: true, autoAnalyzeScenes: false, contextualAiMenuStyle: 'simple' },
  selectedFontFamily: "'Sarabun', sans-serif",
  customGeminiApiKey: undefined,
  selectedAiModel: DEFAULT_MODEL_NAME,
};
const initialActiveThemeKey = 'obsidianNight'; // Updated default theme

export const App: React.FC = () => {
  return (
    <Router>
      <NoteTaskAppWithRouter />
    </Router>
  );
}

const NoteTaskAppWithRouter = () => { 
  const navigate = useNavigate(); 
  const [activeThemeKey, setActiveThemeKey] = useState(initialActiveThemeKey);
  const [notes, setNotes] = useState<AppNote[]>([]);
  const [tasks, setTasks] = useState<AppTask[]>([]);
  const [loreEntries, setLoreEntries] = useState<LoreEntry[]>([]); 
  const [projects, setProjects] = useState<Project[]>([]); 
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null); 
  const [userTemplates, setUserTemplates] = useState<UserNoteTemplate[]>([]);
  const [plotOutlines, setPlotOutlines] = useState<PlotOutlineNode[]>([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [currentNoteData, setCurrentNoteData] = useState<Pick<AppNote, 'title' | 'icon' | 'coverImageUrl' | 'content' | 'category' | 'tags' | 'projectId'>>({ title: '', icon: '', coverImageUrl: '', content: '', category: 'general', tags: [], projectId: null });
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [currentTaskData, setCurrentTaskData] = useState<Pick<AppTask, 'title' | 'icon' | 'priority' | 'dueDate' | 'category' | 'projectId'>>({ title: '', icon: '', priority: 'medium', dueDate: '', category: 'general', projectId: null });
  const [showViewNoteModal, setShowViewNoteModal] = useState(false);
  const [noteToView, setNoteToView] = useState<AppNote | null>(null);
  const [showAiWriterSection, setShowAiWriterSection] = useState(true); 
  const [operationModeAi, setOperationModeAi] = useState<string>(OPERATION_MODES[0].value);
  const [customSystemInstructionAi, setCustomSystemInstructionAi] = useState<string>('');
  const [inputPromptAi, setInputPromptAi] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>(''); 
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
  const [activeNoteCategoryFilter, setActiveNoteCategoryFilter] = useState<string>('all');
  const [activeTaskCategoryFilter, setActiveTaskCategoryFilter] = useState<string>('all');
  const [noteSearchTerm, setNoteSearchTerm] = useState('');
  const [loreSearchTerm, setLoreSearchTerm] = useState('');
  const [pomodoroConfig, setPomodoroConfig] = useState<PomodoroConfig>(initialPomodoroConfig);
  const [pomodoroCurrentMode, setPomodoroCurrentMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [pomodoroTimeLeft, setPomodoroTimeLeft] = useState<number>(initialPomodoroConfig.work * 60);
  const [pomodoroIsActive, setPomodoroIsActive] = useState<boolean>(false);
  const [pomodoroCurrentRound, setPomodoroCurrentRound] = useState<number>(1);
  const pomodoroIntervalRef = useRef<number | null>(null);
  const [tempPomodoroConfig, setTempPomodoroConfig] = useState<PomodoroConfig>(initialPomodoroConfig);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(initialUserPreferences);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(''); 
  const [isImportingFile, setIsImportingFile] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const fuseNotesRef = useRef<any>(null); 
  const fuseLoreRef = useRef<any>(null); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 

  const handleToggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const handleNavigate = (path: string) => {
    navigate(path);
    if (isSidebarOpen) setIsSidebarOpen(false); 
  };


  useEffect(() => {
    const loadInitialData = async () => {
      if (window.pdfjsLib) {
        const pdfJsVersion = window.pdfjsLib.version || '3.11.174'; 
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfJsVersion}/pdf.worker.min.js`;
      }
      console.log("Attempting to load data from localStorage.");
      try {
        const storedAppData = localStorage.getItem('smartNotesAppData');
        if (storedAppData) {
          const parsedData = JSON.parse(storedAppData) as AppDataType;
          setNotes((parsedData.notes || []).map(normalizeNote));
          setTasks((parsedData.tasks || []).map(normalizeTask));
          setLoreEntries((parsedData.loreEntries || []).map(normalizeLoreEntry)); 
          setProjects((parsedData.projects || []).map(normalizeProject)); 
          setUserTemplates(parsedData.userTemplates || []);
          setPlotOutlines(parsedData.plotOutlines || []);
          setActiveThemeKey(parsedData.activeTheme || initialActiveThemeKey);
          const loadedPomodoro = parsedData.pomodoroConfig || initialPomodoroConfig;
          setPomodoroConfig(loadedPomodoro);
          setTempPomodoroConfig(loadedPomodoro); 
          setPomodoroTimeLeft(loadedPomodoro.work * 60); 
          const loadedPrefs = { ...initialUserPreferences, ...(parsedData.userPreferences || {}) };
          loadedPrefs.notificationPreferences = { ...initialUserPreferences.notificationPreferences, ...(parsedData.userPreferences?.notificationPreferences || {}) };
          loadedPrefs.aiWriterPreferences = { ...initialUserPreferences.aiWriterPreferences, ...(parsedData.userPreferences?.aiWriterPreferences || {}) };
          loadedPrefs.customGeminiApiKey = parsedData.userPreferences?.customGeminiApiKey || initialUserPreferences.customGeminiApiKey;
          loadedPrefs.selectedAiModel = parsedData.userPreferences?.selectedAiModel || initialUserPreferences.selectedAiModel;
          setUserPreferences(loadedPrefs);
          if (document.body && loadedPrefs.selectedFontFamily) document.body.style.fontFamily = loadedPrefs.selectedFontFamily;
          console.log("Data loaded from localStorage.");
        } else {
          console.log("No data in localStorage. Using initial defaults.");
          setPomodoroTimeLeft(initialPomodoroConfig.work * 60);
          setTempPomodoroConfig(initialPomodoroConfig);
          setUserPreferences(initialUserPreferences); 
          if (document.body && initialUserPreferences.selectedFontFamily) document.body.style.fontFamily = initialUserPreferences.selectedFontFamily;
        }
      } catch (e) {
        console.error("Could not load data from localStorage:", e);
        setNotes([]); setTasks([]); setLoreEntries([]); setProjects([]); setUserTemplates([]); setPlotOutlines([]);
        setActiveThemeKey(initialActiveThemeKey);
        setPomodoroConfig(initialPomodoroConfig); setTempPomodoroConfig(initialPomodoroConfig); setPomodoroTimeLeft(initialPomodoroConfig.work * 60);
        setUserPreferences(initialUserPreferences);
        if (document.body && initialUserPreferences.selectedFontFamily) document.body.style.fontFamily = initialUserPreferences.selectedFontFamily;
      }
      try {
        const storedWords = localStorage.getItem('smartNotesLearnedWordsAi');
        if (storedWords) {
          const parsed = JSON.parse(storedWords);
          if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
            setLearnedWordsAi(new Set(parsed as string[]));
          } else {
            console.warn("Corrupted learned words in localStorage. Resetting to empty Set.");
            setLearnedWordsAi(new Set());
          }
        }
      } catch(e) {
        console.error("Could not load or parse learned words from localStorage:", e);
        setLearnedWordsAi(new Set());
      }
      setIsInitialLoadComplete(true);
    };
    loadInitialData();
  }, []);
  
  const normalizeProject = (project: any): Project => ({ id: String(project.id || Date.now().toString()), name: String(project.name || 'Untitled Project'), genre: project.genre ? String(project.genre) : undefined, description: project.description ? String(project.description) : undefined, createdAt: String(project.createdAt || new Date().toISOString()), isArchived: typeof project.isArchived === 'boolean' ? project.isArchived : false, lastModified: project.lastModified || new Date().toISOString(), summary: project.summary || project.description?.substring(0,100) || '' });
  const normalizeLoreEntry = (entry: any): LoreEntry => ({ id: String(entry.id || Date.now().toString() + Math.random()), title: String(entry.title || 'Untitled Lore'), type: entry.type || 'Concept', content: String(entry.content || ''), tags: Array.isArray(entry.tags) ? entry.tags.map(String) : [], createdAt: String(entry.createdAt || new Date().toISOString()), projectId: entry.projectId || null, role: entry.role || undefined, characterArcana: Array.isArray(entry.characterArcana) ? entry.characterArcana.map(String) : [], relationships: Array.isArray(entry.relationships) ? entry.relationships.map((r: any) => ({ targetCharacterId: String(r.targetCharacterId || ''), targetCharacterName: r.targetCharacterName ? String(r.targetCharacterName) : undefined, relationshipType: String(r.relationshipType || ''), description: r.description ? String(r.description) : undefined })) : [], coverImageUrl: entry.coverImageUrl || undefined });
  const normalizeNote = (note: any): AppNote => ({ id: note.id || Date.now(), title: String(note.title || 'Untitled Note'), icon: note.icon || undefined, coverImageUrl: note.coverImageUrl || undefined, content: String(note.content || ''), category: String(note.category || 'general'), tags: Array.isArray(note.tags) ? note.tags.map(String) : [], createdAt: String(note.createdAt || new Date().toISOString()), updatedAt: note.updatedAt ? String(note.updatedAt) : new Date().toISOString(), versions: Array.isArray(note.versions) ? note.versions.map((v: any) => ({ timestamp: String(v.timestamp || new Date().toISOString()), content: String(v.content || '') })) : [], links: Array.isArray(note.links) ? note.links.map((l: any) => ({ targetTitle: String(l.targetTitle || '') })) : parseNoteLinks(String(note.content || '')), projectId: note.projectId || null });
  const normalizeTask = (task: any): AppTask => ({ id: task.id || Date.now(), title: String(task.title || 'Untitled Task'), icon: task.icon || undefined, completed: typeof task.completed === 'boolean' ? task.completed : false, priority: String(task.priority || 'medium'), dueDate: String(task.dueDate || ''), category: String(task.category || 'general'), subtasks: Array.isArray(task.subtasks) ? task.subtasks.map((st: any): AppSubtask => ({ id: String(st.id || Date.now().toString() + Math.random().toString(36).substring(2, 9)), title: String(st.title || 'Subtask'), completed: typeof st.completed === 'boolean' ? st.completed : false })) : [], createdAt: String(task.createdAt || new Date().toISOString()), projectId: task.projectId || null, description: task.description || undefined, htmlDescription: task.htmlDescription || undefined });

 useEffect(() => { if (!isInitialLoadComplete) return; try { const appData: AppDataType = { notes, tasks, loreEntries, projects, userTemplates, plotOutlines, activeTheme: activeThemeKey, pomodoroConfig, userPreferences }; localStorage.setItem('smartNotesAppData', JSON.stringify(appData)); console.log("App data saved to localStorage."); saveAppDataToServer(appData).then(success => { if (!success) console.warn("saveAppDataToServer (no-op) reported an issue."); }); } catch (e) { console.error("Failed to save data to localStorage:", e); } }, [notes, tasks, loreEntries, projects, userTemplates, plotOutlines, activeThemeKey, pomodoroConfig, userPreferences, isInitialLoadComplete]); 
 useEffect(() => { if (!isInitialLoadComplete) return; try { localStorage.setItem('smartNotesLearnedWordsAi', JSON.stringify(Array.from(learnedWordsAi))); console.log("Learned words saved to localStorage."); } catch (e) { console.error("Failed to save learned words to localStorage:", e); } }, [learnedWordsAi, isInitialLoadComplete]);
 useEffect(() => { setInputCharCountAi(plainTextCharCount(String(inputPromptAi || ''))); }, [inputPromptAi]);
 useEffect(() => { setResponseCharCountAi(plainTextCharCount(String(aiResponse || ''))); }, [aiResponse]);
 useEffect(() => { const htmlElement = document.documentElement; if (themes[activeThemeKey]?.name.toLowerCase().includes('dark') || themes[activeThemeKey]?.name.toLowerCase().includes('deep') || themes[activeThemeKey]?.name.toLowerCase().includes('night')) htmlElement.classList.add('dark'); else htmlElement.classList.remove('dark'); if (document.body && userPreferences.selectedFontFamily) document.body.style.fontFamily = userPreferences.selectedFontFamily; }, [activeThemeKey, userPreferences.selectedFontFamily]);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'แดชบอร์ด', icon: Home, path: '/', section: 'main' },
    { id: 'notes', label: 'โน้ตทั้งหมด', icon: StickyNote, path: '/notes', section: 'main' },
    { id: 'tasks', label: 'รายการงาน', icon: Check, path: '/tasks', section: 'main' },
    { id: 'plot-outline', label: 'โครงเรื่อง', icon: PlotIcon, path: '/plot', section: 'main' },
    { id: 'graph-view', label: 'Graph View', icon: GitMerge, path: '/graph', section: 'main' },
    
    { id: 'templates', label: 'แม่แบบ', icon: LayoutList, path: '/templates', section: 'tools' },
    { id: 'ai-writer', label: 'AI Writer', icon: Zap, path: '/ai', section: 'tools' },
    { id: 'world-anvil', label: 'คลังข้อมูลโลก', icon: BookOpen, path: '/lore', section: 'tools' },
    { id: 'pomodoro', label: 'Pomodoro', icon: Clock, path: '/pomodoro', section: 'tools' },
    { id: 'analytics', label: 'สถิติเนื้อหา', icon: BarChart3, path: '/analytics', section: 'tools' },
    { id: 'utilities', label: 'เครื่องมือเสริม', icon: SlidersHorizontal, path: '/utilities', section: 'tools'},
    { id: 'export', label: 'ส่งออก', icon: Download, path: '/export', section: 'tools' },
    { id: 'dictionary', label: 'พจนานุกรม', icon: BookText, path: '/dictionary', section: 'tools' },
    
    { id: 'settings', label: 'ตั้งค่า', icon: UserCog, path: '/settings', section: 'settings' },
  ];

  const getCategoryIcon = (category: string): JSX.Element => { const catLower = category.toLowerCase(); if (catLower.includes('writing')) return <Edit3 size={16} className="opacity-70" />; if (catLower.includes('plot')) return <GitFork size={16} className="opacity-70" />; if (catLower.includes('character')) return <Users size={16} className="opacity-70" />; if (catLower.includes('worldbuilding') || catLower.includes('place')) return <MapPin size={16} className="opacity-70" />; if (catLower.includes('research')) return <Info size={16} className="opacity-70" />; if (catLower.includes('discovery')) return <Search size={16} className="opacity-70" />; if (catLower.includes('design')) return <Palette size={16} className="opacity-70" />; if (catLower.includes('ideas')) return <Cpu size={16} className="opacity-70" />; if (catLower.includes('feedback')) return <MessageSquare size={16} className="opacity-70" />; if (catLower.includes('ai generated')) return <Zap size={16} className="opacity-70" />; if (catLower.includes('imported')) return <UploadCloud size={16} className="opacity-70" />; if (catLower.includes('general')) return <FileText size={16} className="opacity-70" />; if (catLower.includes('personal')) return <Heart size={16} className="opacity-70" />; if (catLower.includes('item')) return <Gift size={16} className="opacity-70" />; if (catLower.includes('concept')) return <Brain size={16} className="opacity-70" />; if (catLower.includes('event')) return <CalendarDays size={16} className="opacity-70" />; if (catLower.includes('arcanasystem')) return <Aperture size={16} className="opacity-70" />; if (catLower.includes('scene')) return <Drama size={16} className="opacity-70" />; if (catLower.includes('log')) return <BookText size={16} className="opacity-70" />; return <Tag size={16} className="opacity-70" />; };
  const getUniqueCategories = (items: Array<{ category: string }>): string[] => { const categories = new Set<string>(); items.forEach(item => categories.add(item.category)); return Array.from(categories).sort((a,b) => a.localeCompare(b)); };
  const getPriorityColorClass = (priority: string) => { switch (priority?.toLowerCase()) { case 'high': return themes[activeThemeKey]?.accentText || 'text-red-500'; case 'medium': return 'text-yellow-500'; case 'low': return 'text-green-500'; default: return themes[activeThemeKey]?.textSecondary || 'text-gray-500'; } };

  useEffect(() => { if (window.Fuse && notes.length > 0) { fuseNotesRef.current = new window.Fuse(notes, { keys: [{ name: 'title', weight: 0.4 }, { name: 'content', weight: 0.3, getFn: (note: AppNote) => plainTextCharCount(note.content) > 0 ? (document.createElement('div').innerHTML = note.content, document.createElement('div').textContent || document.createElement('div').innerText || "") : "" }, { name: 'tags', weight: 0.2 }, { name: 'category', weight: 0.1 }], includeScore: true, threshold: 0.4, minMatchCharLength: 2 }); } else { fuseNotesRef.current = null; } }, [notes]);
  useEffect(() => { if (window.Fuse && loreEntries.length > 0) { fuseLoreRef.current = new window.Fuse(loreEntries, { keys: [{ name: 'title', weight: 0.4 }, { name: 'content', weight: 0.3 }, { name: 'tags', weight: 0.15 }, { name: 'type', weight: 0.1 }, { name: 'role', weight: 0.05 }], includeScore: true, threshold: 0.4, minMatchCharLength: 2 }); } else { fuseLoreRef.current = null; } }, [loreEntries]);

  const filteredNotes = useMemo(() => { const baseNotes = notes.filter(note => !activeProjectId || note.projectId === activeProjectId || note.projectId === null || note.projectId === undefined); let categoryFilteredNotes = baseNotes; if (activeNoteCategoryFilter !== 'all') categoryFilteredNotes = baseNotes.filter(note => note.category === activeNoteCategoryFilter); if (noteSearchTerm.trim() === '') return categoryFilteredNotes.sort((a,b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()); if (fuseNotesRef.current && categoryFilteredNotes.length > 0) { const tempFuse = new window.Fuse(categoryFilteredNotes, { keys: fuseNotesRef.current.options.keys, includeScore: true, threshold: 0.4, minMatchCharLength: 2 }); return tempFuse.search(noteSearchTerm).map((result: { item: AppNote }) => result.item); } return categoryFilteredNotes.filter(note => note.title.toLowerCase().includes(noteSearchTerm.toLowerCase()) || (plainTextCharCount(note.content) > 0 ? (document.createElement('div').innerHTML = note.content, (document.createElement('div').textContent || document.createElement('div').innerText || "").toLowerCase().includes(noteSearchTerm.toLowerCase())) : false) || note.tags.some(tag => tag.toLowerCase().includes(noteSearchTerm.toLowerCase())) ).sort((a,b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()); }, [notes, activeNoteCategoryFilter, activeProjectId, noteSearchTerm]);
  const filteredLoreEntries = useMemo(() => { const baseLore = loreEntries.filter(entry => !activeProjectId || entry.projectId === activeProjectId || entry.projectId === null || entry.projectId === undefined); if (loreSearchTerm.trim() === '') return baseLore.sort((a,b) => a.title.localeCompare(b.title, 'th')); if (fuseLoreRef.current && baseLore.length > 0) { const tempFuse = new window.Fuse(baseLore, { keys: fuseLoreRef.current.options.keys, includeScore: true, threshold: 0.4, minMatchCharLength: 2 }); return tempFuse.search(loreSearchTerm).map((result: { item: LoreEntry }) => result.item); } return baseLore.filter(entry => entry.title.toLowerCase().includes(loreSearchTerm.toLowerCase()) || entry.content.toLowerCase().includes(loreSearchTerm.toLowerCase()) || entry.tags.some(tag => tag.toLowerCase().includes(loreSearchTerm.toLowerCase())) || entry.type.toLowerCase().includes(loreSearchTerm.toLowerCase()) ).sort((a,b) => a.title.localeCompare(b.title, 'th')); }, [loreEntries, activeProjectId, loreSearchTerm]);
  const filteredTasks = useMemo(() => { return tasks.filter(task => (activeTaskCategoryFilter === 'all' || task.category === activeTaskCategoryFilter)).filter(task => !activeProjectId || task.projectId === activeProjectId || task.projectId === null || task.projectId === undefined).sort((a, b) => Number(a.completed) - Number(b.completed) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); }, [tasks, activeTaskCategoryFilter, activeProjectId]);

  const themes: Record<string, AppTheme> = {
    obsidianNight: {
      name: 'Obsidian Night',
      bg: 'bg-slate-950', text: 'text-slate-100', textSecondary: 'text-slate-400',
      accent: 'bg-purple-600', accentText: 'text-purple-300',
      headerBg: 'bg-slate-900', headerText: 'text-slate-50',
      sidebarBg: 'bg-slate-900', sidebarText: 'text-slate-300', sidebarHoverBg: 'bg-slate-800/70', sidebarHoverText: 'text-purple-300', sidebarActiveBg: 'bg-purple-600', sidebarActiveText: 'text-white', sidebarBorder: 'border-slate-700/50',
      cardBg: 'bg-slate-800/70', cardBorder: 'border-slate-700/60', cardShadow: 'shadow-xl',
      button: 'bg-purple-600 hover:bg-purple-500', buttonText: 'text-white', buttonHover: 'hover:bg-purple-500',
      buttonSecondaryBg: 'bg-slate-700', buttonSecondaryText: 'text-slate-200', buttonSecondaryHoverBg: 'hover:bg-slate-600',
      inputBg: 'bg-slate-800', inputText: 'text-slate-100', inputBorder: 'border-slate-600/80', inputPlaceholder: 'placeholder-slate-500',
      focusRing: 'focus:ring-purple-500 focus:border-purple-500',
      aiResponseBg: 'bg-slate-800', divider: 'border-slate-700/80',
      bg_preview: 'bg-slate-950', bg_preview_color: '#020617'
    },
    forestWhisper: {
        name: 'Forest Whisper',
        bg: 'bg-green-50', text: 'text-green-900', textSecondary: 'text-green-700',
        accent: 'bg-lime-600', accentText: 'text-lime-100',
        headerBg: 'bg-green-100', headerText: 'text-green-800',
        sidebarBg: 'bg-green-100', sidebarText: 'text-green-800', sidebarHoverBg: 'bg-green-200/70', sidebarHoverText: 'text-lime-700', sidebarActiveBg: 'bg-lime-600', sidebarActiveText: 'text-white', sidebarBorder: 'border-green-300/70',
        cardBg: 'bg-white', cardBorder: 'border-green-200/80', cardShadow: 'shadow-lg',
        button: 'bg-lime-600 hover:bg-lime-500', buttonText: 'text-white', buttonHover: 'hover:bg-lime-500',
        buttonSecondaryBg: 'bg-green-200', buttonSecondaryText: 'text-green-700', buttonSecondaryHoverBg: 'hover:bg-green-300',
        inputBg: 'bg-green-50/80', inputText: 'text-green-900', inputBorder: 'border-green-300/90', inputPlaceholder: 'placeholder-green-500',
        focusRing: 'focus:ring-lime-500 focus:border-lime-500',
        aiResponseBg: 'bg-green-50/90', divider: 'border-green-200/90',
        bg_preview: 'bg-green-50', bg_preview_color: '#F0FDF4'
    },
    sunriseBloom: {
        name: 'Sunrise Bloom',
        bg: 'bg-rose-50', text: 'text-rose-900', textSecondary: 'text-rose-600',
        accent: 'bg-orange-500', accentText: 'text-orange-100',
        headerBg: 'bg-rose-100', headerText: 'text-rose-800',
        sidebarBg: 'bg-rose-100', sidebarText: 'text-rose-700', sidebarHoverBg: 'bg-rose-200/70', sidebarHoverText: 'text-orange-600', sidebarActiveBg: 'bg-orange-500', sidebarActiveText: 'text-white', sidebarBorder: 'border-rose-300/70',
        cardBg: 'bg-white', cardBorder: 'border-rose-200/80', cardShadow: 'shadow-lg',
        button: 'bg-orange-500 hover:bg-orange-400', buttonText: 'text-white', buttonHover: 'hover:bg-orange-400',
        buttonSecondaryBg: 'bg-rose-200', buttonSecondaryText: 'text-rose-700', buttonSecondaryHoverBg: 'hover:bg-rose-300',
        inputBg: 'bg-rose-50/80', inputText: 'text-rose-900', inputBorder: 'border-rose-300/90', inputPlaceholder: 'placeholder-rose-500',
        focusRing: 'focus:ring-orange-500 focus:border-orange-500',
        aiResponseBg: 'bg-rose-50/90', divider: 'border-rose-200/90',
        bg_preview: 'bg-rose-50', bg_preview_color: '#FFF1F2'
    },
    classicAshval: { // Tweaked from original "Inkwell Dark"
      name: 'Classic Ashval Dark',
      bg: 'bg-slate-900', text: 'text-slate-200', textSecondary: 'text-slate-400',
      accent: 'bg-sky-600', accentText: 'text-sky-300', 
      headerBg: 'bg-slate-800', headerText: 'text-slate-100',
      sidebarBg: 'bg-slate-800', sidebarText: 'text-slate-300', sidebarHoverBg: 'bg-slate-700/70', sidebarHoverText: 'text-sky-300', sidebarActiveBg: 'bg-sky-600', sidebarActiveText: 'text-white', sidebarBorder: 'border-slate-700/50',
      cardBg: 'bg-slate-800/80', cardBorder: 'border-slate-700/70', cardShadow: 'shadow-xl',
      button: 'bg-sky-600 hover:bg-sky-500', buttonText: 'text-white',buttonHover: 'hover:bg-sky-500',
      buttonSecondaryBg: 'bg-slate-700', buttonSecondaryText: 'text-slate-200', buttonSecondaryHoverBg: 'hover:bg-slate-600',
      inputBg: 'bg-slate-700/60', inputText: 'text-slate-100', inputBorder: 'border-slate-600/80', inputPlaceholder: 'placeholder-slate-500',
      focusRing: 'focus:ring-sky-500 focus:border-sky-500',
      aiResponseBg: 'bg-slate-800/90', divider: 'border-slate-700/80',
      bg_preview: 'bg-slate-900', bg_preview_color: '#0F172A'
    },
  };
  const currentTheme: AppTheme = themes[activeThemeKey] || themes.obsidianNight; 

  const handleNoteDataChange = (field: keyof AppNote | 'tagsString' | 'icon' | 'coverImageUrl' | 'projectId', value: string | string[] | null) => {
    if (field === 'tagsString' && typeof value === 'string') setCurrentNoteData(prev => ({ ...prev, tags: value.split(',').map(tag => tag.trim()).filter(tag => tag) }));
    else if (field === 'icon' && typeof value === 'string') setCurrentNoteData(prev => ({ ...prev, icon: value }));
    else if (field === 'coverImageUrl' && typeof value === 'string') setCurrentNoteData(prev => ({ ...prev, coverImageUrl: value }));
    else if (field === 'projectId') setCurrentNoteData(prev => ({ ...prev, projectId: value as (string | null) }));
    else if (typeof value === 'string' && (field === 'title' || field === 'content' || field === 'category')) setCurrentNoteData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleOpenAddNoteModal = (template?: NoteTemplate | UserNoteTemplate) => { setEditingNoteId(null); let initialContent = ''; let initialTitle = ''; let initialIcon = ''; let initialCategory = 'general'; let initialCoverImageUrl = ''; if (template) { initialContent = template.content; initialTitle = template.name.startsWith('โครงร่าง') || template.name.startsWith('สร้างโลก') || template.name.startsWith('แม่แบบ:') ? '' : template.name; initialIcon = template.icon || ''; initialCategory = template.category || 'general'; } setCurrentNoteData({ title: initialTitle, icon: initialIcon, coverImageUrl: initialCoverImageUrl, content: initialContent, category: initialCategory, tags: [], projectId: activeProjectId }); setShowNoteModal(true); };
  const handleOpenEditNoteModal = (note: AppNote) => { setEditingNoteId(note.id); setCurrentNoteData({ title: note.title, icon: note.icon || '', coverImageUrl: note.coverImageUrl || '', content: note.content, category: note.category, tags: note.tags, projectId: note.projectId }); setShowViewNoteModal(false); setShowNoteModal(true); };

  const saveNote = () => { if (!currentNoteData.title.trim() && !currentNoteData.content.trim()) { alert("กรุณาใส่ชื่อโน้ต หรือ เนื้อหา"); return; } const finalTitle = currentNoteData.title.trim() || `โน้ต ${new Date().toLocaleString('th-TH')}`; const currentDate = new Date().toISOString(); const finalProjectId = currentNoteData.projectId === "" ? null : currentNoteData.projectId; const noteLinks = parseNoteLinks(currentNoteData.content); if (editingNoteId !== null) { const originalNote = notes.find(n => n.id === editingNoteId); const updatedVersions = [...(originalNote?.versions || [])]; if (originalNote && originalNote.content !== currentNoteData.content) updatedVersions.push({ timestamp: originalNote.updatedAt || originalNote.createdAt, content: originalNote.content }); setNotes(notes.map(note => note.id === editingNoteId ? { ...note, ...currentNoteData, title: finalTitle, projectId: finalProjectId, icon: currentNoteData.icon || undefined, coverImageUrl: currentNoteData.coverImageUrl || undefined, updatedAt: currentDate, versions: updatedVersions.slice(-10), links: noteLinks } : note ).sort((a,b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())); } else { setNotes([...notes, { id: Date.now(), ...currentNoteData, title: finalTitle, projectId: finalProjectId, icon: currentNoteData.icon || undefined, coverImageUrl: currentNoteData.coverImageUrl || undefined, createdAt: currentDate, updatedAt: currentDate, versions: [], links: noteLinks }].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())); } setShowNoteModal(false); setEditingNoteId(null); };
  const revertNoteToVersion = (noteId: number, versionTimestamp: string) => { setNotes(prevNotes => prevNotes.map(note => { if (note.id === noteId) { const versionToRevert = note.versions?.find(v => v.timestamp === versionTimestamp); if (versionToRevert) { const newVersions = [...(note.versions || [])]; newVersions.push({ timestamp: note.updatedAt || note.createdAt, content: note.content }); const newLinks = parseNoteLinks(versionToRevert.content); return { ...note, content: versionToRevert.content, links: newLinks, updatedAt: new Date().toISOString(), versions: newVersions.filter(v => v.timestamp !== versionTimestamp).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10) }; } } return note; })); const updatedNoteToView = notes.find(n => n.id === noteId); if (updatedNoteToView) { const versionToRevert = updatedNoteToView.versions?.find(v => v.timestamp === versionTimestamp); if (versionToRevert) setNoteToView(prev => prev ? {...prev, content: versionToRevert.content, links: parseNoteLinks(versionToRevert.content), updatedAt: new Date().toISOString()} : null); } };
  const deleteNote = (id: number) => { if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบโน้ตนี้?')) { setNotes(notes.filter(note => note.id !== id)); if (noteToView && noteToView.id === id) { setShowViewNoteModal(false); setNoteToView(null); } } };
  const viewNoteDetail = (note: AppNote) => { setNoteToView(note); setShowViewNoteModal(true); };
  const viewNoteById = (noteId: number) => { const noteToShow = notes.find(n => n.id === noteId); if (noteToShow) viewNoteDetail(noteToShow); };
  const handleTaskDataChange = (field: keyof AppTask | 'title' | 'icon' | 'priority' | 'dueDate' | 'category' | 'projectId', value: string | null) => { if (field === 'projectId') setCurrentTaskData(prev => ({ ...prev, projectId: value as string | null})); else if (typeof value === 'string' && (field === 'title' || field === 'icon' || field === 'priority' || field === 'dueDate' || field === 'category')) setCurrentTaskData(prev => ({ ...prev, [field]: value })); };
  const addTask = () => { if (currentTaskData.title.trim()) { const finalProjectId = currentTaskData.projectId === "" ? null : currentTaskData.projectId; const createdTask: AppTask = { id: Date.now(), ...currentTaskData, projectId: finalProjectId || activeProjectId, icon: currentTaskData.icon || undefined, completed: false, subtasks: [], createdAt: new Date().toISOString() }; setTasks([...tasks, createdTask].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())); setCurrentTaskData({ title: '', icon: '', priority: 'medium', dueDate: '', category: 'general', projectId: activeProjectId }); setShowTaskModal(false); } };
  const toggleTask = (id: number) => { setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task)); };
  const deleteTask = (id: number) => { if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบงานนี้?')) setTasks(tasks.filter(task => task.id !== id)); };
  const toggleSubtask = (taskId: number, subtaskId: string) => { setTasks(tasks.map(task => task.id === taskId ? { ...task, subtasks: task.subtasks.map(subtask => subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask) } : task )); };
  const addSelectedSubtasksToTask = (selectedTitles: string[]) => { if (!taskForSubtaskGeneration) return; const taskId = taskForSubtaskGeneration.id; setTasks(prevTasks => prevTasks.map(task => task.id === taskId ? { ...task, subtasks: [ ...task.subtasks, ...selectedTitles.map(title => ({ id: Date.now().toString() + Math.random().toString(36).substring(2, 9), title: title, completed: false })) ] } : task )); setShowAiSubtaskModal(false); setTaskForSubtaskGeneration(null); setAiSuggestedSubtasks([]); };
  const handleAiDecomposeTaskRequest = async (task: AppTask) => { setTaskForSubtaskGeneration(task); setShowAiSubtaskModal(true); setIsGeneratingSubtasks(true); setSubtaskGenerationError(null); try { const subtasksFromAi = await generateSubtasksForTask(task.title, task.category, userPreferences.customGeminiApiKey, userPreferences.selectedAiModel); setAiSuggestedSubtasks(subtasksFromAi); if (subtasksFromAi.length === 0) setSubtaskGenerationError("AI ไม่ได้สร้างงานย่อย หรือส่งผลลัพธ์ที่ไม่ถูกต้อง"); } catch (error: any) { console.error("Error generating subtasks:", error); setSubtaskGenerationError(error.message || "เกิดข้อผิดพลาดในการสร้างงานย่อยด้วย AI"); setAiSuggestedSubtasks([]); } finally { setIsGeneratingSubtasks(false); } };
  const handleProjectSelection = (projectId: string | null) => { setActiveProjectId(projectId); setActiveNoteCategoryFilter('all'); setActiveTaskCategoryFilter('all'); setNoteSearchTerm(''); setLoreSearchTerm(''); };
  const handleCreateProject = (projectName: string) => { const newProject: Project = { id: Date.now().toString(), name: projectName, createdAt: new Date().toISOString(), isArchived: false, lastModified: new Date().toISOString(), summary: '' }; setProjects(prev => [...prev, newProject].sort((a,b) => a.name.localeCompare(b.name))); setActiveProjectId(newProject.id); };
  const handleUpdateProjectDetails = (projectId: string, details: Partial<Pick<Project, 'name' | 'genre' | 'description' | 'isArchived'>>) => { setProjects(prevProjects => prevProjects.map(p => p.id === projectId ? { ...p, ...details, lastModified: new Date().toISOString() } : p ).sort((a,b) => a.name.localeCompare(b.name))); if (details.isArchived && activeProjectId === projectId) setActiveProjectId(null); };
  const handleDeleteProject = (projectId: string) => { const projectToDelete = projects.find(p => p.id === projectId); if (!projectToDelete) return; const confirmationMessage = projectToDelete.isArchived ? `คุณแน่ใจหรือไม่ว่าต้องการลบโปรเจกต์ที่เก็บถาวร "${projectToDelete.name}"? ข้อมูลทั้งหมดที่เกี่ยวข้องจะถูกลบอย่างถาวร!` : `คุณแน่ใจหรือไม่ว่าต้องการลบโปรเจกต์ "${projectToDelete.name}"? ข้อมูลทั้งหมดที่เกี่ยวข้อง (โน้ต, งาน, ข้อมูลโลก, โครงเรื่อง) จะถูกลบอย่างถาวร!`; if (window.confirm(confirmationMessage)) { setProjects(prev => prev.filter(p => p.id !== projectId)); setNotes(prev => prev.filter(n => n.projectId !== projectId)); setTasks(prev => prev.filter(t => t.projectId !== projectId)); setLoreEntries(prev => prev.filter(l => l.projectId !== projectId)); setPlotOutlines(prev => prev.filter(po => po.projectId !== projectId)); if (activeProjectId === projectId) setActiveProjectId(null); alert(`โปรเจกต์ "${projectToDelete.name}" และข้อมูลที่เกี่ยวข้องถูกลบแล้ว`); } };
  const handleExportNoteToMarkdown = (note: AppNote | null) => { if (!note) return; let markdownContent = `# ${note.title}\n\n`; if (note.coverImageUrl) markdownContent += `![Cover Image](${note.coverImageUrl})\n\n`; markdownContent += `**ประเภท:** ${note.category}\n**แท็ก:** ${note.tags.join(', ')}\n**สร้างเมื่อ:** ${new Date(note.createdAt).toLocaleString()}\n${note.updatedAt ? `**แก้ไขล่าสุด:** ${new Date(note.updatedAt).toLocaleString()}\n` : ''}\n---\n\n${note.content}`; const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; const safeTitle = note.title.replace(/[^a-z0-9ก-๙เ-ไฯ-ูเ-์]+/gi, '_').toLowerCase(); a.download = `${safeTitle || 'note'}.md`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); };
  
  const handleImportMarkdownForNewTask = async (file: File) => {
    if (file.type !== 'text/markdown' && !file.name.endsWith('.md')) {
      alert('กรุณาเลือกไฟล์ Markdown (.md) เท่านั้น');
      return;
    }
    setIsImportingFile(true);
    setImportError(null);
    try {
      const content = await file.text();
      const fileNameWithoutExt = file.name.replace(/\.md$/, '');
      let htmlDescription = '';
      if (window.marked) {
        htmlDescription = window.marked.parse(content);
      }

      const newTask: AppTask = {
        id: Date.now(),
        title: fileNameWithoutExt || `Task imported ${new Date().toLocaleTimeString()}`,
        description: content,
        htmlDescription: htmlDescription,
        icon: '📄', 
        completed: false,
        priority: 'medium',
        dueDate: '',
        category: 'imported-markdown',
        subtasks: [],
        createdAt: new Date().toISOString(),
        projectId: activeProjectId,
      };
      setTasks(prev => [newTask, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      alert(`นำเข้าไฟล์ "${file.name}" เป็นงานใหม่สำเร็จ!`);
    } catch (err: any) {
      console.error("Error importing Markdown for task:", file.name, err);
      setImportError(`เกิดข้อผิดพลาดกับไฟล์: ${file.name} - ${err.message}`);
    } finally {
      setIsImportingFile(false);
    }
  };

  const handleImportMarkdownToAiPrompt = async (file: File) => {
    if (file.type !== 'text/markdown' && !file.name.endsWith('.md')) {
      alert('กรุณาเลือกไฟล์ Markdown (.md) เท่านั้น');
      return;
    }
    setIsImportingFile(true); 
    setImportError(null);
    try {
      const content = await file.text();
      setInputPromptAi(content);
      alert(`นำเข้าเนื้อหาจากไฟล์ "${file.name}" ไปยัง AI Writer Prompt สำเร็จ!`);
    } catch (err: any) {
      console.error("Error importing Markdown to AI prompt:", file.name, err);
      setImportError(`เกิดข้อผิดพลาดกับไฟล์: ${file.name} - ${err.message}`);
    } finally {
      setIsImportingFile(false);
    }
  };
  
  const triggerFileInput = () => fileInputRef.current?.click();
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => { const files = event.target.files; if (!files || files.length === 0) return; setIsImportingFile(true); setImportError(null); let importedNotesCount = 0; for (const file of Array.from(files)) { try { let content = ''; const fileName = file.name; const fileType = fileName.split('.').pop()?.toLowerCase(); if (fileType === 'txt' || fileType === 'md') content = await file.text(); else if (fileType === 'pdf' && window.pdfjsLib) { const arrayBuffer = await file.arrayBuffer(); const pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise; let textContent = ''; for (let i = 1; i <= pdf.numPages; i++) { const page = await pdf.getPage(i); const pageText = await page.getTextContent(); textContent += pageText.items.map(item => item.str).join(' ') + '\n'; } content = textContent; } else if (fileType === 'docx' && window.mammoth) { const arrayBuffer = await file.arrayBuffer(); const result = await window.mammoth.extractRawText({ arrayBuffer }); content = result.value; } else { console.warn(`Unsupported file type: ${fileType}`); setImportError(prev => (prev ? prev + `; ไม่รองรับไฟล์: ${fileName}`: `ไม่รองรับไฟล์: ${fileName}`)); continue; } if (content.trim()) { const newNote: AppNote = { id: Date.now() + Math.random(), title: fileName, icon: '📄', content: content, category: 'imported', tags: [fileType || 'file'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), projectId: activeProjectId, versions: [], links: parseNoteLinks(content) }; setNotes(prev => [newNote, ...prev].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())); importedNotesCount++; } } catch (err: any) { console.error("Error processing file:", file.name, err); setImportError(prev => (prev ? prev + `; เกิดข้อผิดพลาดกับไฟล์: ${file.name}` : `เกิดข้อผิดพลาดกับไฟล์: ${file.name}`)); } } if (importedNotesCount > 0) alert(`นำเข้า ${importedNotesCount} โน้ตสำเร็จ!`); setIsImportingFile(false); if (fileInputRef.current) fileInputRef.current.value = ""; };
  const [activeAiWriterPath, setActiveAiWriterPath] = React.useState('/ai'); 
  const handleTriggerAiAnalysisFromViewNote = (noteContent: string, mode: 'tone-sentiment-analysis' | 'lore-consistency-check') => { setInputPromptAi(noteContent); setOperationModeAi(mode); setActiveAiWriterPath('/ai'); handleNavigate('/ai'); };
  const handleOperationModeChangeAi = (e: React.ChangeEvent<HTMLSelectElement>) => { const newMode = e.target.value; setOperationModeAi(newMode); if (newMode === 'custom') setCustomSystemInstructionAi(OPERATION_MODES.find(m => m.value === 'custom')?.systemInstruction || defaultCustomModeSIAi); else setCustomSystemInstructionAi(''); setAiResponse(''); setErrorAi(null); setChatHistoryAi([]); };
  const handleCustomSystemInstructionChangeAi = (e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomSystemInstructionAi(e.target.value);
  const handleClearInputAi = () => { setInputPromptAi(''); setAiResponse(''); setErrorAi(null); setChatHistoryAi([]); };
  
  const handleSubmitAi = async (selectedContextLoreIds?: string[]) => {
    if (!inputPromptAi.trim() && operationModeAi !== 'scene-creation') { setErrorAi('กรุณาป้อนคำสั่งหรือเนื้อหาสำหรับ AI'); return; }
    if (inputCharCountAi > AI_MAX_INPUT_CHARS) { setErrorAi(`เนื้อหาป้อนเข้าเกิน ${AI_MAX_INPUT_CHARS} ตัวอักษร (${inputCharCountAi})`); return; }
    
    setIsLoadingAi(true); 
    setErrorAi(null); 
    setAiResponse(''); 

    const currentOperation = OPERATION_MODES.find(m => m.value === operationModeAi);
    if (!currentOperation) { setErrorAi('ไม่พบโหมดการทำงานของ AI ที่เลือก'); setIsLoadingAi(false); return; }
    
    let systemInstructionToUse = operationModeAi === 'custom' ? (customSystemInstructionAi.trim() || currentOperation.systemInstruction) : currentOperation.systemInstruction;
    let userPromptFormatted = inputPromptAi; let projectContextString = ''; let selectedContextString = ''; let parsedInputContextString = '';
    const parsedInputContext = parseInputForContext(inputPromptAi); parsedInputContextString = formatParsedContextForPrompt(parsedInputContext);
    
    if (['scene-analysis', 'character-analysis', 'magic-system', 'plot-structuring', 'tone-sentiment-analysis', 'lore-consistency-check', 'continuity-check', 'scene-creation', 'scene-rewrite', 'show-dont-tell-enhancer', 'rate-scene', 'create-world', 'dialogue-generation', 'summarize-elaborate', 'custom'].includes(operationModeAi)) {
        const currentProject = activeProjectId ? projects.find(p => p.id === activeProjectId && !p.isArchived) : null;
        const projectNotesToConsider = currentProject ? notes.filter(n => n.projectId === currentProject.id) : notes;
        const projectLoreToConsider = currentProject ? loreEntries.filter(l => l.projectId === currentProject.id) : loreEntries;
        const contextNotes = projectNotesToConsider.slice(0, MAX_PROJECT_NOTES_IN_CONTEXT).map(n => `โน้ต "${n.title}": ${plainTextCharCount(n.content) > 0 ? (document.createElement('div').innerHTML = n.content, (document.createElement('div').textContent || document.createElement('div').innerText || "").substring(0, PROJECT_CONTEXT_MAX_NOTE_CHARS)) : ''}...`).join('\n');
        const contextLore = projectLoreToConsider.slice(0, MAX_PROJECT_LORE_IN_CONTEXT).map(l => `ข้อมูลโลก "${l.title}" (ประเภท: ${l.type}): ${l.content.substring(0, PROJECT_CONTEXT_MAX_LORE_CHARS)}...`).join('\n');
        if (contextNotes || contextLore || currentProject) { projectContextString = "\n\n## ข้อมูลโปรเจกต์ (Project Context):\n"; if (currentProject) { projectContextString += `ชื่อโปรเจกต์: ${currentProject.name}\n`; if (currentProject.genre) projectContextString += `ประเภท: ${currentProject.genre}\n`; if (currentProject.description) projectContextString += `คำอธิบายโปรเจกต์: ${currentProject.description.substring(0,100)}...\n`; } if(contextNotes) projectContextString += contextNotes + "\n"; if(contextLore) projectContextString += contextLore + "\n"; }
    }
    if (selectedContextLoreIds && selectedContextLoreIds.length > 0) { const selectedLore = loreEntries.filter(lore => selectedContextLoreIds.includes(lore.id)); if (selectedLore.length > 0) { selectedContextString = "\n## ข้อมูลอ้างอิงที่เลือก (Selected References):\n"; selectedLore.forEach(lore => { selectedContextString += `ข้อมูล "${lore.title}" (ประเภท: ${lore.type}): ${lore.content.substring(0, PROJECT_CONTEXT_MAX_LORE_CHARS * 2)}...\n`; }); } }
    if (currentOperation.userPromptFormatter) { let contextDataForFormatter: any = {}; if (operationModeAi === 'lore-consistency-check') { const currentProject = activeProjectId ? projects.find(p => p.id === activeProjectId && !p.isArchived) : null; contextDataForFormatter.projectLore = currentProject ? loreEntries.filter(l => l.projectId === currentProject.id) : loreEntries; } contextDataForFormatter.parsedInput = parsedInputContext; userPromptFormatted = currentOperation.userPromptFormatter(inputPromptAi, contextDataForFormatter); }
    const fullUserPrompt = userPromptFormatted + parsedInputContextString + projectContextString + selectedContextString;
    const updatedChatHistory = [...chatHistoryAi, { role: 'user' as 'user', text: fullUserPrompt }];
    if (updatedChatHistory.length > MAX_CHAT_EXCHANGES * 2) updatedChatHistory.splice(0, updatedChatHistory.length - (MAX_CHAT_EXCHANGES * 2));
    setChatHistoryAi(updatedChatHistory);

    try {
      const apiKeyToUse = userPreferences.customGeminiApiKey; 
      const modelToUse = userPreferences.selectedAiModel || DEFAULT_MODEL_NAME;
      
      let fullResponseText = "";
      for await (const chunk of generateAiContentStream(systemInstructionToUse, fullUserPrompt, chatHistoryAi, apiKeyToUse, modelToUse)) {
        if (chunk.startsWith(STREAM_ERROR_MARKER)) {
          const errorHtml = chunk.substring(STREAM_ERROR_MARKER.length);
          setErrorAi("Stream Error"); 
          setAiResponse(errorHtml); 
          fullResponseText = errorHtml; 
          break; 
        }
        fullResponseText += chunk;
        setAiResponse(prev => prev + chunk); 
      }

      if (!fullResponseText.toLowerCase().includes("error") && !fullResponseText.toLowerCase().includes("ไม่พร้อมใช้งาน") && !fullResponseText.toLowerCase().includes("ล้มเหลว") && !fullResponseText.startsWith(STREAM_ERROR_MARKER)) {
        setChatHistoryAi(prev => [...prev, { role: 'model' as 'model', text: fullResponseText }]);
        const wordsFromResponse = Array.from(fullResponseText.toLowerCase().matchAll(/\b([a-zA-Zก-๙]{3,})\b/g), m => m[1]);
        if (wordsFromResponse) setLearnedWordsAi(prev => new Set([...Array.from(prev), ...wordsFromResponse]));
      }
      
    } catch (error: any) { 
      console.error("Error consuming AI stream:", error); 
      const errorMessage = error.message || "เกิดข้อผิดพลาดในการสื่อสารกับ AI"; 
      setAiResponse(`<p class="text-red-400 font-semibold">AI Error: ${errorMessage}</p>`); 
      setErrorAi(errorMessage); 
    } finally { 
      setIsLoadingAi(false); 
    }
  };

  const handleCopyAiResponse = async () => { if (aiResponseRef.current) { let textToCopy = ""; const tempDiv = document.createElement('div'); tempDiv.innerHTML = aiResponseRef.current.innerHTML; textToCopy = tempDiv.textContent || tempDiv.innerText || ""; if (textToCopy && textToCopy !== INITIAL_AI_RESPONSE_MESSAGE && textToCopy !== PROCESSING_AI_RESPONSE_MESSAGE) { try { await navigator.clipboard.writeText(textToCopy); alert('คัดลอกผลลัพธ์ AI สำเร็จ!'); } catch (err) { alert('ไม่สามารถคัดลอกผลลัพธ์ AI ได้'); } } else alert('ไม่มีข้อความผลลัพธ์ AI ให้คัดลอก'); } };
  const handleSaveAiResponseAsNote = () => { if (aiResponseRef.current && aiResponse !== INITIAL_AI_RESPONSE_MESSAGE && aiResponse !== PROCESSING_AI_RESPONSE_MESSAGE && !errorAi) { const yamlRegex = /```yaml\n([\s\S]*?)\n```|---\n([\s\S]*?)\n---/; const match = aiResponse.match(yamlRegex); let noteContentToSave = aiResponse; let noteTitleSuggestion = `AI Response - ${operationModeAi}`; if (match) { const yamlBlock = match[1] || match[2]; const titleMatch = yamlBlock.match(/^title:\s*(.*)$/m); if (titleMatch && titleMatch[1]) noteTitleSuggestion = titleMatch[1].trim(); } else { const tempDiv = document.createElement('div'); tempDiv.innerHTML = window.marked ? window.marked.parse(aiResponse) : aiResponse; const plainTextResponse = tempDiv.textContent || tempDiv.innerText || ""; const firstLine = plainTextResponse.split('\n')[0].substring(0, 50); if (firstLine.trim()) noteTitleSuggestion = firstLine.trim(); } const newNote: AppNote = { id: Date.now(), title: noteTitleSuggestion, icon: '🤖', content: noteContentToSave, category: 'ai-generated', tags: [operationModeAi], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), projectId: activeProjectId, versions: [], links: parseNoteLinks(noteContentToSave) }; setNotes(prev => [newNote, ...prev].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())); alert(`บันทึกผลลัพธ์ AI เป็นโน้ตใหม่ชื่อ "${newNote.title}" สำเร็จ`); } else alert('ไม่มีผลลัพธ์ AI ที่ถูกต้องสำหรับบันทึก'); };
  const handleAutoCreateLoreEntriesFromAi = (entriesToCreate: Array<{ title: string; type: LoreEntry['type']; }>) => { const newLoreEntries: LoreEntry[] = []; entriesToCreate.forEach(item => { const exists = loreEntries.some(existing => existing.title.toLowerCase() === item.title.toLowerCase() && existing.type === item.type && (activeProjectId ? existing.projectId === activeProjectId : true)); if (!exists) { const newEntry: LoreEntry = { id: Date.now().toString() + Math.random().toString(36).substring(2,9), title: item.title, type: item.type, content: `สร้างอัตโนมัติจาก AI Writer - [[${item.title}|${item.type}]]`, tags: ['ai-generated', 'auto-created'], createdAt: new Date().toISOString(), projectId: activeProjectId }; newLoreEntries.push(newEntry); } }); if (newLoreEntries.length > 0) { setLoreEntries(prev => [...prev, ...newLoreEntries].sort((a,b) => a.title.localeCompare(b.title, 'th'))); alert(`สร้างข้อมูลโลกใหม่ ${newLoreEntries.length} รายการ จากการอ้างอิงใน AI Writer`); } };
  const handleInsertAiResponseIntoActiveNote = (textToInsert: string) => { if (showNoteModal && currentNoteData) { const plainTextToInsert = textToInsert.trim(); setCurrentNoteData(prev => ({ ...prev, content: (prev.content ? prev.content + '\n\n' : '') + plainTextToInsert })); } else alert("กรุณาเปิดโน้ตที่ต้องการแก้ไขก่อน หรือสร้างโน้ตใหม่"); };
  const handleSendSelectedTextToAi = (selectedText: string) => { setInputPromptAi(selectedText); setActiveAiWriterPath('/ai'); handleNavigate('/ai'); alert("ข้อความที่เลือกถูกส่งไปยัง AI Writer แล้ว"); };
  const formatPomodoroTime = (timeInSeconds: number): string => { const minutes = Math.floor(timeInSeconds / 60); const seconds = timeInSeconds % 60; return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`; };
  const togglePomodoroActive = () => setPomodoroIsActive(!pomodoroIsActive);
  const resetPomodoroCurrentCycle = () => { setPomodoroIsActive(false); if (pomodoroIntervalRef.current) clearInterval(pomodoroIntervalRef.current); switch (pomodoroCurrentMode) { case 'work': setPomodoroTimeLeft(pomodoroConfig.work * 60); break; case 'shortBreak': setPomodoroTimeLeft(pomodoroConfig.shortBreak * 60); break; case 'longBreak': setPomodoroTimeLeft(pomodoroConfig.longBreak * 60); break; } };
  const skipPomodoroCycle = () => { setPomodoroIsActive(false); if (pomodoroIntervalRef.current) clearInterval(pomodoroIntervalRef.current); if (pomodoroCurrentMode === 'work') { if (pomodoroCurrentRound % pomodoroConfig.rounds === 0) { setPomodoroCurrentMode('longBreak'); setPomodoroTimeLeft(pomodoroConfig.longBreak * 60); } else { setPomodoroCurrentMode('shortBreak'); setPomodoroTimeLeft(pomodoroConfig.shortBreak * 60); } } else { setPomodoroCurrentMode('work'); setPomodoroTimeLeft(pomodoroConfig.work * 60); if (pomodoroCurrentMode !== 'longBreak') setPomodoroCurrentRound(prev => prev + 1); } };
  const handlePomodoroConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => { const { name, value } = e.target; setTempPomodoroConfig(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 })); };
  const savePomodoroConfig = () => { setPomodoroConfig(tempPomodoroConfig); if (pomodoroCurrentMode === 'work' && !pomodoroIsActive) setPomodoroTimeLeft(tempPomodoroConfig.work * 60); alert('บันทึกการตั้งค่า Pomodoro แล้ว'); };
  useEffect(() => { if (pomodoroIsActive && pomodoroTimeLeft > 0) pomodoroIntervalRef.current = window.setInterval(() => setPomodoroTimeLeft(prev => prev - 1), 1000); else if (pomodoroTimeLeft === 0) { if (pomodoroIntervalRef.current) clearInterval(pomodoroIntervalRef.current); if (userPreferences.notificationPreferences.taskReminders && Notification.permission === "granted") new Notification('Pomodoro Timer', { body: `รอบ ${pomodoroCurrentMode === 'work' ? 'ทำงาน' : pomodoroCurrentMode === 'shortBreak' ? 'พักสั้น' : 'พักยาว'} สิ้นสุดแล้ว!`, icon: '/ashval-logo-transparent.png' }); skipPomodoroCycle(); setPomodoroIsActive(true); } return () => { if (pomodoroIntervalRef.current) clearInterval(pomodoroIntervalRef.current); }; }, [pomodoroIsActive, pomodoroTimeLeft, pomodoroConfig, pomodoroCurrentMode, pomodoroCurrentRound, userPreferences.notificationPreferences.taskReminders]);
  const allProjectLoreEntriesForAIContext = useMemo(() => activeProjectId ? loreEntries.filter(l => l.projectId === activeProjectId) : [], [loreEntries, activeProjectId]);

  return (
    <div className={`${currentTheme.bg} h-screen ${currentTheme.text} font-sans transition-colors duration-300 flex flex-col`}>
      <Header 
        currentTheme={currentTheme} 
        themes={themes} 
        activeThemeKey={activeThemeKey} 
        setActiveTheme={setActiveThemeKey} 
        onToggleSidebar={handleToggleSidebar}
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={handleProjectSelection}
        onCreateProject={handleCreateProject}
      />
      <div className={`flex flex-1 pt-16 md:pl-60 lg:pl-64 overflow-hidden`}> {/* Ensured overflow-hidden here */}
        <Sidebar 
            navItems={navItems} 
            currentTheme={currentTheme} 
            isSidebarOpen={isSidebarOpen} 
            onNavigate={handleNavigate} 
        />
        {isSidebarOpen && <div onClick={handleToggleSidebar} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden" aria-hidden="true"></div>}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto pb-20 md:pb-6">
            <Routes>
              <Route path="/" element={
                  <ProjectDashboard 
                    notes={filteredNotes} 
                    tasks={filteredTasks} 
                    loreEntries={filteredLoreEntries} 
                    activeProject={projects.find(p => p.id === activeProjectId && !p.isArchived)} 
                    currentTheme={currentTheme}
                    onNavigateTo={handleNavigate}
                    onOpenNoteModal={() => handleOpenAddNoteModal()}
                    onOpenTaskModal={() => setShowTaskModal(true)}
                    pomodoroCurrentMode={pomodoroCurrentMode}
                    pomodoroTimeLeft={pomodoroTimeLeft}
                    formatPomodoroTime={formatPomodoroTime}
                  />} 
              />
              <Route path="/notes" element={
                <section id="notes-section" aria-labelledby="notes-heading">
                  <div className="flex flex-col sm:flex-row justify-between items-center mb-4"> <h2 id="notes-heading" className={`text-2xl font-semibold ${currentTheme.text} flex items-center`}> <StickyNote className={`w-6 h-6 mr-2 ${currentTheme.accentText || currentTheme.accent.replace('bg-','text-')}`} /> รายการโน้ต ({filteredNotes.length}) </h2> <div className="flex items-center gap-2 mt-2 sm:mt-0"> <button onClick={triggerFileInput} disabled={isImportingFile} className={`${currentTheme.button} ${currentTheme.buttonText || 'text-white'} px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 shadow-md flex items-center text-sm ${isImportingFile ? 'opacity-50 cursor-not-allowed' : ''}`}> {isImportingFile ? <div className="w-4 h-4 border-2 border-white border-b-transparent rounded-full animate-spin mr-2"></div> : <UploadCloud className="w-4 h-4 mr-1.5" />} นำเข้าไฟล์ </button> <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".txt,.md,.pdf,.docx" multiple style={{ display: 'none' }} /> <button onClick={() => handleOpenAddNoteModal()} className={`${currentTheme.button} ${currentTheme.buttonText || 'text-white'} px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 shadow-md flex items-center text-sm`}> <Plus className="w-4 h-4 mr-1.5" /> เพิ่มโน้ต </button> </div> </div> {importError && <p className="text-red-400 text-sm mb-2">{importError}</p>} <div className={`mb-4 p-3 rounded-lg ${currentTheme.cardBg} bg-opacity-70 shadow-sm`}> <div className="relative"> <input type="text" placeholder="ค้นหาโน้ต..." value={noteSearchTerm} onChange={(e) => setNoteSearchTerm(e.target.value)} className={`w-full py-2.5 pl-10 pr-4 rounded-lg ${currentTheme.inputBg} ${currentTheme.inputText} border ${currentTheme.inputBorder} focus:outline-none focus:ring-2 ${currentTheme.focusRing}`} aria-label="ค้นหาโน้ต" /> <Search className={`w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 ${currentTheme.textSecondary} opacity-50`} /> </div> </div> <CategoryFilterControl categories={['all', ...getUniqueCategories(notes.filter(note => !activeProjectId || note.projectId === activeProjectId || note.projectId === null || note.projectId === undefined))]} activeFilter={activeNoteCategoryFilter} onFilterChange={setActiveNoteCategoryFilter} getCategoryIcon={getCategoryIcon} currentTheme={currentTheme} label="กรองตามประเภทโน้ต" /> {filteredNotes.length === 0 ? (<p className={`${currentTheme.textSecondary} opacity-70 italic text-center py-8`}> {noteSearchTerm ? `ไม่พบโน้ตที่ตรงกับคำค้นหา "${noteSearchTerm}"` : activeNoteCategoryFilter === 'all' && notes.filter(n => !activeProjectId || n.projectId === activeProjectId).length === 0 ? "ยังไม่มีโน้ต เริ่มสร้างโน้ตใหม่ได้เลย!" : `ไม่พบโน้ตในประเภท "${activeNoteCategoryFilter}"`} </p>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"> {filteredNotes.map(note => (<NoteItem key={note.id} note={note} currentTheme={currentTheme} onViewNote={viewNoteDetail} onDeleteNote={deleteNote} getCategoryIcon={getCategoryIcon} projectName={note.projectId ? projects.find(p => p.id === note.projectId)?.name : undefined} />))} </div>)} </section>
              } />
              <Route path="/tasks" element={<TaskList tasks={filteredTasks} currentTheme={currentTheme} onToggleTask={toggleTask} onDeleteTask={deleteTask} onAddTask={() => setShowTaskModal(true)} onToggleSubtask={toggleSubtask} onAiDecomposeTaskRequest={handleAiDecomposeTaskRequest} getPriorityColor={getPriorityColorClass} getCategoryIcon={getCategoryIcon} projects={projects} activeProjectId={activeProjectId} pomodoroConfig={pomodoroConfig} pomodoroTempConfig={tempPomodoroConfig} pomodoroCurrentMode={pomodoroCurrentMode} pomodoroTimeLeft={pomodoroTimeLeft} pomodoroIsActive={pomodoroIsActive} pomodoroCurrentRound={pomodoroCurrentRound} onPomodoroStartPause={togglePomodoroActive} onPomodoroResetCurrent={resetPomodoroCurrentCycle} onPomodoroSkip={skipPomodoroCycle} onPomodoroConfigChange={handlePomodoroConfigChange} onPomodoroSaveConfig={savePomodoroConfig} formatPomodoroTime={formatPomodoroTime} onImportMarkdownForNewTask={handleImportMarkdownForNewTask} />} />
              <Route path="/plot" element={<PlotOutlineManager plotOutlines={plotOutlines} setPlotOutlines={setPlotOutlines} activeProjectId={activeProjectId} currentTheme={currentTheme} />} />
              <Route path="/graph" element={<GraphView notes={notes} loreEntries={loreEntries} activeProjectId={activeProjectId} currentTheme={currentTheme} onViewNoteById={viewNoteById} />} />
               <Route path="/analytics" element={<ContentAnalytics />} />
              <Route path="/templates" element={<UserTemplateManager userTemplates={userTemplates} setUserTemplates={setUserTemplates} currentTheme={currentTheme} getCategoryIcon={getCategoryIcon} activeProjectId={activeProjectId} />} />
              <Route path="/ai" element={<AiWriter showAiWriterSection={showAiWriterSection} operationMode={operationModeAi} customSystemInstruction={customSystemInstructionAi} inputPrompt={inputPromptAi} aiResponse={aiResponse} isLoading={isLoadingAi} error={errorAi} inputCharCount={inputCharCountAi} responseCharCount={responseCharCountAi} defaultCustomModeSI={defaultCustomModeSIAi} currentTheme={currentTheme} userPreferences={userPreferences} activeProjectName={activeProjectId ? projects.find(p => p.id === activeProjectId && !p.isArchived)?.name : null} allProjectLoreEntries={allProjectLoreEntriesForAIContext} onOperationModeChange={handleOperationModeChangeAi} onCustomSystemInstructionChange={handleCustomSystemInstructionChangeAi} onInputPromptChange={setInputPromptAi} onClearInput={handleClearInputAi} onSubmit={handleSubmitAi} onCopyResponse={handleCopyAiResponse} onSaveResponseAsNewNote={handleSaveAiResponseAsNote} onInsertToEditor={handleInsertAiResponseIntoActiveNote} aiResponseRef={aiResponseRef} onAutoCreateLoreEntries={handleAutoCreateLoreEntriesFromAi} onImportMarkdownToPrompt={handleImportMarkdownToAiPrompt} />} />
              <Route path="/lore" element={<WorldAnvilManager loreEntries={filteredLoreEntries} setLoreEntries={setLoreEntries} currentTheme={currentTheme} getCategoryIcon={getCategoryIcon} projects={projects.filter(p => !p.isArchived)} activeProjectId={activeProjectId} searchTerm={loreSearchTerm} setSearchTerm={setLoreSearchTerm} />} />
              <Route path="/pomodoro" element={<PomodoroTimer config={pomodoroConfig} tempConfig={tempPomodoroConfig} currentMode={pomodoroCurrentMode} timeLeft={pomodoroTimeLeft} isActive={pomodoroIsActive} currentRound={pomodoroCurrentRound} currentTheme={currentTheme} onStartPause={togglePomodoroActive} onResetCurrent={resetPomodoroCurrentCycle} onSkip={skipPomodoroCycle} onConfigChange={handlePomodoroConfigChange} onSaveConfig={savePomodoroConfig} formatTime={formatPomodoroTime} />} />
              <Route path="/utilities" element={<UtilitiesPage currentTheme={currentTheme} />} />
              <Route path="/export" element={<ExportPage notes={notes} currentTheme={currentTheme} exportTemplates={EXPORT_TEMPLATES} activeProjectId={activeProjectId} />} />
              <Route path="/dictionary" element={<DictionaryManager learnedWords={learnedWordsAi} setLearnedWords={setLearnedWordsAi} currentTheme={currentTheme} />} />
              <Route path="/settings" element={<AppSettingsPage currentTheme={currentTheme} userPreferences={userPreferences} setUserPreferences={setUserPreferences} projects={projects} activeProjectId={activeProjectId} onUpdateProjectDetails={handleUpdateProjectDetails} onDeleteProject={handleDeleteProject} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <footer className={`text-center py-8 mt-8 border-t ${currentTheme.divider} ${currentTheme.textSecondary} opacity-60 text-xs`}>
                <p>&copy; {new Date().getFullYear()} Ashval Writer's Suite. AI Powered by Google Gemini.</p>
                <p>สร้างสรรค์โดยนักเขียน เพื่อนักเขียน.</p>
            </footer>
        </main>
      </div>
      <NoteModal showModal={showNoteModal} isEditing={editingNoteId !== null} noteData={currentNoteData} onNoteDataChange={handleNoteDataChange} onSave={saveNote} onCancel={() => { setShowNoteModal(false); setEditingNoteId(null); }} onSendSelectionToAi={handleSendSelectedTextToAi} currentTheme={currentTheme} projects={projects.filter(p => !p.isArchived)} activeProjectId={activeProjectId} systemTemplates={SYSTEM_NOTE_TEMPLATES} userTemplates={userTemplates} />
      <TaskModal showModal={showTaskModal} taskData={currentTaskData} onTaskDataChange={handleTaskDataChange} onSave={addTask} onCancel={() => setShowTaskModal(false)} currentTheme={currentTheme} />
      <ViewNoteModal showModal={showViewNoteModal} noteToView={noteToView} allNotes={notes} onClose={() => setShowViewNoteModal(false)} onEdit={handleOpenEditNoteModal} onExportMd={handleExportNoteToMarkdown} onRevertVersion={revertNoteToVersion} getCategoryIcon={getCategoryIcon} currentTheme={currentTheme} projectName={noteToView?.projectId ? projects.find(p => p.id === noteToView.projectId)?.name : undefined} onTriggerAiAnalysis={handleTriggerAiAnalysisFromViewNote} onViewNoteById={viewNoteById} />
      <AiSubtaskSuggestionModal show={showAiSubtaskModal} taskTitle={taskForSubtaskGeneration?.title || ''} suggestedSubtasks={aiSuggestedSubtasks} isLoadingSuggestions={isGeneratingSubtasks} errorSubtaskGeneration={subtaskGenerationError} currentTheme={currentTheme} onClose={() => { setShowAiSubtaskModal(false); setTaskForSubtaskGeneration(null); setAiSuggestedSubtasks([]); setSubtaskGenerationError(null); }} onAddSubtasks={addSelectedSubtasksToTask} />
      <AshvalMascot currentTheme={currentTheme} />
      <BottomNavBar currentTheme={currentTheme} onNavigate={handleNavigate} />
    </div>
  );
};
