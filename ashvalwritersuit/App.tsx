
import React from 'react';
import { Routes, Route, Navigate, useLocation, NavLink } from 'react-router-dom';
import Sidebar from './Sidebar'; 
import HomePage from './HomePage'; 
import DashboardPage from './DashboardPage';
import NotesPage from './NotesPage';
import CharactersPage from './CharactersPage';
import MagicSystemsPage from './MagicSystemsPage';
import WorldItemsPage from './WorldItemsPage';
import PlotPage from './PlotPage';
import AIAssistPage from './AIAssistPage';
import TasksFocusPage from './TasksFocusPage';
import GraphViewPage from './GraphViewPage';
import DictionaryPage from './DictionaryPage';
import SettingsPage from './SettingsPage';
import LoreOverviewPage from './LoreOverviewPage'; 
import { AppNote, AppTask, LoreEntry, Project, PlotOutlineNode, PomodoroConfig, UserPreferences } from './types'; 
import { AppTheme, NavItemDefinition } from './NoteTaskApp'; 
import ProjectSelector from './ProjectSelector';
import ThemeSelector from './ThemeSelector';
import { BookOpen, Menu, X, PlusSquare, UserCircle2, Bell } from 'lucide-react'; // Changed Aperture to BookOpen for Inkweaver


interface AppProps {
  // State
  notes: AppNote[];
  tasks: AppTask[];
  loreEntries: LoreEntry[];
  projects: Project[];
  plotOutlines: PlotOutlineNode[];
  activeProjectId: string | null;
  currentTheme: AppTheme;
  themes: Record<string, AppTheme>;
  appVersion: string;
  pomodoroConfig: PomodoroConfig;
  pomodoroTempConfig: PomodoroConfig;
  pomodoroCurrentMode: 'work' | 'shortBreak' | 'longBreak';
  pomodoroTimeLeft: number;
  pomodoroIsActive: boolean;
  pomodoroCurrentRound: number;
  showAiWriterSection: boolean; 
  operationModeAi: string;
  customSystemInstructionAi: string;
  inputPromptAi: string;
  aiResponse: string;
  isLoadingAi: boolean;
  errorAi: string | null;
  inputCharCountAi: number;
  responseCharCountAi: number;
  defaultCustomModeSIAi: string;
  learnedWordsAi: Set<string>;
  userPreferences: UserPreferences;
  graphNodes: any[]; 
  graphEdges: any[]; 


  // Handlers from NoteTaskApp
  setActiveTheme: (themeKey: string) => void;
  setActiveProjectIdState: (projectId: string | null) => void; 
  createProjectHandler: (projectName: string) => string; 

  // Note Handlers
  handleOpenAddNoteModal: () => void;
  handleViewNote: (note: AppNote) => void;
  handleDeleteNote: (id: number) => void;
  handleAnalyzeNoteWithAi: (note: AppNote) => void;
  
  // Task Handlers
  handleOpenAddTaskModal: () => void;
  handleToggleTask: (id: number) => void;
  handleDeleteTask: (id: number) => void;
  handleToggleSubtask: (taskId: number, subtaskId: string) => void;
  handleAiDecomposeTaskRequest: (task: AppTask) => void;
  
  // Lore Handlers
  setLoreEntries: React.Dispatch<React.SetStateAction<LoreEntry[]>>; 

  // Plot Outline Handlers
  setPlotOutlines: React.Dispatch<React.SetStateAction<PlotOutlineNode[]>>;

  // AI Writer Handlers
  setOperationModeAi: (mode: string) => void;
  setCustomSystemInstructionAi: (instruction: string) => void;
  setInputPromptAi: (prompt: string) => void;
  clearInputPromptAi: () => void;
  handleSubmitAiWriter: () => Promise<void>;
  handleSaveAiWriterResponseAsNote: () => void;
  aiResponseRef: React.RefObject<HTMLDivElement>;
  handleAutoCreateLoreEntriesFromAiWriter: (entries: Array<{ title: string; type: LoreEntry['type']; }>) => void;

  // Pomodoro Handlers
  handlePomodoroStartPause: () => void;
  handlePomodoroResetCurrent: () => void;
  handlePomodoroSkip: () => void;
  handlePomodoroConfigChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePomodoroSaveConfig: () => void;
  formatPomodoroTime: (seconds: number) => string;

  // Dictionary Handlers
  setLearnedWordsAi: React.Dispatch<React.SetStateAction<Set<string>>>;

