
import { AppNote, AppTask, LoreEntry, PomodoroConfig, UserPreferences, Project, UserNoteTemplate, PlotOutlineNode } from '../../../types'; // Added UserNoteTemplate, PlotOutlineNode

console.log("appDataService: Initialized for localStorage-only operation (backend removed).");

export interface AppDataType {
  notes: AppNote[];
  tasks: AppTask[];
  loreEntries: LoreEntry[];
  projects: Project[]; 
  userTemplates: UserNoteTemplate[];
  plotOutlines: PlotOutlineNode[]; // Added plotOutlines
  activeTheme: string;
  pomodoroConfig: PomodoroConfig;
  userPreferences: UserPreferences;
}

export const fetchAppDataFromServer = async (): Promise<AppDataType | null> => {
  console.warn("[appDataService] fetchAppDataFromServer called, but backend is removed. Returning null. App should rely on localStorage.");
  return null; 
};

export const saveAppDataToServer = async (appData: AppDataType): Promise<boolean> => {
  console.warn("[appDataService] saveAppDataToServer called, but backend is removed. Data is persisted in localStorage only. Returning 'true' to indicate no operational failure here.");
  // For future if backend is re-added:
  // try {
  //   const response = await fetch(`${process.env.REACT_APP_BACKEND_API_URL}/api/appdata`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(appData),
  //   });
  //   return response.ok;
  // } catch (error) {
  //   console.error("Error saving app data to server:", error);
  //   return false;
  // }
  return true;
};
