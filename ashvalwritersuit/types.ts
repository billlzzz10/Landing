
export interface OperationMode {
  value: string;
  label: string;
  systemInstruction: string;
  userPromptFormatter: (input: string, contextData?: any) => string; 
}

export interface Session {
  timestamp: string;
  mode: string;
  input: string;
  output: string;
}

export type NotePriority = 'none' | 'low' | 'medium' | 'high';

export interface NoteVersion {
  timestamp: string;
  content: string; // Display content (potentially HTML)
  rawMarkdownContent: string; // Always store raw markdown
}

export interface Project {
  id: string;
  name: string;
  genre?: string; 
  description?: string; 
  createdAt: string;
  updatedAt?: string; // Added for "Last Modified"
}

export interface AppNote {
  id: number;
  title:string;
  icon?: string;
  content: string; // For storing parsed HTML or as fallback
  rawMarkdownContent: string; // Source of truth for Markdown content
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  versions?: NoteVersion[];
  projectId?: string | null; 
}

export interface AppSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface AppTask {
  id: number;
  title: string;
  icon?: string;
  completed: boolean;
  priority: string; 
  dueDate: string;
  category: string;
  subtasks: AppSubtask[]; 
  createdAt: string;
  projectId?: string | null; 
}

export interface NoteTemplate {
  id: string;
  name: string;
  content: string;
}

export interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

export interface PomodoroConfig {
  work: number; // minutes
  shortBreak: number; // minutes
  longBreak: number; // minutes
  rounds: number;
}

export type CharacterRole = "Protagonist" | "Antagonist" | "Anti-hero" | "Supporting" | "Mentor" | "Ally" | "Enemy" | "Family" | "Love Interest" | "Minor" | "Other";

export type RelationshipType = 
  | "Ally" 
  | "Enemy" 
  | "Friend"
  | "Rival" 
  | "Family (Sibling)" 
  | "Family (Parent)" 
  | "Family (Child)"
  | "Family (Spouse)"
  | "Family (Other)"
  | "Mentor" 
  | "Mentee"
  | "Romantic Interest" 
  | "Complicated"
  | "Neutral"
  | "Servant"
  | "Master"
  | "Acquaintance"
  | "Other";


export interface CharacterRelationship {
  targetCharacterId: string; 
  targetCharacterName?: string; 
  relationshipType: RelationshipType | string; 
  description?: string; 
}


export interface LoreEntry {
  id: string;
  title: string;
  type: 'Character' | 'Place' | 'Item' | 'Concept' | 'Event' | 'Other' | 'ArcanaSystem'; 
  content: string; 
  tags: string[];
  createdAt: string;
  projectId?: string | null; 

  // Character-specific fields
  role?: CharacterRole | string; 
  characterArcana?: string[]; 
  relationships?: CharacterRelationship[];
  age?: number | string;
  gender?: string;
  status?: string; // e.g., Active, Draft, Deceased
  avatarUrl?: string; // URL to character image/avatar

  // Magic System specific fields
  rules?: string;
  limitations?: string;
  manifestations?: string;

  customFields?: Record<string, string>;
}

export interface WritingGoal {
  id: string;
  description: string; 
  target: number; 
  current: number;
  unit: 'words' | 'scenes' | 'tasks';
  deadline?: string;
  completed: boolean;
}

export interface PlotOutlineNode {
  id: string;
  text: string;
  order: number; 
  parentId: string | null; 
  childrenIds: string[]; 
  linkedNoteId?: number | null;
  linkedLoreEntryId?: string | null;
  projectId?: string | null;
  createdAt: string;
  isExpanded?: boolean; 
}

export interface UserPreferences {
  notificationPreferences: NotificationPreferences;
  aiWriterPreferences: AiWriterPreferences; 
  selectedFontFamily?: string;
}

export interface NotificationPreferences {
  taskReminders: boolean; 
  projectUpdates: boolean; 
}

export interface AiWriterPreferences {
  repetitionThreshold: number; 
  autoAddLoreFromAi?: boolean; // New preference
  autoAnalyzeScenes?: boolean; // New preference
  contextualAiMenuStyle?: 'simple' | 'full'; // New preference
}

export type ScenePurpose = "advance-plot" | "character-development" | "world-building" | "reveal" | "foreshadowing" | "action" | "dialogue" | "";

export interface SceneCreatorFormData {
  title: string;
  chapter?: string; 
  sceneNumber?: string;
  settingLocation?: string;
  timeOfDay?: string;
  weather?: string;
  description: string;
  charactersInvolved: string[]; 
  povCharacter: string; 
  emotionalArc?: string; 
  conflictType?: string;
  keyPlotPoints?: string;
  foreshadowing?: string;
  arcanaElements: string[]; 
  purpose: ScenePurpose;
  advancedYaml: string;
}

// Graph View Types
export interface GraphNode {
  id: string; // Corresponds to LoreEntry ID
  label: string;
  type: LoreEntry['type'];
  x: number;
  y: number;
  color?: string; // Optional: for styling based on type
  rawEntity: LoreEntry; // Store the original entity for easy access
}

export interface GraphEdge {
  id: string; // e.g., sourceId-targetId-type
  source: string; // Source LoreEntry ID
  target: string; // Target LoreEntry ID
  label?: string; // Relationship type
}


declare global {
  interface Window {
    marked: {
      parse: (markdownString: string, options?: object) => string;
    };
    pdfjsLib: {
      GlobalWorkerOptions: {
        workerSrc: string;
      };
      getDocument: (src: string | URL | Uint8Array | { data: Uint8Array, [key: string]: any }) => {
        promise: Promise<{
          numPages: number;
          getPage: (pageNumber: number) => Promise<{
            getTextContent: () => Promise<{
              items: Array<{ str: string; dir: string; width: number; height: number; transform: number[]; fontName: string; hasEOL: boolean; [key: string]: any; }>;
              styles: { [key: string]: any; };
            }>;
            getViewport: (options: { scale: number; }) => { width: number; height: number; };
            render: (params: any) => { promise: Promise<void> };
            [key: string]: any;
          }>;
          [key: string]: any;
        }>;
      };
      version?: string;
      [key: string]: any;
    };
    mammoth: {
      extractRawText: (options: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string; messages: any[] }>;
      convertToHtml: (options: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string; messages: any[] }>;
      [key: string]: any;
    };
    YAML: { 
        parse: (str: string, options?: any) => any;
        stringify: (value: any, options?: any) => string;
    };
  }
}