  // Settings Handlers
  setUserPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
  handleUpdateProjectDetails: (projectId: string, details: Partial<Pick<Project, 'name' | 'genre' | 'description'>>) => void;

  // Util
  getCategoryIcon: (category: string) => JSX.Element;
  getPriorityColor: (priority: string) => string;

  mainNavItems: NavItemDefinition[]; 
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

const App: React.FC<AppProps> = (props) => {
  const location = useLocation();
  
  const currentRoutePath = location.pathname;
  const activeRouteItem = props.mainNavItems.find(item => item.path === currentRoutePath || (item.path === '/home' && currentRoutePath === '/'));
  const activeRouteId = activeRouteItem ? activeRouteItem.id : 'my-projects';


  return (
    <div className={`flex flex-col min-h-screen font-sans transition-colors duration-300 ${props.currentTheme.bg}`}>
      <header className={`sticky top-0 z-30 ${props.currentTheme.cardBg} shadow-lg border-b ${props.currentTheme.divider}`} style={{ height: 'var(--header-height, 68px)'}}>
        <div className="container mx-auto px-4 sm:px-6 h-full flex justify-between items-center">
          <div className="flex items-center">
            <BookOpen className={`w-8 h-8 mr-3 ${props.currentTheme.accent.replace('bg-','text-')}`} /> {/* Changed Icon */}
            <h1 className={`text-xl font-bold ${props.currentTheme.text}`}>
               Inkweaver
            </h1>
            {/* Desktop Project Selector - Placed here for better flow in Inkweaver design */}
             <nav className="ml-6 hidden md:flex items-center space-x-4 text-sm">
              <ProjectSelector 
                projects={props.projects}
                activeProjectId={props.activeProjectId}
                currentTheme={props.currentTheme}
                onSelectProject={props.setActiveProjectIdState}
                onCreateProject={props.createProjectHandler}
              />
              {/* Placeholder Nav Items (can be made functional later) */}
              {/* <NavLink to="/dashboard" className={`${props.currentTheme.textSecondary} hover:${props.currentTheme.text}`}>แดชบอร์ด</NavLink>
              <NavLink to="/notes" className={`${props.currentTheme.textSecondary} hover:${props.currentTheme.text}`}>คลังของฉัน</NavLink>
              <a href="#" className={`${props.currentTheme.textSecondary} hover:${props.currentTheme.text}`}>ชุมชน</a>
              <a href="#" className={`${props.currentTheme.textSecondary} hover:${props.currentTheme.text}`}>ช่วยเหลือ</a> */}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const newProjectName = prompt("กรุณาใส่ชื่อโปรเจกต์ใหม่:");
                if (newProjectName && newProjectName.trim() !== "") {
                  props.createProjectHandler(newProjectName.trim());
                }
              }}
              className={`${props.currentTheme.button} ${props.currentTheme.buttonText} px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 shadow-sm hover:scale-105 transition-transform`}
              title="สร้างโปรเจกต์ใหม่"
            >
              <PlusSquare size={16} /> สร้างโปรเจกต์ใหม่
            </button>
            <ThemeSelector themes={props.themes} activeTheme={props.currentTheme.name} currentThemeStyles={props.currentTheme} setActiveTheme={props.setActiveTheme} />
            {/* <button className={`${props.currentTheme.textSecondary} hover:${props.currentTheme.text} p-2 rounded-full hover:bg-white/5`} title="การแจ้งเตือน (ตัวอย่าง)">
              <Bell size={20} />
            </button> */}
            <span title="บัญชีผู้ใช้ (ตัวอย่าง)">
              <UserCircle2 className={`w-7 h-7 ${props.currentTheme.textSecondary} opacity-80`} />
            </span>
            <button
              onClick={() => props.setIsMobileMenuOpen(!props.isMobileMenuOpen)}
              className={`p-2 rounded-md ${props.currentTheme.text} md:hidden hover:bg-white/10 focus:outline-none focus:ring-2 ${props.currentTheme.focusRing}`}
              aria-label="เปิดเมนู"
              aria-expanded={props.isMobileMenuOpen}
            >
              {props.isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTabId={activeRouteId} 
          currentTheme={props.currentTheme}
          mainNavItems={props.mainNavItems}
          setIsMobileMenuOpen={props.setIsMobileMenuOpen} 
        />

        {props.isMobileMenuOpen && (
            <div 
                className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden`} 
                onClick={() => props.setIsMobileMenuOpen(false)}
            >
            <nav 
                className={`fixed top-0 left-0 h-full w-64 p-5 space-y-2 ${props.currentTheme.cardBg} shadow-2xl overflow-y-auto transition-transform duration-300 ease-in-out transform ${props.isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`} 
                onClick={(e) => e.stopPropagation()}
                aria-label="เมนูมือถือ"
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className={`${props.currentTheme.text} text-lg font-semibold`}>เมนู</h2>
                    <button onClick={() => props.setIsMobileMenuOpen(false)} className={`${props.currentTheme.textSecondary} p-1`} aria-label="ปิดเมนู"><X size={20}/></button>
                </div>
                 {/* Mobile Project Selector */}
                <div className="mb-4">
                     <ProjectSelector 
                        projects={props.projects}
                        activeProjectId={props.activeProjectId}
                        currentTheme={props.currentTheme}
                        onSelectProject={(id) => { props.setActiveProjectIdState(id); props.setIsMobileMenuOpen(false);}}
                        onCreateProject={(name) => {props.createProjectHandler(name); props.setIsMobileMenuOpen(false);}}
                    />
                </div>
                {props.mainNavItems.map(item => (
                 <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={() => props.setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium
                      ${isActive
                        ? `${props.currentTheme.accent} ${props.currentTheme.accentText} shadow-md`
                        : `${props.currentTheme.textSecondary} hover:${props.currentTheme.inputBg} hover:${props.currentTheme.text} hover:text-opacity-100`
                      }`
                    }
                    aria-current={item.path === currentRoutePath ? "page" : undefined}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${item.path === currentRoutePath || (item.path === '/home' && currentRoutePath === '/') ? props.currentTheme.accentText : props.currentTheme.textSecondary + ' opacity-70'}`} />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                ))}
            </nav>
            </div>
        )}

        <main className={`flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar ${props.currentTheme.contentBg} md:ml-64 pt-[calc(var(--header-height,68px)+1rem)]`}>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} /> 
            <Route path="/home" element={
              <HomePage
                currentTheme={props.currentTheme}
                onCreateProject={props.createProjectHandler}
                onOpenAddNoteModal={props.handleOpenAddNoteModal}
                projects={props.projects}
                activeProjectId={props.activeProjectId}
                setActiveProjectId={props.setActiveProjectIdState}
              />
            } />
            <Route path="/dashboard" element={
              <DashboardPage 
                notes={props.notes}
                tasks={props.tasks}
                loreEntries={props.loreEntries}
                activeProject={props.projects.find(p => p.id === props.activeProjectId)}
                currentTheme={props.currentTheme}
                onQuickAddNote={props.handleOpenAddNoteModal}
                onQuickAddTask={props.handleOpenAddTaskModal}
                onNavigateToTab={(path) => { /* Navigation now handled by NavLink or useNavigate in component */ }} 
              />
            } />
            <Route path="/notes" element={ 
              <NotesPage
                notes={props.notes}
                currentTheme={props.currentTheme}
                onViewNote={props.handleViewNote}
                onDeleteNote={props.handleDeleteNote}
                onAddNote={props.handleOpenAddNoteModal}
                getCategoryIcon={props.getCategoryIcon}
                projects={props.projects}
                activeProjectId={props.activeProjectId}
                onAnalyzeWithAi={props.handleAnalyzeNoteWithAi}
              />
            } />
             <Route path="/lore-overview" element={
              <LoreOverviewPage
                currentTheme={props.currentTheme}
              />
            } />
            <Route path="/characters" element={
              <CharactersPage
                loreEntries={props.loreEntries}
                setLoreEntries={props.setLoreEntries}
                currentTheme={props.currentTheme}
                getCategoryIcon={props.getCategoryIcon}
                projects={props.projects}
                activeProjectId={props.activeProjectId}
              />
            } />
            <Route path="/magic-systems" element={
              <MagicSystemsPage
                loreEntries={props.loreEntries}
                setLoreEntries={props.setLoreEntries}
                currentTheme={props.currentTheme}
                getCategoryIcon={props.getCategoryIcon}
                projects={props.projects}
                activeProjectId={props.activeProjectId}
              />
            } />
            <Route path="/world-items" element={
              <WorldItemsPage
                loreEntries={props.loreEntries}
                setLoreEntries={props.setLoreEntries}
                currentTheme={props.currentTheme}
                getCategoryIcon={props.getCategoryIcon}
                projects={props.projects}
                activeProjectId={props.activeProjectId}
              />
            } />
            <Route path="/plot-outline" element={
              <PlotPage
                plotOutlines={props.plotOutlines}
                setPlotOutlines={props.setPlotOutlines}
                notes={props.notes}
                loreEntries={props.loreEntries}
                currentTheme={props.currentTheme}
                activeProjectId={props.activeProjectId}
                projects={props.projects} 
              />
            } />
             <Route path="/ai-writer" element={
              <AIAssistPage
                showAiWriterSection={props.showAiWriterSection}
                operationMode={props.operationModeAi}
                customSystemInstruction={props.customSystemInstructionAi}
                inputPrompt={props.inputPromptAi}
                aiResponse={props.aiResponse}
                isLoading={props.isLoadingAi}
                error={props.errorAi}
                inputCharCount={props.inputCharCountAi}
                responseCharCount={props.responseCharCountAi}
                defaultCustomModeSI={props.defaultCustomModeSIAi}
                currentTheme={props.currentTheme}
                userPreferences={props.userPreferences}
                activeProjectName={props.activeProjectId ? props.projects.find(p => p.id === props.activeProjectId)?.name : null}
                projectCharacters={props.loreEntries.filter(l => l.type === 'Character' && (l.projectId === props.activeProjectId || !props.activeProjectId))}
                projectArcanaSystems={props.loreEntries.filter(l => (l.type === 'ArcanaSystem' || l.type === 'Concept') && (l.projectId === props.activeProjectId || !props.activeProjectId))}
                onOperationModeChange={(e) => props.setOperationModeAi(e.target.value)}
                onCustomSystemInstructionChange={(e) => props.setCustomSystemInstructionAi(e.target.value)}
                onInputPromptChange={props.setInputPromptAi}
                onClearInput={props.clearInputPromptAi}
                onSubmit={props.handleSubmitAiWriter}
                onCopyResponse={async () => { /* Implemented in AIAssistPage/AiWriter internally */ }}
                onSaveResponseAsNewNote={props.handleSaveAiWriterResponseAsNote}
                aiResponseRef={props.aiResponseRef}
                onAutoCreateLoreEntries={props.handleAutoCreateLoreEntriesFromAiWriter}
              />
            } />
            <Route path="/tasks" element={
              <TasksFocusPage
                tasks={props.tasks}
                currentTheme={props.currentTheme}
                onToggleTask={props.handleToggleTask}
                onDeleteTask={props.handleDeleteTask}
                onAddTask={props.handleOpenAddTaskModal}
                onToggleSubtask={props.handleToggleSubtask}
                onAiDecomposeTaskRequest={props.handleAiDecomposeTaskRequest}
                getPriorityColor={props.getPriorityColor}
                getCategoryIcon={props.getCategoryIcon}
                projects={props.projects}
                activeProjectId={props.activeProjectId}
                pomodoroConfig={props.pomodoroConfig}
                pomodoroTempConfig={props.pomodoroTempConfig}
                pomodoroCurrentMode={props.pomodoroCurrentMode}
                pomodoroTimeLeft={props.pomodoroTimeLeft}
                pomodoroIsActive={props.pomodoroIsActive}
                pomodoroCurrentRound={props.pomodoroCurrentRound}
                onPomodoroStartPause={props.handlePomodoroStartPause}
                onPomodoroResetCurrent={props.handlePomodoroResetCurrent}
                onPomodoroSkip={props.handlePomodoroSkip}
                onPomodoroConfigChange={props.handlePomodoroConfigChange}
                onPomodoroSaveConfig={props.handlePomodoroSaveConfig}
                formatPomodoroTime={props.formatPomodoroTime}
              />
            } />
            <Route path="/graph" element={
              <GraphViewPage
                nodes={props.graphNodes}
                edges={props.graphEdges}
                currentTheme={props.currentTheme}
                onNodeClick={(nodeId) => console.log("Graph node clicked:", nodeId)}
                activeProjectName={props.activeProjectId ? props.projects.find(p => p.id === props.activeProjectId)?.name || 'N/A' : "โปรเจกต์ทั้งหมด"}
              />
            } />
            <Route path="/dictionary" element={
              <DictionaryPage
                learnedWords={props.learnedWordsAi}
                setLearnedWords={props.setLearnedWordsAi}
                currentTheme={props.currentTheme}
              />
            } />
            <Route path="/settings" element={
              <SettingsPage
                currentTheme={props.currentTheme}
                userPreferences={props.userPreferences}
                setUserPreferences={props.setUserPreferences}
                projects={props.projects}
                activeProjectId={props.activeProjectId}
                onUpdateProjectDetails={props.handleUpdateProjectDetails}
              />
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;