
import React, { useState, useEffect } from 'react';
import { AppTheme } from './NoteTaskApp'; 
import { UserPreferences, NotificationPreferences, AiWriterPreferences, Project } from './types'; 
import { FONT_FAMILIES } from './constants';
import { Settings, Bell, CheckCircle, XCircle, Edit3, Save, Package, Map, Palette as PaletteIcon, Zap, Type as FontIcon, Monitor, SlidersHorizontal, Brain } from 'lucide-react'; 

interface AppSettingsPageProps {
  currentTheme: AppTheme;
  userPreferences: UserPreferences;
  setUserPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
  projects: Project[];
  activeProjectId: string | null;
  onUpdateProjectDetails: (projectId: string, details: Partial<Pick<Project, 'name' | 'genre' | 'description'>>) => void;
}

type SettingsTab = 'display' | 'ai' | 'notifications' | 'account' | 'sync';


const AppSettingsPage: React.FC<AppSettingsPageProps> = ({ 
  currentTheme, 
  userPreferences, 
  setUserPreferences,
  projects,
  activeProjectId,
  onUpdateProjectDetails
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('display');
  const [editableProjectDetails, setEditableProjectDetails] = useState<Partial<Pick<Project, 'name' | 'genre' | 'description'>>>({});
  const [currentProjectName, setCurrentProjectName] = useState('');


  useEffect(() => {
    const activeProject = projects.find(p => p.id === activeProjectId);
    if (activeProject) {
      setEditableProjectDetails({
        name: activeProject.name,
        genre: activeProject.genre || '',
        description: activeProject.description || '',
      });
      setCurrentProjectName(activeProject.name);
    } else {
      setEditableProjectDetails({});
      setCurrentProjectName('');
    }
  }, [activeProjectId, projects]);

  const handleProjectDetailChange = (field: keyof Pick<Project, 'name' | 'genre' | 'description'>, value: string) => {
    setEditableProjectDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProjectDetails = () => {
    if (activeProjectId && editableProjectDetails.name?.trim()) {
      onUpdateProjectDetails(activeProjectId, {
        name: editableProjectDetails.name.trim(),
        genre: editableProjectDetails.genre?.trim() || undefined,
        description: editableProjectDetails.description?.trim() || undefined,
      });
      alert(`บันทึกรายละเอียดโปรเจกต์ "${editableProjectDetails.name.trim()}" แล้ว`);
    } else if (activeProjectId && !editableProjectDetails.name?.trim()){
      alert('ชื่อโปรเจกต์ไม่สามารถเว้นว่างได้');
    }
  };

  const handleToggleNotification = (key: keyof NotificationPreferences) => {
    setUserPreferences(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [key]: !prev.notificationPreferences[key],
      },
    }));
  };

  const handleAiWriterPreferenceChange = (key: keyof AiWriterPreferences, value: any) => {
    setUserPreferences(prev => ({
      ...prev,
      aiWriterPreferences: {
        ...prev.aiWriterPreferences,
        [key]: value,
      },
    }));
  };
  
  const handleFontFamilyChange = (fontFamilyValue: string) => {
    setUserPreferences(prev => ({
      ...prev,
      selectedFontFamily: fontFamilyValue,
    }));
  };

  const ToggleSwitch: React.FC<{ isEnabled: boolean; onToggle: () => void; labelId: string;}> = ({ isEnabled, onToggle, labelId }) => (
    <button
      role="switch"
      aria-checked={isEnabled}
      onClick={onToggle}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${currentTheme.inputBg} ${currentTheme.focusRing} ${isEnabled ? currentTheme.accent : 'bg-gray-400 dark:bg-gray-600'}`}
      aria-labelledby={labelId}
    >
      <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
  
  const selectArrowSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='${currentTheme.text === 'text-white' || currentTheme.text === 'text-slate-200' || currentTheme.text === 'text-gray-100' ? '%23CBD5E1' : '%236B7280'}'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E`;
  const optionBgClass = currentTheme.name.toLowerCase().includes('light') ? 'bg-gray-100 text-gray-800' : `${currentTheme.inputBg} ${currentTheme.inputText}`;
  const inputBaseClass = `w-full p-2.5 rounded-lg ${currentTheme.inputBg} ${currentTheme.inputText} ${currentTheme.inputBorder} focus:outline-none focus:ring-2 ${currentTheme.accent.replace('bg-', 'focus:ring-')} text-sm`;
  const selectBaseClass = `${inputBaseClass} appearance-none bg-no-repeat bg-right-2.5`;

  const settingsTabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'display', label: 'การแสดงผล', icon: PaletteIcon },
    { id: 'ai', label: 'ตั้งค่า AI', icon: Zap },
    { id: 'notifications', label: 'การแจ้งเตือน', icon: Bell },
    // { id: 'account', label: 'บัญชีผู้ใช้', icon: UserCircle2 }, // Placeholder
    // { id: 'sync', label: 'การซิงค์ข้อมูล', icon: RefreshCw }, // Placeholder
  ];

  return (
    <div className="py-6">
      <h2 className={`text-3xl font-semibold ${currentTheme.text} mb-8 text-center flex items-center justify-center`}>
        <Settings className={`w-8 h-8 mr-3 ${currentTheme.accent.replace('bg-','text-')}`} /> ตั้งค่า
      </h2>

      <div className={`md:flex gap-6`}>
        {/* Tabs Navigation (Desktop) */}
        <div className={`hidden md:block md:w-1/4 ${currentTheme.cardBg} p-4 rounded-xl shadow-lg self-start`}>
          <nav className="space-y-1.5">
            {settingsTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-all
                  ${activeTab === tab.id 
                    ? `${currentTheme.accent} ${currentTheme.accentText} shadow-sm` 
                    : `${currentTheme.textSecondary} hover:${currentTheme.inputBg} hover:${currentTheme.text}`
                  }`}
              >
                <tab.icon size={18} className={`${activeTab === tab.id ? currentTheme.accentText : `${currentTheme.textSecondary} opacity-80`}`} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tabs Navigation (Mobile) */}
        <div className="md:hidden mb-6">
          <select 
            value={activeTab} 
            onChange={(e) => setActiveTab(e.target.value as SettingsTab)}
            className={`${selectBaseClass} w-full text-md`}
            style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1.25em' }}
          >
            {settingsTabs.map(tab => (
              <option key={tab.id} value={tab.id} className={optionBgClass}>{tab.label}</option>
            ))}
          </select>
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          {activeTab === 'display' && (
            <div className={`${currentTheme.cardBg} p-6 rounded-xl shadow-lg`}>
              <h3 className={`text-xl font-semibold ${currentTheme.text} mb-5 border-b pb-3 ${currentTheme.divider} flex items-center`}>
                <PaletteIcon className={`w-5 h-5 mr-2.5 ${currentTheme.accent.replace('bg-','text-')}`} />
                การแสดงผลและธีม
              </h3>
              <div className="space-y-5">
                 <div>
                    <label htmlFor="font-family-select" className={`block text-sm font-medium ${currentTheme.textSecondary} mb-1.5 flex items-center`}>
                      <FontIcon size={16} className="mr-2 opacity-70"/> รูปแบบตัวอักษร (Font):
                    </label>
                    <select
                        id="font-family-select"
                        value={userPreferences.selectedFontFamily || FONT_FAMILIES[0].value}
                        onChange={(e) => handleFontFamilyChange(e.target.value)}
                        className={`${selectBaseClass}`}
                        style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1.25em' }}
                    >
                        {FONT_FAMILIES.map(font => (
                            <option key={font.value} value={font.value} className={optionBgClass}>
                                {font.label}
                            </option>
                        ))}
                    </select>
                    <p className={`text-xs ${currentTheme.textSecondary} opacity-80 mt-1`}>
                        รูปแบบตัวอักษรที่เลือกจะมีผลกับทั้งแอปพลิเคชัน
                    </p>
                 </div>
                 <div>
                    <p className={`text-sm font-medium ${currentTheme.textSecondary} mb-1.5 flex items-center`}>
                        <Monitor size={16} className="mr-2 opacity-70"/> การตั้งค่าการแสดงผลเพิ่มเติม:
                    </p>
                    <p className={`${currentTheme.textSecondary} text-xs`}>
                        (ตัวอย่าง: ขนาดตัวอักษร, ความหนาแน่นของ UI จะถูกเพิ่มในอนาคต)
                    </p>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className={`${currentTheme.cardBg} p-6 rounded-xl shadow-lg`}>
                <h3 className={`text-xl font-semibold ${currentTheme.text} mb-5 border-b pb-3 ${currentTheme.divider} flex items-center`}>
                    <Zap className={`w-5 h-5 mr-2.5 ${currentTheme.accent.replace('bg-','text-')}`} />
                    การตั้งค่าผู้ช่วย AI
                </h3>
                <div className="space-y-5">
                    <div>
                        <label htmlFor="repetition-threshold" className={`block text-sm font-medium ${currentTheme.textSecondary} mb-1.5`}>
                            แจ้งเตือนคำซ้ำเมื่อใช้เกิน (ครั้ง):
                        </label>
                        <input
                            type="number"
                            id="repetition-threshold"
                            min="1" max="10" step="1"
                            value={userPreferences.aiWriterPreferences.repetitionThreshold}
                            onChange={(e) => handleAiWriterPreferenceChange('repetitionThreshold', parseInt(e.target.value, 10))}
                            className={`${inputBaseClass} w-28`}
                        />
                    </div>
                     <div className="flex items-center justify-between py-1">
                        <span id="ai-auto-lore-label" className={`text-sm ${currentTheme.textSecondary} flex items-center`}> <Brain size={16} className="mr-2 opacity-70"/> AI สร้างข้อมูลโลกอัตโนมัติจาก [[notation]] และ @mention</span>
                        <ToggleSwitch
                            isEnabled={!!userPreferences.aiWriterPreferences.autoAddLoreFromAi}
                            onToggle={() => handleAiWriterPreferenceChange('autoAddLoreFromAi', !userPreferences.aiWriterPreferences.autoAddLoreFromAi)}
                            labelId="ai-auto-lore-label"
                        />
                    </div>
                     <div className="flex items-center justify-between py-1">
                        <span id="ai-auto-analyze-label" className={`text-sm ${currentTheme.textSecondary} flex items-center`}> <SlidersHorizontal size={16} className="mr-2 opacity-70"/> AI วิเคราะห์ฉากใหม่ๆ อัตโนมัติ (ทดลอง)</span>
                        <ToggleSwitch
                            isEnabled={!!userPreferences.aiWriterPreferences.autoAnalyzeScenes}
                            onToggle={() => handleAiWriterPreferenceChange('autoAnalyzeScenes', !userPreferences.aiWriterPreferences.autoAnalyzeScenes)}
                            labelId="ai-auto-analyze-label"
                        />
                    </div>
                    <div>
                        <label htmlFor="contextual-menu-style" className={`block text-sm font-medium ${currentTheme.textSecondary} mb-1.5`}>
                            รูปแบบเมนู AI ตามบริบท:
                        </label>
                        <select
                            id="contextual-menu-style"
                            value={userPreferences.aiWriterPreferences.contextualAiMenuStyle || 'simple'}
                            onChange={(e) => handleAiWriterPreferenceChange('contextualAiMenuStyle', e.target.value)}
                            className={`${selectBaseClass} w-full sm:w-1/2`}
                            style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1.25em' }}
                        >
                            <option value="simple" className={optionBgClass}>แบบง่าย (Simple)</option>
                            <option value="full" className={optionBgClass}>แบบเต็ม (Full)</option>
                        </select>
                    </div>
                </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className={`${currentTheme.cardBg} p-6 rounded-xl shadow-lg`}>
                <h3 className={`text-xl font-semibold ${currentTheme.text} mb-5 border-b pb-3 ${currentTheme.divider} flex items-center`}>
                    <Bell className={`w-5 h-5 mr-2.5 ${currentTheme.accent.replace('bg-','text-')}`} />
                    การแจ้งเตือน
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                        <span id="task-reminder-label" className={`text-sm ${currentTheme.textSecondary}`}>เปิดการแจ้งเตือน Pomodoro / Task</span>
                        <ToggleSwitch 
                            isEnabled={userPreferences.notificationPreferences.taskReminders} 
                            onToggle={() => handleToggleNotification('taskReminders')}
                            labelId="task-reminder-label"
                        />
                    </div>
                     <div className="flex items-center justify-between py-2">
                        <span id="project-updates-label" className={`text-sm ${currentTheme.textSecondary}`}>เปิดการแจ้งเตือนอัปเดตโปรเจกต์ (ตัวอย่าง)</span>
                        <ToggleSwitch 
                            isEnabled={userPreferences.notificationPreferences.projectUpdates} 
                            onToggle={() => handleToggleNotification('projectUpdates')}
                            labelId="project-updates-label"
                        />
                    </div>
                </div>
            </div>
          )}
        </div>
      </div>

      {/* Project Specific Settings */}
       {activeProjectId && (
        <div className={`${currentTheme.cardBg} p-6 rounded-xl shadow-lg mt-8`}>
            <h3 className={`text-xl font-semibold ${currentTheme.text} mb-5 border-b pb-3 ${currentTheme.divider} flex items-center`}>
                <Package className={`w-5 h-5 mr-2.5 ${currentTheme.accent.replace('bg-','text-')}`} />
                ตั้งค่าโปรเจกต์: {currentProjectName || "N/A"}
            </h3>
            <div className="space-y-4">
                 <div>
                    <label htmlFor="project-name" className={`block text-sm font-medium ${currentTheme.textSecondary} mb-1.5`}>ชื่อโปรเจกต์:</label>
                    <input
                        type="text"
                        id="project-name"
                        value={editableProjectDetails.name || ''}
                        onChange={(e) => handleProjectDetailChange('name', e.target.value)}
                        className={inputBaseClass}
                        placeholder="ชื่อโปรเจกต์ของคุณ"
                    />
                </div>
                <div>
                    <label htmlFor="project-genre" className={`block text-sm font-medium ${currentTheme.textSecondary} mb-1.5`}>ประเภท/แนว (Genre):</label>
                    <input
                        type="text"
                        id="project-genre"
                        value={editableProjectDetails.genre || ''}
                        onChange={(e) => handleProjectDetailChange('genre', e.target.value)}
                        className={inputBaseClass}
                        placeholder="เช่น แฟนตาซี, สืบสวนสอบสวน, โรแมนติก"
                    />
                </div>
                <div>
                    <label htmlFor="project-description" className={`block text-sm font-medium ${currentTheme.textSecondary} mb-1.5`}>คำอธิบายโปรเจกต์ (Logline/Synopsis):</label>
                    <textarea
                        id="project-description"
                        value={editableProjectDetails.description || ''}
                        onChange={(e) => handleProjectDetailChange('description', e.target.value)}
                        rows={3}
                        className={`${inputBaseClass} resize-y`}
                        placeholder="เรื่องย่อสั้นๆ หรือแนวคิดหลักของโปรเจกต์"
                    />
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={handleSaveProjectDetails}
                        className={`${currentTheme.button} ${currentTheme.buttonText} px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-1.5 shadow-md hover:scale-105 transition-transform`}
                    >
                        <Save size={16} /> บันทึกรายละเอียดโปรเจกต์
                    </button>
                </div>
            </div>
        </div>
      )}
      {!activeProjectId && (
          <div className={`${currentTheme.cardBg} p-6 rounded-xl shadow-lg mt-8 text-center`}>
                <Package size={24} className={`mx-auto mb-3 ${currentTheme.textSecondary} opacity-70`} />
                <p className={`${currentTheme.textSecondary} text-sm`}>
                    เลือกโปรเจกต์จากเมนูด้านบนเพื่อแก้ไขรายละเอียดเฉพาะของโปรเจกต์นั้นๆ
                </p>
          </div>
      )}
    </div>
  );
};

export default AppSettingsPage;
