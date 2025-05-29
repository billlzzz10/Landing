import React, { useState } from 'react';
import { AppTheme, UserPreferences, NotificationPreferences, AiWriterPreferences, Project } from './types'; 
import { Settings, Bell, CheckCircle, XCircle, Edit3, Save, Package, MapPin, Palette as PaletteIcon, Zap, Type as FontIcon, Edit, SlidersHorizontal, Brain, FileText, Trash2, Archive, Inbox, KeyRound, ListChecks, TrendingUp, Milestone } from 'lucide-react'; // Changed Road to Milestone
import { AVAILABLE_AI_MODELS, MODEL_NAME as DEFAULT_MODEL_NAME } from './constants'; // Import available models

interface AppSettingsPageProps {
    currentTheme: AppTheme;
    userPreferences: UserPreferences;
    setUserPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
    projects: Project[];
    activeProjectId: string | null;
    onUpdateProjectDetails: (projectId: string, details: Partial<Pick<Project, 'name' | 'genre' | 'description' | 'isArchived'>>) => void;
    onDeleteProject: (projectId: string) => void;
}

const AppSettingsPage: React.FC<AppSettingsPageProps> = ({
    currentTheme,
    userPreferences,
    setUserPreferences,
    projects,
    activeProjectId,
    onUpdateProjectDetails,
    onDeleteProject,
}) => {
    const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'ai' | 'notifications' | 'projects' | 'roadmap'>('general'); // Added 'roadmap'
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [editableProjectDetails, setEditableProjectDetails] = useState<Partial<Pick<Project, 'name' | 'genre' | 'description'>>>({});
    const [showArchivedProjects, setShowArchivedProjects] = useState(false);
    const [tempApiKey, setTempApiKey] = useState(userPreferences.customGeminiApiKey || '');

    React.useEffect(() => {
        if (editingProjectId) {
            const projectToEdit = projects.find(p => p.id === editingProjectId);
            if (projectToEdit) {
                setEditableProjectDetails({
                    name: projectToEdit.name,
                    genre: projectToEdit.genre || '',
                    description: projectToEdit.description || '',
                });
            }
        } else {
            setEditableProjectDetails({});
        }
    }, [editingProjectId, projects]);

    const handleToggleNotification = (key: keyof NotificationPreferences) => {
        setUserPreferences(prev => ({
            ...prev,
            notificationPreferences: { ...prev.notificationPreferences, [key]: !prev.notificationPreferences[key] },
        }));
    };

    const handleAiWriterPreferenceChange = (key: keyof AiWriterPreferences, value: any) => {
        setUserPreferences(prev => ({
            ...prev,
            aiWriterPreferences: { ...prev.aiWriterPreferences, [key]: value },
        }));
    };
    
    const handleApiKeyChange = (value: string) => {
        setTempApiKey(value);
    };

    const handleSaveApiKey = () => {
        setUserPreferences(prev => ({
            ...prev,
            customGeminiApiKey: tempApiKey.trim() === '' ? undefined : tempApiKey.trim(),
        }));
        alert(tempApiKey.trim() === '' ? 'กลับไปใช้ API Key เริ่มต้น (ถ้ามี)' : 'บันทึก Custom API Key แล้ว');
    };
    
    const handleModelChange = (modelValue: string) => {
         setUserPreferences(prev => ({
            ...prev,
            selectedAiModel: modelValue,
        }));
    };

    const handleFontFamilyChange = (fontFamilyValue: string) => {
        setUserPreferences(prev => ({ ...prev, selectedFontFamily: fontFamilyValue }));
        if (document.body) document.body.style.fontFamily = fontFamilyValue;
    };

    const handleProjectDetailChange = (field: keyof Pick<Project, 'name' | 'genre' | 'description'>, value: string) => {
        setEditableProjectDetails(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveProjectDetails = () => {
        if (editingProjectId && editableProjectDetails.name?.trim()) {
            onUpdateProjectDetails(editingProjectId, {
                name: editableProjectDetails.name.trim(),
                genre: editableProjectDetails.genre?.trim() || undefined,
                description: editableProjectDetails.description?.trim() || undefined,
            });
            alert(`บันทึกรายละเอียดโปรเจกต์ "${editableProjectDetails.name.trim()}" แล้ว`);
            setEditingProjectId(null);
        } else if (editingProjectId && !editableProjectDetails.name?.trim()) {
            alert('ชื่อโปรเจกต์ไม่สามารถเว้นว่างได้');
        }
    };

    const handleArchiveToggle = (projectId: string, archive: boolean) => {
        const project = projects.find(p => p.id === projectId);
        if (project) {
            const confirmMessage = archive
                ? `คุณแน่ใจหรือไม่ว่าต้องการเก็บถาวรโปรเจกต์ "${project.name}"?`
                : `คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการเก็บถาวรโปรเจกต์ "${project.name}"?`;
            if (window.confirm(confirmMessage)) {
                onUpdateProjectDetails(projectId, { isArchived: archive });
                alert(`โปรเจกต์ "${project.name}" ${archive ? 'ถูกเก็บถาวรแล้ว' : 'ถูกยกเลิกการเก็บถาวรแล้ว'}`);
            }
        }
    };

    const isDarkTheme = currentTheme.text === 'text-slate-200' || currentTheme.text === 'text-slate-100';
    const selectArrowSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='${isDarkTheme ? '%23CBD5E1' : '%236B7280'}'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E`;
    const optionClasses = `${isDarkTheme ? 'bg-slate-700 text-slate-200' : 'bg-white text-gray-800'}`;
    const inputBaseClass = `w-full p-2.5 rounded-lg ${currentTheme.inputBg || currentTheme.input} ${currentTheme.inputText || currentTheme.text} border ${currentTheme.inputBorder || 'border-gray-300 dark:border-slate-600'} focus:outline-none focus:ring-2 ${currentTheme.focusRing || 'focus:ring-indigo-500'} text-sm`;
    const selectBaseClass = `${inputBaseClass} appearance-none bg-no-repeat bg-right-2.5`;
    const tabButtonBase = `w-full text-left px-4 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 focus:outline-none ${currentTheme.focusRing || 'focus:ring-2 focus:ring-offset-1'}`;
    const activeTabClass = `${currentTheme.button} ${currentTheme.buttonText || 'text-white'}`;
    const inactiveTabClass = `${currentTheme.textSecondary || 'text-gray-600 dark:text-slate-300'} hover:${currentTheme.inputBg || 'bg-gray-100 dark:bg-slate-700'} hover:${currentTheme.text}`;

    const ToggleButton: React.FC<{ isEnabled: boolean; onToggle: () => void; labelId: string;}> = ({ isEnabled, onToggle, labelId }) => (
        <button
            role="switch" aria-checked={isEnabled} onClick={onToggle}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none ${currentTheme.focusRing || 'focus:ring-2 focus:ring-offset-1'} ${isEnabled ? currentTheme.accent : (isDarkTheme ? 'bg-slate-600' : 'bg-gray-300')}`}
            aria-labelledby={labelId}
        >
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );

    const activeProjectsList = projects.filter(p => !p.isArchived).sort((a, b) => a.name.localeCompare(b.name, 'th'));
    const archivedProjectsList = projects.filter(p => p.isArchived).sort((a, b) => a.name.localeCompare(b.name, 'th'));

    const RoadmapItem: React.FC<{ title: string, status: 'Completed' | 'In Progress' | 'Planned' | 'Future', description?: string }> = ({ title, status, description }) => {
      let statusColor = '';
      let StatusIcon = CheckCircle;
      switch(status) {
          case 'Completed': statusColor = 'text-green-500'; StatusIcon = CheckCircle; break;
          case 'In Progress': statusColor = 'text-sky-500'; StatusIcon = TrendingUp; break;
          case 'Planned': statusColor = 'text-yellow-500'; StatusIcon = Milestone; break; // Changed from Road
          case 'Future': statusColor = `${currentTheme.textSecondary} opacity-70`; StatusIcon = Brain; break;
      }
      return (
          <div className={`mb-3 p-3 rounded-md border ${currentTheme.inputBorder || 'border-gray-200 dark:border-slate-700'} ${currentTheme.inputBg || 'bg-gray-50 dark:bg-slate-800'}`}>
              <div className="flex items-center justify-between">
                  <h4 className={`${currentTheme.text} font-medium flex items-center`}>
                    <StatusIcon size={16} className={`mr-2 ${statusColor}`} /> {title}
                  </h4>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor} bg-opacity-10 ${statusColor.replace('text-','bg-')}`}>{status}</span>
              </div>
              {description && <p className={`${currentTheme.textSecondary} text-xs mt-1 pl-6`}>{description}</p>}
          </div>
      );
    };


    return (
        <div className="py-6">
            <h2 className={`text-2xl sm:text-3xl font-semibold ${currentTheme.text} mb-8 text-center flex items-center justify-center`}>
                <Settings className={`w-7 h-7 mr-3 ${currentTheme.accentText || currentTheme.accent.replace('bg-', 'text-')}`} /> การตั้งค่า
            </h2>
            <div className="md:flex md:gap-6 lg:gap-8">
                <nav className={`md:w-1/4 lg:w-1/5 ${currentTheme.cardBg} p-3 sm:p-4 rounded-xl shadow-lg mb-6 md:mb-0 self-start`}>
                    <ul className="space-y-1">
                        <li><button onClick={() => setActiveSettingsTab('general')} className={`${tabButtonBase} ${activeSettingsTab === 'general' ? activeTabClass : inactiveTabClass}`}>ทั่วไป</button></li>
                        <li><button onClick={() => setActiveSettingsTab('ai')} className={`${tabButtonBase} ${activeSettingsTab === 'ai' ? activeTabClass : inactiveTabClass}`}>AI Writer</button></li>
                        <li><button onClick={() => setActiveSettingsTab('notifications')} className={`${tabButtonBase} ${activeSettingsTab === 'notifications' ? activeTabClass : inactiveTabClass}`}>การแจ้งเตือน</button></li>
                        <li><button onClick={() => setActiveSettingsTab('projects')} className={`${tabButtonBase} ${activeSettingsTab === 'projects' ? activeTabClass : inactiveTabClass}`}>จัดการโปรเจกต์</button></li>
                        <li><button onClick={() => setActiveSettingsTab('roadmap')} className={`${tabButtonBase} ${activeSettingsTab === 'roadmap' ? activeTabClass : inactiveTabClass}`}>Roadmap</button></li>
                    </ul>
                </nav>
                <div className="flex-1">
                    {activeSettingsTab === 'general' && (
                        <div className={`${currentTheme.cardBg} p-5 sm:p-6 rounded-xl shadow-lg`}>
                            <h3 className={`text-xl font-semibold ${currentTheme.text} mb-5 border-b pb-3 ${currentTheme.divider || 'border-gray-200 dark:border-slate-700'} flex items-center`}>
                                <PaletteIcon className={`w-5 h-5 mr-2.5 ${currentTheme.accentText || currentTheme.accent.replace('bg-', 'text-')}`} /> การแสดงผล
                            </h3>
                            <div className="space-y-5">
                                <div>
                                    <label htmlFor="font-family-select" className={`block text-sm font-medium ${currentTheme.textSecondary || 'text-gray-700 dark:text-slate-300'} mb-1.5 flex items-center`}>
                                        <FontIcon size={16} className="mr-2 opacity-70" /> รูปแบบตัวอักษร (Font):
                                    </label>
                                    <select
                                        id="font-family-select" value={userPreferences.selectedFontFamily || "'Sarabun', sans-serif"}
                                        onChange={(e) => handleFontFamilyChange(e.target.value)} className={`${selectBaseClass}`}
                                        style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1.25em' }}
                                    >
                                        <option value="'Sarabun', sans-serif" className={optionClasses}>สารบรรณ (Sarabun)</option>
                                        <option value="'Noto Sans Thai', sans-serif" className={optionClasses}>โนโต ซานส์ ไทย (Noto Sans Thai)</option>
                                        <option value="Arial, sans-serif" className={optionClasses}>Arial</option>
                                        <option value="Verdana, sans-serif" className={optionClasses}>Verdana</option>
                                        <option value="Tahoma, sans-serif" className={optionClasses}>Tahoma</option>
                                    </select>
                                    <p className={`text-xs ${currentTheme.textSecondary || 'text-gray-500 dark:text-slate-400'} opacity-80 mt-1`}>
                                        รูปแบบตัวอักษรที่เลือกจะมีผลกับทั้งแอปพลิเคชัน
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeSettingsTab === 'ai' && (
                        <div className={`${currentTheme.cardBg} p-5 sm:p-6 rounded-xl shadow-lg`}>
                            <h3 className={`text-xl font-semibold ${currentTheme.text} mb-5 border-b pb-3 ${currentTheme.divider || 'border-gray-200 dark:border-slate-700'} flex items-center`}>
                                <Zap className={`w-5 h-5 mr-2.5 ${currentTheme.accentText || currentTheme.accent.replace('bg-', 'text-')}`} /> การตั้งค่า AI Writer
                            </h3>
                            <div className="space-y-5">
                                <div>
                                    <label htmlFor="custom-api-key" className={`block text-sm font-medium ${currentTheme.textSecondary || 'text-gray-700 dark:text-slate-300'} mb-1.5 flex items-center`}>
                                      <KeyRound size={16} className="mr-2 opacity-70" /> Custom Gemini API Key (ถ้ามี):
                                    </label>
                                    <div className="flex gap-2 items-center">
                                      <input
                                        type="password" id="custom-api-key" value={tempApiKey}
                                        onChange={(e) => handleApiKeyChange(e.target.value)}
                                        className={`${inputBaseClass} flex-grow`}
                                        placeholder="วาง API Key ของคุณที่นี่ (เก็บใน LocalStorage)"
                                      />
                                      <button onClick={handleSaveApiKey} className={`${currentTheme.button} ${currentTheme.buttonText || 'text-white'} text-sm px-4 py-2 rounded-md`}>บันทึก Key</button>
                                    </div>
                                    <p className={`text-xs ${currentTheme.textSecondary || 'text-gray-500 dark:text-slate-400'} opacity-80 mt-1`}>
                                      หากเว้นว่าง จะใช้ API Key ที่ตั้งค่าไว้ตอน Build (ถ้ามี) API Key ที่ป้อนจะถูกเก็บไว้ใน Local Storage ของเบราว์เซอร์คุณเท่านั้น
                                    </p>
                                </div>
                                <div>
                                    <label htmlFor="ai-model-select" className={`block text-sm font-medium ${currentTheme.textSecondary || 'text-gray-700 dark:text-slate-300'} mb-1.5 flex items-center`}>
                                      <ListChecks size={16} className="mr-2 opacity-70" /> เลือกโมเดล AI:
                                    </label>
                                    <select
                                        id="ai-model-select" value={userPreferences.selectedAiModel || DEFAULT_MODEL_NAME}
                                        onChange={(e) => handleModelChange(e.target.value)}
                                        className={`${selectBaseClass} w-full sm:w-2/3 md:w-1/2`}
                                        style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1.25em' }}
                                    >
                                        {AVAILABLE_AI_MODELS.map(model => (
                                            <option key={model} value={model} className={optionClasses}>{model}</option>
                                        ))}
                                    </select>
                                    <p className={`text-xs ${currentTheme.textSecondary || 'text-gray-500 dark:text-slate-400'} opacity-80 mt-1`}>
                                        เลือกโมเดล Gemini ที่ต้องการใช้งาน
                                    </p>
                                </div>
                                <div>
                                    <label htmlFor="repetition-threshold" className={`block text-sm font-medium ${currentTheme.textSecondary || 'text-gray-700 dark:text-slate-300'} mb-1.5`}>
                                        เกณฑ์การแจ้งเตือนคำซ้ำ (จำนวนครั้ง):
                                    </label>
                                    <input
                                        type="number" id="repetition-threshold" min="1" max="10" step="1"
                                        value={userPreferences.aiWriterPreferences.repetitionThreshold}
                                        onChange={(e) => handleAiWriterPreferenceChange('repetitionThreshold', parseInt(e.target.value, 10))}
                                        className={`${inputBaseClass} w-full sm:w-1/2 md:w-1/3`}
                                    />
                                </div>
                                <div className="flex items-center justify-between py-1">
                                    <span id="autoAddLoreLabel" className={`text-sm ${currentTheme.textSecondary || 'text-gray-700 dark:text-slate-300'}`}>AI สร้างข้อมูลโลกอัตโนมัติจาก [[notation]] และ @mention:</span>
                                    <ToggleButton isEnabled={!!userPreferences.aiWriterPreferences.autoAddLoreFromAi} onToggle={() => handleAiWriterPreferenceChange('autoAddLoreFromAi', !userPreferences.aiWriterPreferences.autoAddLoreFromAi)} labelId="autoAddLoreLabel" />
                                </div>
                                <div className="flex items-center justify-between py-1">
                                    <span id="autoAnalyzeScenesLabel" className={`text-sm ${currentTheme.textSecondary || 'text-gray-700 dark:text-slate-300'}`}>AI วิเคราะห์ฉากใหม่ๆ อัตโนมัติ (ทดลอง):</span>
                                    <ToggleButton isEnabled={!!userPreferences.aiWriterPreferences.autoAnalyzeScenes} onToggle={() => handleAiWriterPreferenceChange('autoAnalyzeScenes', !userPreferences.aiWriterPreferences.autoAnalyzeScenes)} labelId="autoAnalyzeScenesLabel" />
                                </div>
                                <div>
                                    <label htmlFor="contextual-menu-style" className={`block text-sm font-medium ${currentTheme.textSecondary || 'text-gray-700 dark:text-slate-300'} mb-1.5`}>
                                        รูปแบบเมนู AI ตามบริบท:
                                    </label>
                                    <select
                                        id="contextual-menu-style" value={userPreferences.aiWriterPreferences.contextualAiMenuStyle || 'simple'}
                                        onChange={(e) => handleAiWriterPreferenceChange('contextualAiMenuStyle', e.target.value)}
                                        className={`${selectBaseClass} w-full sm:w-1/2 md:w-1/3`}
                                        style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1.25em' }}
                                    >
                                        <option value="simple" className={optionClasses}>แบบง่าย (Simple)</option>
                                        <option value="full" className={optionClasses}>แบบเต็ม (Full)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeSettingsTab === 'notifications' && (
                        <div className={`${currentTheme.cardBg} p-5 sm:p-6 rounded-xl shadow-lg`}>
                            <h3 className={`text-xl font-semibold ${currentTheme.text} mb-5 border-b pb-3 ${currentTheme.divider || 'border-gray-200 dark:border-slate-700'} flex items-center`}>
                                <Bell className={`w-5 h-5 mr-2.5 ${currentTheme.accentText || currentTheme.accent.replace('bg-', 'text-')}`} /> การแจ้งเตือน
                            </h3>
                            <div className="space-y-5">
                                <div className="flex items-center justify-between py-1">
                                    <span id="taskRemindersLabel" className={`text-sm ${currentTheme.textSecondary || 'text-gray-700 dark:text-slate-300'}`}>แจ้งเตือน Pomodoro / งานที่ใกล้ครบกำหนด:</span>
                                    <ToggleButton isEnabled={userPreferences.notificationPreferences.taskReminders} onToggle={() => handleToggleNotification('taskReminders')} labelId="taskRemindersLabel" />
                                </div>
                                {userPreferences.notificationPreferences.taskReminders && (
                                    <p className={`text-xs ${currentTheme.textSecondary} opacity-80 p-2 rounded-md ${currentTheme.inputBg || 'bg-gray-50 dark:bg-slate-800'} flex items-center gap-2`}>
                                        {('Notification' in window && Notification.permission === 'granted') ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                                        {('Notification' in window && Notification.permission === 'granted') ? 'การแจ้งเตือน Pomodoro ได้รับอนุญาตจากเบราว์เซอร์แล้ว' : 'อาจต้องอนุญาตการแจ้งเตือนในเบราว์เซอร์สำหรับเว็บนี้'}
                                    </p>
                                )}
                                <div className="flex items-center justify-between py-1">
                                    <span id="projectUpdatesLabel" className={`text-sm ${currentTheme.textSecondary || 'text-gray-700 dark:text-slate-300'}`}>แจ้งเตือนสรุปความคืบหน้าโครงการ (เร็วๆ นี้):</span>
                                    <ToggleButton isEnabled={userPreferences.notificationPreferences.projectUpdates} onToggle={() => handleToggleNotification('projectUpdates')} labelId="projectUpdatesLabel" />
                                </div>
                            </div>
                        </div>
                    )}
                    {activeSettingsTab === 'projects' && (
                        <div className={`${currentTheme.cardBg} p-5 sm:p-6 rounded-xl shadow-lg`}>
                            <h3 className={`text-xl font-semibold ${currentTheme.text} mb-5 border-b pb-3 ${currentTheme.divider || 'border-gray-200 dark:border-slate-700'} flex items-center`}>
                                <Package className={`w-5 h-5 mr-2.5 ${currentTheme.accentText || currentTheme.accent.replace('bg-', 'text-')}`} /> จัดการโปรเจกต์
                            </h3>
                            {activeProjectsList.length === 0 && !showArchivedProjects && <p className={`${currentTheme.textSecondary || 'text-gray-600 dark:text-slate-300'} italic`}>ยังไม่มีโปรเจกต์ที่ใช้งาน</p>}
                            {activeProjectsList.map(project => (
                                <div key={project.id} className={`p-3 rounded-md mb-2 ${currentTheme.inputBg || 'bg-gray-50 dark:bg-slate-800'} border ${currentTheme.inputBorder || 'border-gray-200 dark:border-slate-700'}`}>
                                    <div className="flex justify-between items-center">
                                        <span className={`${currentTheme.text} font-medium`}>{project.name}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditingProjectId(project.id === editingProjectId ? null : project.id)} className={`${currentTheme.textSecondary} hover:opacity-70 p-1`} title="แก้ไขรายละเอียด"><Edit3 size={16} /></button>
                                            <button onClick={() => handleArchiveToggle(project.id, true)} className={`${currentTheme.textSecondary} hover:opacity-70 p-1`} title="เก็บถาวร"><Archive size={16} /></button>
                                            <button onClick={() => onDeleteProject(project.id)} className="text-red-500 hover:text-red-400 p-1" title="ลบถาวร"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                    {editingProjectId === project.id && (
                                        <div className={`mt-3 pt-3 border-t ${currentTheme.divider || 'border-gray-200 dark:border-slate-700'} space-y-3`}>
                                            <div>
                                                <label htmlFor={`projectName-${project.id}`} className={`${currentTheme.textSecondary} text-xs block mb-0.5`}>ชื่อโปรเจกต์:</label>
                                                <input type="text" id={`projectName-${project.id}`} value={editableProjectDetails.name || ''} onChange={(e) => handleProjectDetailChange('name', e.target.value)} className={`${inputBaseClass}`} />
                                            </div>
                                            <div>
                                                <label htmlFor={`projectGenre-${project.id}`} className={`${currentTheme.textSecondary} text-xs block mb-0.5`}>ประเภท (Genre):</label>
                                                <input type="text" id={`projectGenre-${project.id}`} value={editableProjectDetails.genre || ''} onChange={(e) => handleProjectDetailChange('genre', e.target.value)} className={`${inputBaseClass}`} />
                                            </div>
                                            <div>
                                                <label htmlFor={`projectDesc-${project.id}`} className={`${currentTheme.textSecondary} text-xs block mb-0.5`}>คำอธิบาย:</label>
                                                <textarea id={`projectDesc-${project.id}`} value={editableProjectDetails.description || ''} onChange={(e) => handleProjectDetailChange('description', e.target.value)} rows={2} className={`${inputBaseClass} resize-y`} />
                                            </div>
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => setEditingProjectId(null)} className={`${currentTheme.buttonSecondaryBg || 'bg-gray-200 dark:bg-slate-700'} ${currentTheme.buttonSecondaryText || 'text-gray-700 dark:text-slate-200'} text-xs px-3 py-1.5 rounded-md`}>ยกเลิก</button>
                                                <button onClick={handleSaveProjectDetails} className={`${currentTheme.button} ${currentTheme.buttonText || 'text-white'} text-xs px-4 py-1.5 rounded-md`}>บันทึก</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div className={`mt-4 pt-4 border-t ${currentTheme.divider || 'border-gray-200 dark:border-slate-700'}`}>
                                <button onClick={() => setShowArchivedProjects(!showArchivedProjects)} className={`${currentTheme.textSecondary || 'text-gray-600 dark:text-slate-300'} text-sm flex items-center hover:opacity-100`}>
                                    {showArchivedProjects ? <XCircle size={16} className="mr-1.5" /> : <Inbox size={16} className="mr-1.5" />}
                                    {showArchivedProjects ? 'ซ่อนโปรเจกต์ที่เก็บถาวร' : `แสดงโปรเจกต์ที่เก็บถาวร (${archivedProjectsList.length})`}
                                </button>
                                {showArchivedProjects && (
                                    <div className="mt-3 space-y-2">
                                        {archivedProjectsList.length === 0 && <p className={`${currentTheme.textSecondary || 'text-gray-600 dark:text-slate-300'} text-sm italic`}>ไม่มีโปรเจกต์ที่ถูกเก็บถาวร</p>}
                                        {archivedProjectsList.map(project => (
                                            <div key={project.id} className={`p-3 rounded-md ${currentTheme.inputBg || 'bg-gray-50 dark:bg-slate-800'} bg-opacity-70 border ${currentTheme.inputBorder || 'border-gray-200 dark:border-slate-700'} opacity-80`}>
                                                <div className="flex justify-between items-center">
                                                    <span className={`${currentTheme.text} font-medium`}>{project.name} (เก็บถาวร)</span>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleArchiveToggle(project.id, false)} className={`${currentTheme.textSecondary} hover:opacity-100 p-1`} title="ยกเลิกการเก็บถาวร"><Inbox size={16} /></button>
                                                        <button onClick={() => onDeleteProject(project.id)} className="text-red-500 hover:text-red-400 p-1" title="ลบถาวร"><Trash2 size={16} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                     {activeSettingsTab === 'roadmap' && (
                        <div className={`${currentTheme.cardBg} p-5 sm:p-6 rounded-xl shadow-lg`}>
                            <h3 className={`text-xl font-semibold ${currentTheme.text} mb-5 border-b pb-3 ${currentTheme.divider || 'border-gray-200 dark:border-slate-700'} flex items-center`}>
                                <Milestone className={`w-5 h-5 mr-2.5 ${currentTheme.accentText || currentTheme.accent.replace('bg-', 'text-')}`} /> แผนการพัฒนา (Roadmap)
                            </h3>
                            <div className="space-y-4">
                                <RoadmapItem title="การจัดการข้อมูลพื้นฐาน (โน้ต, งาน, โปรเจกต์)" status="Completed" description="สร้าง, แก้ไข, ลบ, ค้นหา, จัดหมวดหมู่, และแสดงผลข้อมูล" />
                                <RoadmapItem title="AI Writer - Gemini Integration" status="Completed" description="เชื่อมต่อ Gemini API, โหมด AI หลากหลาย, จัดการ Context, แสดงผล Stream" />
                                <RoadmapItem title="ระบบธีมและ UI พื้นฐาน" status="Completed" description="ธีมสว่าง/มืด, Responsive Design, Sidebar, Modals" />
                                <RoadmapItem title="เครื่องมือเสริม (Pomodoro, Dictionary)" status="Completed" description="เพิ่ม Pomodoro Timer และระบบจัดการคำศัพท์ที่ AI เรียนรู้" />
                                <RoadmapItem title="คลังข้อมูลโลก (World Anvil) - Core" status="Completed" description="เพิ่ม/แก้ไข/ลบ Lore Entries, จัดการประเภท, แท็ก, และเชื่อมกับโปรเจกต์" />
                                <RoadmapItem title="โครงเรื่อง (Plot Outline) - Core" status="Completed" description="สร้างโครงเรื่องแบบ Nested, จัดลำดับ, แก้ไข, ลบ" />
                                <RoadmapItem title="การนำเข้า/ส่งออกข้อมูล" status="In Progress" description="ปรับปรุงการนำเข้าไฟล์หลากหลาย, เพิ่มตัวเลือกการส่งออก (PDF, HTML พร้อมเทมเพลต)" />
                                <RoadmapItem title="Graph View - Note Linking" status="In Progress" description="แสดงความเชื่อมโยงระหว่างโน้ตเบื้องต้น (พัฒนาต่อยอดเป็นกราฟเต็มรูปแบบ)" />
                                <RoadmapItem title="Ashval AI Mascot" status="In Progress" description="Mascot แสดง Tips, UI Panel (ยังไม่เชื่อมต่อ AI สำหรับสนทนา)" />
                                <RoadmapItem title="ปรับปรุง UX/UI และ Performance" status="In Progress" description="แก้ไข Bug, ปรับปรุงการตอบสนอง, ทำให้ใช้งานง่ายขึ้น" />
                                <RoadmapItem title="AI Contextual Menu ใน Note Editor" status="Planned" description="เมนู AI ที่ปรากฏเมื่อเลือกข้อความใน Note Editor เพื่อสั่งงาน AI โดยตรง" />
                                <RoadmapItem title="ระบบแจ้งเตือนขั้นสูง" status="Planned" description="แจ้งเตือนงาน, ความคืบหน้าโปรเจกต์, และการอัปเดตสำคัญ" />
                                <RoadmapItem title="Collaboration (ตัวเลือกในอนาคต)" status="Future" description="การทำงานร่วมกันบนโปรเจกต์ (อาจต้องมี Backend เต็มรูปแบบ)" />
                                <RoadmapItem title="Mobile App (ตัวเลือกในอนาคต)" status="Future" description="พัฒนาเป็นแอปพลิเคชัน Native สำหรับมือถือ" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppSettingsPage;