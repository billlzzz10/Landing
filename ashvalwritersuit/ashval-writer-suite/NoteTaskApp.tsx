


import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'; 
import { Plus, Search, LayoutDashboard, Edit3, Check, Settings, BookOpen, Palette, Moon, Sun, Zap, Heart, Send, Copy, XCircle, ChevronDown, ChevronUp, MessageSquare, Brain, Eye, Play, Pause, RotateCcw, SkipForward, Save, ListFilter, FileText, AlertTriangle, UploadCloud, GitFork, Info, FileEdit, FileSignature, Tag, Calendar, MapPin, Gift, Cpu, CalendarDays, BookText, Repeat, Package, Layers, Users, Aperture, Clock, Archive, Trash2, LayoutList, GitBranch as PlotIcon, GitMerge, Download, Home, FileArchive, UserCog, StickyNote, Menu as MenuIcon, SlidersHorizontal, FileInput, BarChart3, Activity as ActivityIcon } from 'lucide-react'; 

import { OPERATION_MODES, INITIAL_AI_RESPONSE_MESSAGE, PROCESSING_AI_RESPONSE_MESSAGE, AI_MAX_INPUT_CHARS, MAX_CHAT_EXCHANGES, PROJECT_CONTEXT_MAX_NOTE_CHARS, PROJECT_CONTEXT_MAX_LORE_CHARS, MAX_PROJECT_NOTES_IN_CONTEXT, MAX_PROJECT_LORE_IN_CONTEXT, MODEL_NAME as DEFAULT_MODEL_NAME, AVAILABLE_AI_MODELS, NOTE_TEMPLATES as SYSTEM_NOTE_TEMPLATES, EXPORT_TEMPLATES } from './constants'; 
import { AppNote, AppTask, AppSubtask, OperationMode, ChatTurn, LoreEntry, NoteVersion, UserPreferences, NotificationPreferences, AiWriterPreferences, Project, UserNoteTemplate, NoteTemplate, PlotOutlineNode, NoteLink, AppTheme, ExportTemplate, AppDataType } from './types'; // Removed PomodoroConfig
import { generateAiContentStream, generateSubtasksForTask } from './frontend/src/services/geminiService';
import { fetchAppDataFromServer, saveAppDataToServer } from './frontend/src/services/appDataService'; 

import Header from './Header'; // This is NoteTaskApp's own Header
import Sidebar, { NavItem } from './Sidebar'; // This is NoteTaskApp's own Sidebar
import NoteModal from './NoteModal';
import TaskModal from './TaskModal';
import ViewNoteModal from './ViewNoteModal';
import AiWriter from './AiWriter';
// import PomodoroTimer from './PomodoroTimer'; // Removed PomodoroTimer import
import NoteItem from './NoteItem'; // Moved to root
import TaskList from './TaskList'; 
import TaskItem from './TaskItem'; // Moved to root
import CategoryFilterControl from './CategoryFilterControl';
import AiSubtaskSuggestionModal from './AiSubtaskSuggestionModal';
// import ProjectDashboard from './ProjectDashboard'; // Placeholder, replaced by ActualDashboardPage
import ActualDashboardPage from './components/DashboardPage'; // Using the styled dashboard
import WorldAnvilManager from './WorldAnvilManager'; 
import AppSettingsPage from './AppSettingsPage'; 
import DictionaryManager from './DictionaryManager'; 
import EmojiPicker from './EmojiPicker'; 
// ProjectSelector is used within this app's Header
import UserTemplateManager from './UserTemplateManager';
import PlotOutlineManager from './PlotOutlineManager';
import GraphView from './GraphView';
import ExportPage from './ExportPage';
import UtilitiesPage from './UtilitiesPage'; 
import AshvalMascot from './AshvalMascot'; 
import BottomNavBar from './BottomNavBar'; 
import ContentAnalytics from './ContentAnalytics'; 

// Helper functions (assuming these were part of the original, complete file)
const MIN_LEARNED_WORD_LENGTH = 3;
const STREAM_ERROR_MARKER = "[[STREAM_ERROR]]"; 

declare global {
  interface Window {
    pdfjsLib: any; 
  }
}

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

// Removed initialPomodoroConfig
const initialUserPreferences: UserPreferences = {
  notificationPreferences: { taskReminders: true, projectUpdates: false },
  aiWriterPreferences: { repetitionThreshold: 3, autoAddLoreFromAi: true, autoAnalyzeScenes: false, contextualAiMenuStyle: 'simple' },
  selectedFontFamily: "'Sarabun', sans-serif",
  customGeminiApiKey: undefined,
  selectedAiModel: DEFAULT_MODEL_NAME,
};
const initialActiveThemeKey = 'obsidianNight'; 

