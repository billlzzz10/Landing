



import { AppNote, AppTask, LoreEntry, PomodoroConfig, UserPreferences, Project, PlotOutlineNode } from '../../../types'; // Adjust path as necessary, Added Project, PlotOutlineNode

// Backend URL configuration is no longer needed as backend is removed.
// const API_SERVICE_PATH = "/api"; 
// const DEFAULT_BACKEND_URL_FOR_DEV = `http://localhost:3001${API_SERVICE_PATH}`;
// let apiBaseUrl: string; ... (all apiBaseUrl logic removed)

console.log("appDataService: Initialized for localStorage-only operation (backend removed).");

export interface AppDataType {
  notes: AppNote[];
  tasks: AppTask[];
  loreEntries: LoreEntry[];
  projects: Project[]; 
  plotOutlines: PlotOutlineNode[]; // Added plotOutlines
  activeTheme: string;
  pomodoroConfig: PomodoroConfig;
  userPreferences: UserPreferences;
}

export const fetchAppDataFromServer = async (): Promise<AppDataType | null> => {
  console.warn("[appDataService] fetchAppDataFromServer called, but backend is removed. Returning null. App should rely on localStorage.");
  // This function used to fetch from a backend. Now, it signifies no server data.
  // The main application logic in NoteTaskApp.tsx should handle this by primarily using localStorage.
  return null; 
};

export const saveAppDataToServer = async (appData: AppDataType): Promise<boolean> => {
  console.warn("[appDataService] saveAppDataToServer called, but backend is removed. Data is persisted in localStorage only. Returning 'true' to indicate no operational failure here.");
  // This function used to save to a backend. Now, it's a no-op for server interaction.
  // Returning true to not break existing flows that might expect a success state.
  return true;
};