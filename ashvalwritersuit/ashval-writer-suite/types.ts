// Basic type definitions based on NoteTaskApp.tsx
// These should be expanded based on actual data structures.

export interface AppNote {
  id: string; // Changed from any
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  versions: NoteVersion[];
  links: NoteLink[];
  projectId: string | null;
  icon?: string;
  coverImageUrl?: string;
}

export interface AppTask {
  id: string; // Changed from any
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | string; // Allow string for flexibility if needed
  dueDate: string; // Keep as string, can be parsed
  category: string;
  subtasks: AppSubtask[];
  createdAt: string;
  projectId: string | null;
  icon?: string;
  description?: string;
  htmlDescription?: string;
}

export interface AppSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface OperationMode {
    value: string;
    label: string;
    systemInstruction: string;
    icon?: React.ElementType;
    description?: string;
}

export interface ChatTurn {
  role: 'user' | 'model';
  parts: { text: string }[];
  timestamp?: number;
}

// Removed PomodoroConfig interface

export interface LoreEntry {
  id: string;
  title: string;
  type: string; // e.g., Character, Location, Item, Concept, Event
  content: string;
  tags: string[];
  createdAt: string;
  projectId: string | null;
  // Specific fields for characters
  role?: 'protagonist' | 'antagonist' | 'supporting' | 'minor' | string;
  characterArcana?: string[]; // For tarot archetypes or similar
  relationships?: Array<{
      targetCharacterId: string;
      targetCharacterName?: string; // Denormalized for easier display
      relationshipType: string; // e.g., Ally, Enemy, Family, Mentor
      description?: string;
  }>;
  coverImageUrl?: string;
}

export interface NoteVersion {
  timestamp: string;
  content: string;
}

export interface NotificationPreferences {
  taskReminders: boolean;
  projectUpdates: boolean;
}

export interface AiWriterPreferences {
  repetitionThreshold: number; // How many times a phrase can be repeated before warning
  autoAddLoreFromAi: boolean; // Automatically suggest adding new entities from AI responses to Lore
  autoAnalyzeScenes: boolean; // Automatically provide scene analysis (pacing, tension)
  contextualAiMenuStyle: 'simple' | 'advanced'; // Controls complexity of AI context menu
}

export interface UserPreferences {
  notificationPreferences: NotificationPreferences;
  aiWriterPreferences: AiWriterPreferences;
  selectedFontFamily: string;
  customGeminiApiKey?: string; 
  selectedAiModel: string;
}

export interface Project {
  id: string;
  name: string;
  genre?: string;
  description?: string;
  createdAt: string;
  isArchived: boolean;
  lastModified: string;
  summary?: string; // Auto-generated or user-defined brief summary
}

export interface UserNoteTemplate {
  id: string;
  name: string;
  content: string; // Template content, can include placeholders
  icon?: string;
}

// System Note Template (doesn't need an ID from storage)
export interface NoteTemplate {
  name: string;
  content: string;
  icon?: string;
  category?: string; // Optional category for better organization
  description?: string; // Brief explanation of the template
}


export interface PlotOutlineNode {
    id: string;
    title: string;
    content?: string;         // Detailed description or summary of this plot point
    parentId?: string | null; // ID of the parent node, null for root nodes
    childrenIds?: string[];   // Ordered list of child node IDs
    type?: string;            // E.g., 'Act', 'Scene', 'Beat', 'Inciting Incident', 'Climax'
    color?: string;           // Optional color coding for visual organization
    status?: string;          // E.g., 'Draft', 'Revised', 'Final'
    order?: number;           // Explicit order among siblings if not relying on childrenIds array order
    // Additional metadata like associated characters, locations, emotional value, etc.
    linkedCharacters?: string[]; // IDs of LoreEntry items (characters)
    linkedLocations?: string[];  // IDs of LoreEntry items (locations)
    estimatedDuration?: string; // For scenes, e.g., "2 pages", "5 minutes"
    povCharacterId?: string;    // Point-of-view character for this node
}


export interface NoteLink {
  targetTitle: string; // The title of the note being linked to
  // displayText?: string; // Optional different display text, e.g. [[Actual Title|Display Text]]
}

export interface AppTheme {
  key: string;
  name: string;
  isDark: boolean;
  colors: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    // ... other specific colors like sidebar, header, cards
  };
  fontFamily?: string;
}


export interface ExportTemplate {
    id: string;
    name: string;
    template: string; // Handlebars or similar template string
    type: 'note' | 'project'; // Specifies if it's for single notes or whole projects
    fileType?: 'txt' | 'md' | 'html' | 'json'; // Default or suggested file type
    description?: string;
}


export interface AppDataType {
  notes: AppNote[];
  tasks: AppTask[];
  loreEntries: LoreEntry[];
  projects: Project[];
  userTemplates: UserNoteTemplate[];
  plotOutlines: PlotOutlineNode[];
  activeTheme: string; // Assuming theme is identified by a key string
  // pomodoroConfig: PomodoroConfig; // Removed PomodoroConfig
  userPreferences: UserPreferences;
}