// Props from the outer App.tsx (Layout shell)
interface NoteTaskAppProps {
  outerIsDarkMode: boolean;
  outerToggleTheme: () => void;
  outerIsSidebarOpen: boolean;
  outerToggleSidebar: () => void;
}

const NoteTaskAppContent: React.FC<NoteTaskAppProps> = ({ outerIsDarkMode, outerToggleTheme, outerIsSidebarOpen, outerToggleSidebar }) => { 
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
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null); // Changed to string
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
  
  // Removed Pomodoro state variables
  
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(initialUserPreferences);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(''); 
  const [isImportingFile, setIsImportingFile] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const fuseNotesRef = useRef<any>(null); 
  const fuseLoreRef = useRef<any>(null); 
  
  const [isAppSidebarOpen, setIsAppSidebarOpen] = useState(false); 

  const handleToggleAppSidebar = () => setIsAppSidebarOpen(!isAppSidebarOpen);
  const handleNavigate = (path: string) => {
    navigate(path);
    if (isAppSidebarOpen) setIsAppSidebarOpen(false); 
  };

  useEffect(() => {
    const loadInitialData = async () => {
      if (typeof window !== 'undefined' && window.pdfjsLib) {
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
          // Removed Pomodoro config loading
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
          // Removed Pomodoro config default setting
          setUserPreferences(initialUserPreferences); 
          if (document.body && initialUserPreferences.selectedFontFamily) document.body.style.fontFamily = initialUserPreferences.selectedFontFamily;
        }
      } catch (e) {
        console.error("Could not load data from localStorage:", e);
        setNotes([]); setTasks([]); setLoreEntries([]); setProjects([]); setUserTemplates([]); setPlotOutlines([]);
        setActiveThemeKey(initialActiveThemeKey);
        // Removed Pomodoro config error handling
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
  const normalizeNote = (note: any): AppNote => ({ id: String(note.id || Date.now()), title: String(note.title || 'Untitled Note'), icon: note.icon || undefined, coverImageUrl: note.coverImageUrl || undefined, content: String(note.content || ''), category: String(note.category || 'general'), tags: Array.isArray(note.tags) ? note.tags.map(String) : [], createdAt: String(note.createdAt || new Date().toISOString()), updatedAt: note.updatedAt ? String(note.updatedAt) : new Date().toISOString(), versions: Array.isArray(note.versions) ? note.versions.map((v: any) => ({ timestamp: String(v.timestamp || new Date().toISOString()), content: String(v.content || '') })) : [], links: Array.isArray(note.links) ? note.links.map((l: any) => ({ targetTitle: String(l.targetTitle || '') })) : parseNoteLinks(String(note.content || '')), projectId: note.projectId || null });
  const normalizeTask = (task: any): AppTask => ({ id: String(task.id || Date.now()), title: String(task.title || 'Untitled Task'), icon: task.icon || undefined, completed: typeof task.completed === 'boolean' ? task.completed : false, priority: String(task.priority || 'medium'), dueDate: String(task.dueDate || ''), category: String(task.category || 'general'), subtasks: Array.isArray(task.subtasks) ? task.subtasks.map((st: any): AppSubtask => ({ id: String(st.id || Date.now().toString() + Math.random().toString(36).substring(2, 9)), title: String(st.title || 'Subtask'), completed: typeof st.completed === 'boolean' ? st.completed : false })) : [], createdAt: String(task.createdAt || new Date().toISOString()), projectId: task.projectId || null, description: task.description || undefined, htmlDescription: task.htmlDescription || undefined });

  useEffect(() => { 
    if (!isInitialLoadComplete) return; 
    try { 
      const appData: AppDataType = { 
        notes, 
        tasks, 
        loreEntries, 
        projects, 
        userTemplates, 
        plotOutlines, 
        activeTheme: activeThemeKey, 
        // pomodoroConfig, // Removed pomodoroConfig
        userPreferences 
      }; 
      localStorage.setItem('smartNotesAppData', JSON.stringify(appData)); 
      console.log("App data saved to localStorage."); 
      saveAppDataToServer(appData).then(success => { 
        if (!success) console.warn("saveAppDataToServer (no-op) reported an issue."); 
      }); 
    } catch (e) { 
      console.error("Failed to save data to localStorage:", e); 
    } 
  }, [notes, tasks, loreEntries, projects, userTemplates, plotOutlines, activeThemeKey, /* pomodoroConfig, */ userPreferences, isInitialLoadComplete]); // Removed pomodoroConfig from dependencies
  

  // Removed Pomodoro Timer Logic useEffect and handler functions (handleStartPomodoro, handlePausePomodoro, handleResetPomodoro, handleSkipPomodoro)


  // Placeholder navItems, actual items would be defined based on app structure
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'notes', label: 'Notes', icon: StickyNote, path: '/notes' },
    { id: 'tasks', label: 'Tasks', icon: Check, path: '/tasks' },
    { id: 'aiwriter', label: 'AI Writer', icon: Edit3, path: '/ai-writer' },
    { id: 'lore', label: 'Lore', icon: BookOpen, path: '/lore' },
    { id: 'plot', label: 'Plot Outline', icon: PlotIcon, path: '/plot-outline' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];
  
  // Dummy handlers for props required by Header/Sidebar, replace with actual logic
  const handleProjectSelect = (projectId: string) => { console.log("Project selected:", projectId); setActiveProjectId(projectId); };
  const handleCreateProject = (projectName: string) => { console.log("Create project:", projectName); /* ... actual logic ... */ return Promise.resolve(true); };
  const handleThemeChange = (themeKey: string) => { console.log("Theme change:", themeKey); setActiveThemeKey(themeKey); /* ... actual logic ... */ };


  return (
    <div className="flex flex-col h-full">
       <Header 
        navItems={navItems}
        activeProjectId={activeProjectId}
        projects={projects}
        onProjectSelect={handleProjectSelect}
        onCreateProject={handleCreateProject}
        activeThemeKey={activeThemeKey}
        onThemeChange={handleThemeChange}
        userApiKey={userPreferences.customGeminiApiKey}
        isSidebarOpen={isAppSidebarOpen} // Use app's own sidebar state
        onToggleSidebar={handleToggleAppSidebar} 
        onNavigate={handleNavigate}
      />
      <div className="flex flex-1 pt-16"> {/* Adjust pt-16 if Header height changes */}
        <Sidebar 
            navItems={navItems} 
            isSidebarOpen={isAppSidebarOpen} // Use app's own sidebar state
            onNavigate={handleNavigate} 
        />
        <main className={`flex-1 p-4 overflow-y-auto ${isAppSidebarOpen ? 'md:ml-64' : ''} transition-all duration-300`}> {/* Changed to md:ml-64 for consistency */}
          <Routes>
            <Route path="/" element={<ActualDashboardPage />} />
            <Route path="/notes" element={
                <div>
                    <h1 className="text-2xl font-bold">Notes Page</h1>
                     {/* Example: Display notes */}
                    <ul className="mt-4 space-y-2">
                        {notes.map(note => (
                            <NoteItem key={note.id} note={note} onDelete={() => console.log("Delete", note.id)} onView={() => console.log("View", note.id)} />
                        ))}
                    </ul>
                    {/* Removed Pomodoro Test UI */}
                </div>
            } />
            <Route path="/tasks" element={<TaskList tasks={tasks} setTasks={setTasks} onOpenTaskModal={() => setShowTaskModal(true)} />} />
            <Route path="/ai-writer" element={<AiWriter />} />
            <Route path="/lore" element={<WorldAnvilManager loreEntries={loreEntries} setLoreEntries={setLoreEntries} activeProjectId={activeProjectId} />} />
            <Route path="/plot-outline" element={<PlotOutlineManager nodes={plotOutlines} setNodes={setPlotOutlines} activeProjectId={activeProjectId} />} />
            <Route path="/settings" element={<AppSettingsPage userPreferences={userPreferences} setUserPreferences={setUserPreferences} />} />
            {/* Add other routes here */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
      {/* Modals and other global UI elements */}
      {showNoteModal && <NoteModal currentNoteData={currentNoteData} editingNoteId={editingNoteId} projects={projects} activeProjectId={activeProjectId} onClose={() => setShowNoteModal(false)} onSave={() => { /* save logic */ }} />}
      {showTaskModal && <TaskModal currentTaskData={currentTaskData} projects={projects} activeProjectId={activeProjectId} onClose={() => setShowTaskModal(false)} onSave={() => { /* save logic */ }} />}
      {showViewNoteModal && noteToView && <ViewNoteModal note={noteToView} onClose={() => setShowViewNoteModal(false)} onEdit={() => {}} onDelete={() => {}} />}
      {showAiSubtaskModal && taskForSubtaskGeneration && <AiSubtaskSuggestionModal task={taskForSubtaskGeneration} suggestedSubtasks={aiSuggestedSubtasks} isLoading={isGeneratingSubtasks} error={subtaskGenerationError} onClose={() => setShowAiSubtaskModal(false)} onAddSubtasks={() => {}} />}
      
      {/* <BottomNavBar onNavigate={handleNavigate} /> */}
    </div>
  );
};

const NoteTaskApp: React.FC<NoteTaskAppProps> = (props) => (
  <Router>
    <NoteTaskAppContent {...props} />
  </Router>
);

export default NoteTaskApp;