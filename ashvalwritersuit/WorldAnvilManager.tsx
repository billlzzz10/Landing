
import React, { useState, useEffect } from 'react';
import { LoreEntry, Project, CharacterRole, CharacterRelationship, RelationshipType } from './types'; 
import { AppTheme } from './NoteTaskApp';
import { COMMON_RELATIONSHIP_TYPES } from './constants'; 
import { Plus, BookOpen, Edit2, Trash2, Tag, Eye, X, Search, List, LayoutGrid, Package, Users, Zap as ArcanaIcon, Link2, FileJson, Globe, UserCircle2, Filter, ChevronDown, ChevronUp } from 'lucide-react'; 

interface WorldAnvilManagerProps {
  loreEntries: LoreEntry[];
  setLoreEntries: React.Dispatch<React.SetStateAction<LoreEntry[]>>;
  currentTheme: AppTheme;
  getCategoryIcon: (category: string) => JSX.Element; 
  projects: Project[]; 
  activeProjectId: string | null; 
  filterByType?: LoreEntry['type'][]; 
}

const WorldAnvilManager: React.FC<WorldAnvilManagerProps> = ({ 
    loreEntries, 
    setLoreEntries, 
    currentTheme, 
    getCategoryIcon,
    projects,
    activeProjectId,
    filterByType 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LoreEntry | null>(null);
  
  const getDefaultTypeForModal = (): LoreEntry['type'] => {
    if (filterByType && filterByType.length === 1) {
      return filterByType[0];
    }
    if (filterByType && filterByType.length > 0 && filterByType.includes('Character')) { 
        return 'Character';
    }
    return 'Concept'; 
  };
  
  const initialEntryData: Omit<LoreEntry, 'id' | 'createdAt'> = { 
    title: '', 
    type: getDefaultTypeForModal(), 
    content: '', 
    tags: [], 
    projectId: activeProjectId,
    role: undefined,
    characterArcana: [],
    relationships: [],
    customFields: {},
    age: undefined,
    gender: undefined,
    status: undefined,
    avatarUrl: undefined,
  };
  const [currentEntryData, setCurrentEntryData] = useState<Omit<LoreEntry, 'id' | 'createdAt'>>(initialEntryData);
  
  const [viewingEntry, setViewingEntry] = useState<LoreEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>(filterByType?.includes('Character') ? 'table' : 'card'); 
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('all');


  const [customFieldKey, setCustomFieldKey] = useState('');
  const [customFieldValue, setCustomFieldValue] = useState('');

  const baseLoreTypes: LoreEntry['type'][] = ['Character', 'Place', 'Item', 'Concept', 'Event', 'Other', 'ArcanaSystem'];
  const availableLoreTypesInModal = filterByType && filterByType.length > 0 
    ? baseLoreTypes.filter(lt => filterByType.includes(lt)) 
    : baseLoreTypes;

  const characterRoles: (CharacterRole | string)[] = ["ตัวเอก", "ตัวร้าย", "แอนตี้ฮีโร่", "ตัวละครสมทบ", "อาจารย์", "พันธมิตร", "ศัตรู", "ครอบครัว", "คนรัก", "ตัวประกอบ", "อื่นๆ"];


  useEffect(() => {
    if (!editingEntry) {
        setCurrentEntryData(prev => ({...prev, type: getDefaultTypeForModal(), projectId: activeProjectId }));
    }
  }, [filterByType, activeProjectId, editingEntry]);


  const handleInputChange = (
    field: keyof Omit<LoreEntry, 'id' | 'createdAt' | 'tags' | 'projectId' | 'characterArcana' | 'relationships' | 'customFields'>, 
    value: string | CharacterRole | number
  ) => {
    setCurrentEntryData(prev => ({ ...prev, [field]: value }));
  };

  const handleProjectChange = (value: string | null) => {
    setCurrentEntryData(prev => ({ ...prev, projectId: value === "" ? null : value }));
  };

  const handleTagsChange = (value: string) => {
    setCurrentEntryData(prev => ({ ...prev, tags: value.split(',').map(tag => tag.trim()).filter(tag => tag) }));
  };
  
  const handleCharacterArcanaChange = (selectedOptions: HTMLSelectElement) => {
    const values = Array.from(selectedOptions.selectedOptions, option => option.value);
    setCurrentEntryData(prev => ({ ...prev, characterArcana: values }));
  };

  const handleAddRelationship = () => {
    setCurrentEntryData(prev => ({
      ...prev,
      relationships: [...(prev.relationships || []), { targetCharacterId: '', relationshipType: COMMON_RELATIONSHIP_TYPES[0], description: '' }]
    }));
  };

  const handleRelationshipChange = (index: number, field: keyof CharacterRelationship | 'customRelationshipType', value: string) => {
    setCurrentEntryData(prev => {
      const newRelationships = [...(prev.relationships || [])];
      let currentRel = { ...newRelationships[index] };

      if (field === 'targetCharacterId') {
        const targetCharacter = projectCharacters.find(c => c.id === value);
        currentRel.targetCharacterId = value;
        currentRel.targetCharacterName = targetCharacter ? targetCharacter.title : undefined;
      } else if (field === 'relationshipType') {
        currentRel.relationshipType = value as RelationshipType;
      } else if (field === 'customRelationshipType' && currentRel.relationshipType === 'Other') {
         currentRel.description = `กำหนดเอง: ${value}`; 
      } else if (field === 'description') {
        currentRel.description = value;
      }
      
      newRelationships[index] = currentRel;
      return { ...prev, relationships: newRelationships };
    });
  };
  
  const handleRemoveRelationship = (index: number) => {
    setCurrentEntryData(prev => ({
      ...prev,
      relationships: (prev.relationships || []).filter((_, i) => i !== index)
    }));
  };

  const handleAddCustomField = () => {
    if (customFieldKey.trim() && customFieldValue.trim()) {
        setCurrentEntryData(prev => ({
            ...prev,
            customFields: {
                ...(prev.customFields || {}),
                [customFieldKey.trim()]: customFieldValue.trim()
            }
        }));
        setCustomFieldKey('');
        setCustomFieldValue('');
    } else {
        alert("กรุณากรอกทั้งชื่อฟิลด์และค่าของฟิลด์ข้อมูลที่กำหนดเอง");
    }
  };

  const handleRemoveCustomField = (keyToRemove: string) => {
    setCurrentEntryData(prev => {
        const newCustomFields = { ...(prev.customFields || {}) };
        delete newCustomFields[keyToRemove];
        return { ...prev, customFields: newCustomFields };
    });
  };


  const resetForm = () => {
    setCurrentEntryData({ 
        title: '', 
        type: getDefaultTypeForModal(), 
        content: '', 
        tags: [], 
        projectId: activeProjectId,
        role: undefined,
        characterArcana: [],
        relationships: [],
        customFields: {},
        age: undefined,
        gender: undefined,
        status: undefined,
        avatarUrl: undefined,
    });
    setEditingEntry(null);
    setCustomFieldKey('');
    setCustomFieldValue('');
  };

  const handleSaveEntry = () => {
    if (!currentEntryData.title.trim()) {
      alert('กรุณากรอกชื่อของข้อมูลโลก');
      return;
    }
    if (currentEntryData.type === 'Character' && !currentEntryData.content.trim()){
        // Allow content to be optional for characters initially, can be filled later
        // alert('กรุณากรอกรายละเอียดของตัวละคร');
        // return;
    }

    const finalProjectId = currentEntryData.projectId === "" ? null : currentEntryData.projectId;
    const processedRelationships = (currentEntryData.relationships || []).map(rel => ({
        ...rel,
        relationshipType: String(rel.relationshipType) 
    }));

    const dataToSave: LoreEntry = {
        id: editingEntry ? editingEntry.id : Date.now().toString() + Math.random().toString(36).substring(2,7),
        createdAt: editingEntry ? editingEntry.createdAt : new Date().toISOString(),
        ...currentEntryData,
        projectId: finalProjectId,
        relationships: processedRelationships,
        customFields: currentEntryData.customFields || {},
        age: currentEntryData.age,
        gender: currentEntryData.gender,
        status: currentEntryData.status,
        avatarUrl: currentEntryData.avatarUrl
    };

    const newOrUpdatedEntries = editingEntry
      ? loreEntries.map(entry => entry.id === editingEntry.id ? dataToSave : entry)
      : [...loreEntries, dataToSave];
    
    setLoreEntries(newOrUpdatedEntries.sort((a,b) => a.title.localeCompare(b.title, 'th')));
    
    setShowModal(false);
    resetForm();
  };

  const handleEditEntry = (entry: LoreEntry) => {
    setEditingEntry(entry);
    setCurrentEntryData({ 
        title: entry.title, 
        type: entry.type, 
        content: entry.content, 
        tags: entry.tags, 
        projectId: entry.projectId,
        role: entry.role,
        characterArcana: entry.characterArcana || [],
        relationships: entry.relationships?.map(r => ({...r, targetCharacterName: projectCharacters.find(c=>c.id === r.targetCharacterId)?.title })) || [],
        customFields: entry.customFields || {},
        age: entry.age,
        gender: entry.gender,
        status: entry.status,
        avatarUrl: entry.avatarUrl,
    });
    setShowModal(true);
    setViewingEntry(null);
  };

  const handleDeleteEntry = (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลโลกนี้?')) {
      setLoreEntries(loreEntries.filter(entry => entry.id !== id));
    }
  };
  
  const handleViewEntry = (entry: LoreEntry) => {
    const entryWithPopulatedRelationships = {
        ...entry,
        relationships: entry.relationships?.map(r => ({
            ...r,
            targetCharacterName: projectCharacters.find(c => c.id === r.targetCharacterId)?.title || r.targetCharacterId
        }))
    };
    setViewingEntry(entryWithPopulatedRelationships);
  };


  const filteredLoreEntries = loreEntries.filter(entry => 
    (!activeProjectId || entry.projectId === activeProjectId || entry.projectId === null || entry.projectId === undefined) &&
    (!filterByType || filterByType.includes(entry.type)) && 
    (typeFilter === 'all' || entry.type.toLowerCase() === typeFilter.toLowerCase()) &&
    (entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entry.customFields && Object.values(entry.customFields).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))) ||
    entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  ).sort((a,b) => a.title.localeCompare(b.title, 'th'));
  
  const getProjectName = (projectId: string | null | undefined) => {
    if (!projectId) return null;
    return projects.find(p => p.id === projectId)?.name || null;
  };

  const projectCharacters = loreEntries.filter(l => l.type === 'Character' && (l.projectId === activeProjectId || !activeProjectId));
  const projectArcanaSystems = loreEntries.filter(l => (l.type === 'ArcanaSystem' || l.type === 'Concept') && (l.projectId === activeProjectId || !activeProjectId));


  const selectArrowSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='${currentTheme.text === 'text-white' || currentTheme.text === 'text-slate-300' ? '%23CBD5E1' : '%2364748B'}'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E`;
  const optionBgClass = currentTheme.text === 'text-white' || currentTheme.text === 'text-slate-300' ? 'bg-slate-700' : 'bg-gray-200 text-gray-800';
  const multiSelectStyle = { minHeight: '80px', padding: '0.5rem 0.75rem' };
  const inputBaseClass = `w-full px-3 py-2 rounded-lg ${currentTheme.inputBg} ${currentTheme.inputText} ${currentTheme.inputBorder} focus:outline-none focus:ring-2 ${currentTheme.accent.replace('bg-','focus:ring-')} text-sm`;


  let titlePlaceholder = "ชื่อข้อมูล";
  let contentPlaceholder = "รายละเอียด";

  switch (currentEntryData.type) {
    case 'Character':
      titlePlaceholder = "ชื่อตัวละคร";
      contentPlaceholder = "รายละเอียดตัวละคร (เช่น ลักษณะนิสัย, ประวัติ, ความสามารถ)";
      break;
    case 'Place':
      titlePlaceholder = "ชื่อสถานที่";
      contentPlaceholder = "รายละเอียดสถานที่ (เช่น ที่ตั้ง, ลักษณะภูมิประเทศ, ประวัติ, จุดสำคัญ)";
      break;
    case 'Item':
      titlePlaceholder = "ชื่อสิ่งของ";
      contentPlaceholder = "รายละเอียดสิ่งของ (เช่น ลักษณะ, ประโยชน์, ประวัติ, ผู้ครอบครอง)";
      break;
    case 'Concept':
      titlePlaceholder = "ชื่อแนวคิด/ระบบ";
      contentPlaceholder = "รายละเอียดแนวคิด/ระบบ (เช่น กฎเกณฑ์, ที่มา, ผลกระทบ)";
      break;
    case 'ArcanaSystem':
      titlePlaceholder = "ชื่อระบบ Arcana";
      contentPlaceholder = "คำอธิบายระบบ Arcana (เช่น กฎ, ข้อจำกัด, การแสดงผล, ผู้ใช้ที่มีชื่อเสียง)";
      break;
    case 'Event':
      titlePlaceholder = "ชื่อเหตุการณ์";
      contentPlaceholder = "รายละเอียดเหตุการณ์ (เช่น ลำดับเวลา, ผู้เกี่ยวข้อง, ผลลัพธ์)";
      break;
  }
  
  const getPageTitle = () => {
    if (filterByType) {
        if (filterByType.includes('Character')) return 'ตัวละคร';
        if (filterByType.includes('ArcanaSystem')) return 'ระบบเวทมนตร์';
        if (filterByType.includes('Place') || filterByType.includes('Item') || filterByType.includes('Event') || filterByType.includes('Concept') || filterByType.includes('Other')) return 'สร้างโลก';
    }
    return 'ข้อมูลโลก';
  };

  const getPageIcon = () => {
    if (filterByType) {
        if (filterByType.includes('Character')) return <Users className={`w-6 h-6 mr-2 ${currentTheme.accent.replace('bg-','text-')}`}/>;
        if (filterByType.includes('ArcanaSystem')) return <ArcanaIcon className={`w-6 h-6 mr-2 ${currentTheme.accent.replace('bg-','text-')}`}/>;
        if (filterByType.includes('Place') || filterByType.includes('Item') || filterByType.includes('Event') || filterByType.includes('Concept') || filterByType.includes('Other')) return <Globe className={`w-6 h-6 mr-2 ${currentTheme.accent.replace('bg-','text-')}`}/>;
    }
    return <BookOpen className={`w-6 h-6 mr-2 ${currentTheme.accent.replace('bg-','text-')}`}/>;
  }

  const getCharacterCustomField = (entry: LoreEntry, fieldName: string): string => {
    const key = Object.keys(entry.customFields || {}).find(k => k.toLowerCase() === fieldName.toLowerCase());
    return key ? String(entry.customFields![key]) : (entry as any)[fieldName.toLowerCase()] || '-';
  };


  return (
    <div className="py-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className={`text-2xl font-semibold ${currentTheme.text} flex items-center`}>
            {getPageIcon()} {getPageTitle()} ({filteredLoreEntries.length})
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode('card')} className={`p-2 rounded-lg ${viewMode === 'card' ? `${currentTheme.button} ${currentTheme.buttonText}` : `${currentTheme.textSecondary} hover:${currentTheme.inputBg}` } transition-colors`} aria-pressed={viewMode === 'card'} title="มุมมองการ์ด">
            <LayoutGrid className="w-5 h-5"/>
          </button>
          <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg ${viewMode === 'table' ? `${currentTheme.button} ${currentTheme.buttonText}` : `${currentTheme.textSecondary} hover:${currentTheme.inputBg}`} transition-colors`} aria-pressed={viewMode === 'table'} title="มุมมองตาราง">
            <List className="w-5 h-5"/>
          </button>
          <button onClick={() => { resetForm(); setShowModal(true); setViewingEntry(null); }} className={`${currentTheme.button} ${currentTheme.buttonText} px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center text-sm`}>
            <Plus className="w-4 h-4 mr-1.5" /> เพิ่ม{filterByType?.includes('Character') ? 'ตัวละคร' : 'ข้อมูล'}
          </button>
        </div>
      </div>

       <div className={`mb-6 p-3 rounded-lg ${currentTheme.cardBg} bg-opacity-70`}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
                <input type="text" placeholder={`ค้นหา${getPageTitle().toLowerCase()}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full py-2.5 pl-10 pr-4 rounded-lg ${currentTheme.inputBg} ${currentTheme.inputText} ${currentTheme.inputBorder} focus:outline-none focus:ring-2 ${currentTheme.accent.replace('bg-','focus:ring-')}`} />
                <Search className={`w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 ${currentTheme.text} opacity-50`} />
            </div>
            {!filterByType && ( // Show type filter only if not pre-filtered by page
                 <div className="relative sm:w-auto w-full">
                    <select 
                        value={typeFilter} 
                        onChange={(e) => setTypeFilter(e.target.value)} 
                        className={`w-full sm:min-w-[180px] py-2.5 px-3 pr-8 rounded-lg ${currentTheme.inputBg} ${currentTheme.inputText} ${currentTheme.inputBorder} appearance-none focus:outline-none focus:ring-2 ${currentTheme.accent.replace('bg-','focus:ring-')} bg-no-repeat bg-right-2.5 text-sm`}
                        style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1em' }}
                    >
                        <option value="all" className={optionBgClass}>ทุกประเภท</option>
                        {baseLoreTypes.map(type => <option key={type} value={type} className={optionBgClass}>{type}</option>)}
                    </select>
                </div>
            )}
          </div>
        </div>

      {filteredLoreEntries.length === 0 && (
        <p className={`${currentTheme.text} opacity-70 italic text-center py-8`}>
          {searchTerm ? `ไม่พบข้อมูลที่ตรงกับ "${searchTerm}"` : 
           activeProjectId && !loreEntries.some(l => l.projectId === activeProjectId && (!filterByType || filterByType.includes(l.type))) ? `โปรเจกต์นี้ยังไม่มี${getPageTitle().toLowerCase()}` : 
           `ยังไม่มี${getPageTitle().toLowerCase()}ในระบบ`}
        </p>
      )}


      {viewMode === 'card' && filteredLoreEntries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLoreEntries.map(entry => (
            <div key={entry.id} className={`${currentTheme.cardBg} rounded-xl p-5 flex flex-col justify-between group hover:shadow-xl transition-shadow duration-300`}>
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-semibold ${currentTheme.text} text-lg truncate flex items-center`}>
                    {entry.type === 'Character' && entry.avatarUrl ? 
                        <img src={entry.avatarUrl} alt={entry.title} className="w-6 h-6 rounded-full mr-2 object-cover" /> 
                        : entry.type === 'Character' ? <UserCircle2 size={20} className={`${currentTheme.accent.replace('bg-','text-')} mr-2 opacity-90`} />
                        : React.cloneElement(getCategoryIcon(entry.type), { size: 20, className: `${currentTheme.accent.replace('bg-','text-')} opacity-90`})} 
                    <span className="ml-1">{entry.title}</span>
                  </h3>
                  <div className="flex gap-1.5">
                      <button onClick={() => handleViewEntry(entry)} className={`p-1.5 ${currentTheme.textSecondary} hover:${currentTheme.text} transition-opacity`} title="ดูรายละเอียด"><Eye className="w-4 h-4"/></button>
                      <button onClick={() => handleEditEntry(entry)} className={`p-1.5 ${currentTheme.textSecondary} hover:${currentTheme.text} transition-opacity`} title="แก้ไข"><Edit2 className="w-4 h-4"/></button>
                      <button onClick={() => handleDeleteEntry(entry.id)} className="p-1.5 text-red-500 hover:text-red-400 transition-opacity" title="ลบ"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>
                <p className={`text-xs ${currentTheme.textSecondary} opacity-80 mb-1`}>ประเภท: {entry.type}{entry.type === 'Character' && entry.role ? ` (${entry.role})` : ''}</p>
                {entry.projectId && getProjectName(entry.projectId) && (<p className={`text-xs ${currentTheme.textSecondary} opacity-70 mb-2 flex items-center`}><Package size={12} className="mr-1 opacity-70"/> โปรเจกต์: {getProjectName(entry.projectId)}</p>)}
                <p className={`${currentTheme.textSecondary} text-sm line-clamp-3 mb-3`}>{entry.content || (entry.type === 'Character' ? 'ยังไม่มีคำอธิบาย' : 'ไม่มีเนื้อหา')}</p>
                 {entry.customFields && Object.keys(entry.customFields).length > 0 && (
                    <div className="text-xs opacity-70 mb-2">
                        {Object.entries(entry.customFields).slice(0, 2).map(([key, value]) => ( 
                            <p key={key} className="truncate"><strong>{key}:</strong> {String(value)}</p>
                        ))}
                        {Object.keys(entry.customFields).length > 2 && <p>...</p>}
                    </div>
                )}
              </div>
              <div className="flex gap-1.5 flex-wrap mt-auto">
                {entry.tags.map(tag => (<span key={tag} className={`${currentTheme.accent} bg-opacity-20 text-xs px-2 py-0.5 rounded-full ${currentTheme.accent.replace('bg-','text-')} font-medium`}>#{tag}</span>))}
              </div>
            </div>
          ))}
        </div>
      )}

    {viewMode === 'table' && filteredLoreEntries.length > 0 && (
        <div className={`${currentTheme.cardBg} rounded-xl overflow-x-auto shadow-lg`}>
          <table className={`w-full min-w-[900px] text-sm ${currentTheme.text}`}>
            <thead className={`${currentTheme.inputBg} bg-opacity-50`}>
              <tr>
                <th className="p-3 text-left font-semibold w-10"></th> {/* Avatar/Icon */}
                <th className="p-3 text-left font-semibold">ชื่อ</th>
                <th className="p-3 text-left font-semibold">ประเภท/บทบาท</th>
                {filterByType?.includes('Character') && <th className="p-3 text-left font-semibold">อายุ</th>}
                {filterByType?.includes('Character') && <th className="p-3 text-left font-semibold">เพศ</th>}
                <th className="p-3 text-left font-semibold max-w-xs">คำอธิบาย (ย่อ)</th>
                {filterByType?.includes('Character') && <th className="p-3 text-left font-semibold">สถานะ</th>}
                <th className="p-3 text-left font-semibold">โปรเจกต์</th>
                <th className="p-3 text-center font-semibold">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoreEntries.map(entry => (
                <tr key={entry.id} className={`border-b border-opacity-20 ${currentTheme.divider} hover:${currentTheme.inputBg} hover:bg-opacity-20 transition-colors`}>
                  <td className="p-3 align-top text-center">
                    {entry.type === 'Character' && entry.avatarUrl ? 
                        <img src={entry.avatarUrl} alt={entry.title} className="w-7 h-7 rounded-full object-cover mx-auto" /> 
                        : entry.type === 'Character' ? <UserCircle2 size={20} className={`${currentTheme.textSecondary} mx-auto`} />
                        : React.cloneElement(getCategoryIcon(entry.type), { size: 18, className: `${currentTheme.textSecondary} mx-auto`})}
                  </td>
                  <td className="p-3 align-top font-medium"><button onClick={() => handleViewEntry(entry)} className="hover:underline">{entry.title}</button></td>
                  <td className="p-3 align-top">{entry.type}{entry.type === 'Character' && entry.role ? ` (${entry.role})` : ''}</td>
                  {filterByType?.includes('Character') && <td className="p-3 align-top">{entry.age || '-'}</td>}
                  {filterByType?.includes('Character') && <td className="p-3 align-top">{entry.gender || '-'}</td>}
                  <td className="p-3 align-top max-w-xs truncate">{entry.content.substring(0, 100)}{entry.content.length > 100 ? '...' : ''}</td>
                  {filterByType?.includes('Character') && <td className="p-3 align-top">{entry.status || '-'}</td>}
                  <td className="p-3 align-top">{entry.projectId ? getProjectName(entry.projectId) || 'N/A' : <span className="opacity-50">ไม่ได้กำหนด</span>}</td>
                  <td className="p-3 align-top text-center"><div className="flex justify-center gap-2">
                      <button onClick={() => handleViewEntry(entry)} className={`p-1.5 ${currentTheme.textSecondary} hover:${currentTheme.text} transition-opacity`} title="ดูรายละเอียด"><Eye className="w-4 h-4"/></button>
                      <button onClick={() => handleEditEntry(entry)} className={`p-1.5 ${currentTheme.textSecondary} hover:${currentTheme.text} transition-opacity`} title="แก้ไข"><Edit2 className="w-4 h-4"/></button>
                      <button onClick={() => handleDeleteEntry(entry.id)} className="p-1.5 text-red-500 hover:text-red-400 opacity-70 hover:opacity-100 transition-opacity" title="ลบ"><Trash2 className="w-4 h-4"/></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    {showModal && (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className={`${currentTheme.cardBg} rounded-2xl p-7 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar`}>
            <div className="flex justify-between items-center mb-5">
                <h3 className={`text-xl font-semibold ${currentTheme.text}`}>{editingEntry ? 'แก้ไขข้อมูลโลก' : `เพิ่ม${currentEntryData.type === 'Character' ? 'ตัวละคร' : 'ข้อมูลโลก'}ใหม่`}</h3>
                <button 
                    onClick={() => { setShowModal(false); resetForm(); }} 
                    className={`${currentTheme.textSecondary} hover:text-opacity-100 p-1.5 rounded-md hover:bg-white/10 transition-all`} 
                    aria-label="ปิด"
                >
                    <X size={26} />
                </button>
            </div>
        <div className="space-y-4">
            <input type="text" placeholder={titlePlaceholder} value={currentEntryData.title} onChange={(e) => handleInputChange('title', e.target.value)} className={inputBaseClass} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select 
                value={currentEntryData.type} 
                onChange={(e) => handleInputChange('type', e.target.value as LoreEntry['type'])} 
                className={`${inputBaseClass} appearance-none bg-no-repeat bg-right-3`} 
                style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1.25em' }}
                disabled={filterByType && filterByType.length === 1 && availableLoreTypesInModal.length === 1} 
            >
                {availableLoreTypesInModal.map(type => <option key={type} value={type} className={optionBgClass}>{type}</option>)}
            </select>
            <select value={currentEntryData.projectId || ""} onChange={(e) => handleProjectChange(e.target.value)} className={`${inputBaseClass} appearance-none bg-no-repeat bg-right-3`} style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1.25em' }} aria-label="เลือกโปรเจกต์">
                <option value="" className={optionBgClass}>ไม่ได้กำหนดโปรเจกต์</option>
                {projects.map(project => (<option key={project.id} value={project.id} className={optionBgClass}>{project.name}</option>))}
            </select>
            </div>

            {currentEntryData.type === 'Character' && (
            <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="character-role" className={`block text-xs font-medium ${currentTheme.textSecondary} mb-1`}>บทบาทตัวละคร:</label>
                        <select id="character-role" value={currentEntryData.role || ""} onChange={(e) => handleInputChange('role', e.target.value)} className={`${inputBaseClass} appearance-none bg-no-repeat bg-right-3`} style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1.25em' }}>
                            <option value="" className={optionBgClass}>-- เลือกบทบาท --</option>
                            {characterRoles.map(role => <option key={role} value={role} className={optionBgClass}>{role}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="character-status" className={`block text-xs font-medium ${currentTheme.textSecondary} mb-1`}>สถานะ:</label>
                        <input type="text" id="character-status" placeholder="เช่น มีชีวิต, เสียชีวิต, หายสาบสูญ" value={currentEntryData.status || ''} onChange={(e) => handleInputChange('status', e.target.value)} className={inputBaseClass} />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="character-age" className={`block text-xs font-medium ${currentTheme.textSecondary} mb-1`}>อายุ:</label>
                        <input type="text" id="character-age" placeholder="เช่น 25, ไม่ทราบอายุ" value={currentEntryData.age || ''} onChange={(e) => handleInputChange('age', e.target.value)} className={inputBaseClass} />
                    </div>
                    <div>
                        <label htmlFor="character-gender" className={`block text-xs font-medium ${currentTheme.textSecondary} mb-1`}>เพศ:</label>
                        <input type="text" id="character-gender" placeholder="เช่น ชาย, หญิง, ไม่ระบุ" value={currentEntryData.gender || ''} onChange={(e) => handleInputChange('gender', e.target.value)} className={inputBaseClass} />
                    </div>
                </div>
                 <div>
                    <label htmlFor="character-avatarUrl" className={`block text-xs font-medium ${currentTheme.textSecondary} mb-1`}>URL รูปประจำตัว (ไม่บังคับ):</label>
                    <input type="text" id="character-avatarUrl" placeholder="https://example.com/avatar.png" value={currentEntryData.avatarUrl || ''} onChange={(e) => handleInputChange('avatarUrl', e.target.value)} className={inputBaseClass} />
                </div>
                <div>
                    <label htmlFor="character-arcana" className={`block text-xs font-medium ${currentTheme.textSecondary} mb-1 flex items-center`}><ArcanaIcon size={14} className="mr-1 opacity-70"/> Arcana ที่เกี่ยวข้อง (เลือกได้หลายรายการ):</label>
                    <select id="character-arcana" multiple value={currentEntryData.characterArcana || []} onChange={(e) => handleCharacterArcanaChange(e.currentTarget)} disabled={projectArcanaSystems.length === 0} className={`${inputBaseClass} leading-tight`} style={multiSelectStyle}>
                        {projectArcanaSystems.length === 0 && <option disabled className={optionBgClass}>ไม่มีระบบ Arcana ในโปรเจกต์</option>}
                        {projectArcanaSystems.map(arcana => (<option key={arcana.id} value={arcana.id} className={optionBgClass}>{arcana.title}</option>))}
                    </select>
                    {projectArcanaSystems.length > 0 && <p className={`text-xs ${currentTheme.textSecondary} opacity-70 mt-1`}>กด Ctrl/Cmd ค้างเพื่อเลือกหลายรายการ</p>}
                </div>
            </>
            )}

            <textarea placeholder={contentPlaceholder} value={currentEntryData.content} onChange={(e) => handleInputChange('content', e.target.value)} rows={currentEntryData.type === 'Character' ? 4 : 6} className={`${inputBaseClass} resize-y`} />
            
            {currentEntryData.type === 'Character' && (
            <div className="space-y-3">
                <label className={`block text-sm font-medium ${currentTheme.textSecondary} flex items-center`}><Link2 size={14} className="mr-1 opacity-70"/> ความสัมพันธ์:</label>
                {(currentEntryData.relationships || []).map((rel, index) => (
                <div key={index} className={`p-3 rounded-md ${currentTheme.inputBg} bg-opacity-50 space-y-2 border ${currentTheme.inputBorder} border-opacity-50`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select 
                        value={rel.targetCharacterId} 
                        onChange={(e) => handleRelationshipChange(index, 'targetCharacterId', e.target.value)} 
                        className={`${inputBaseClass} appearance-none bg-no-repeat bg-right-2.5`} 
                        style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1em' }}
                    >
                        <option value="" className={optionBgClass}>-- เลือกตัวละคร --</option>
                        {projectCharacters.filter(c => c.id !== editingEntry?.id).map(char => (<option key={char.id} value={char.id} className={optionBgClass}>{char.title}</option>))}
                    </select>
                    <select 
                        value={rel.relationshipType} 
                        onChange={(e) => handleRelationshipChange(index, 'relationshipType', e.target.value)} 
                        className={`${inputBaseClass} appearance-none bg-no-repeat bg-right-2.5`} 
                        style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1em' }}
                    >
                        {COMMON_RELATIONSHIP_TYPES.map(type => (<option key={type} value={type} className={optionBgClass}>{type}</option>))}
                    </select>
                    </div>
                     {rel.relationshipType === 'Other' && (
                        <input 
                            type="text" 
                            placeholder="ระบุประเภทความสัมพันธ์..." 
                            value={rel.description || ''} 
                            onChange={(e) => handleRelationshipChange(index, 'description', e.target.value)}
                            className={`${inputBaseClass} mt-1`}
                        />
                     )}
                    <textarea 
                        placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)" 
                        value={rel.relationshipType !== 'Other' ? rel.description || '' : (rel.description?.startsWith("กำหนดเอง: ") ? rel.description.substring("กำหนดเอง: ".length) : '')} 
                        onChange={(e) => handleRelationshipChange(index, 'description', e.target.value)} 
                        rows={1} 
                        className={`${inputBaseClass} resize-y`} 
                    />
                    <button onClick={() => handleRemoveRelationship(index)} className={`text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded ${currentTheme.inputBg} hover:bg-opacity-30 flex items-center gap-1`}><Trash2 size={12}/> ลบความสัมพันธ์</button>
                </div>
                ))}
                <button onClick={handleAddRelationship} className={`${currentTheme.button} ${currentTheme.buttonText} text-xs px-3 py-1.5 rounded-md flex items-center gap-1`}><Plus size={14}/> เพิ่มความสัมพันธ์</button>
            </div>
            )}

            <div className="space-y-3 mt-3">
                <label className={`block text-sm font-medium ${currentTheme.textSecondary} flex items-center`}><FileJson size={14} className="mr-1 opacity-70"/> ฟิลด์ข้อมูลที่กำหนดเอง:</label>
                {Object.entries(currentEntryData.customFields || {}).map(([key, value]) => (
                    <div key={key} className={`p-2.5 rounded-md ${currentTheme.inputBg} bg-opacity-50 flex items-center justify-between text-sm border ${currentTheme.inputBorder} border-opacity-50`}>
                        <div>
                            <strong className={`${currentTheme.text} opacity-95`}>{key}:</strong>
                            <span className={`${currentTheme.textSecondary} opacity-80 ml-2`}>{String(value)}</span>
                        </div>
                        <button onClick={() => handleRemoveCustomField(key)} className="text-red-400 hover:text-red-300 p-1" title="ลบฟิลด์"><Trash2 size={14}/></button>
                    </div>
                ))}
                <div className="flex gap-2 items-center">
                    <input 
                        type="text" 
                        placeholder="ชื่อฟิลด์ (Key)" 
                        value={customFieldKey} 
                        onChange={(e) => setCustomFieldKey(e.target.value)} 
                        className={`${inputBaseClass} w-1/2`}
                    />
                    <input 
                        type="text" 
                        placeholder="ค่าของฟิลด์" 
                        value={customFieldValue} 
                        onChange={(e) => setCustomFieldValue(e.target.value)} 
                        className={`${inputBaseClass} w-1/2`}
                    />
                </div>
                 <button type="button" onClick={handleAddCustomField} className={`${currentTheme.button} ${currentTheme.buttonText} text-xs px-3 py-1.5 rounded-md flex items-center gap-1`}><Plus size={14}/> เพิ่มฟิลด์ข้อมูล</button>
            </div>

            <input type="text" placeholder="แท็ก (คั่นด้วยจุลภาค)" value={currentEntryData.tags.join(', ')} onChange={(e) => handleTagsChange(e.target.value)} className={inputBaseClass} />
        </div>
        <div className="flex gap-3 mt-6">
            <button onClick={() => { setShowModal(false); resetForm(); }} className={`flex-1 py-2.5 rounded-xl ${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} hover:bg-opacity-80 transition-colors`}>ยกเลิก</button>
            <button onClick={handleSaveEntry} className={`flex-1 py-2.5 rounded-xl ${currentTheme.button} ${currentTheme.buttonText} hover:scale-105 transition-transform shadow-md`}>{editingEntry ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มข้อมูล'}</button>
        </div>
        </div>
    </div>
    )}
      
    {viewingEntry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className={`${currentTheme.cardBg} rounded-2xl p-7 w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar`}>
            <div className="flex justify-between items-start mb-4">
                <h3 className={`text-2xl font-semibold ${currentTheme.text} flex items-center`}>
                    {viewingEntry.type === 'Character' && viewingEntry.avatarUrl ? 
                        <img src={viewingEntry.avatarUrl} alt={viewingEntry.title} className="w-8 h-8 rounded-full mr-2 object-cover" /> 
                        : viewingEntry.type === 'Character' ? <UserCircle2 size={26} className="mr-2 opacity-80" />
                        : React.cloneElement(getCategoryIcon(viewingEntry.type), {size: 24})} 
                    <span className="ml-1">{viewingEntry.title}</span>
                </h3>
                <button 
                    onClick={() => setViewingEntry(null)} 
                    className={`${currentTheme.textSecondary} hover:text-opacity-100 p-1.5 rounded-md hover:bg-white/10 transition-all ml-2 flex-shrink-0`} 
                    aria-label="ปิด"
                >
                    <X className="w-7 h-7" />
                </button>
            </div>
            <p className={`text-sm ${currentTheme.textSecondary} opacity-80 mb-1`}>ประเภท: {viewingEntry.type}</p>
            {viewingEntry.type === 'Character' && viewingEntry.role && (<p className={`text-sm ${currentTheme.textSecondary} opacity-80 mb-1`}>บทบาท: {viewingEntry.role}</p>)}
            {viewingEntry.type === 'Character' && viewingEntry.age && (<p className={`text-sm ${currentTheme.textSecondary} opacity-80 mb-1`}>อายุ: {viewingEntry.age}</p>)}
            {viewingEntry.type === 'Character' && viewingEntry.gender && (<p className={`text-sm ${currentTheme.textSecondary} opacity-80 mb-1`}>เพศ: {viewingEntry.gender}</p>)}
            {viewingEntry.type === 'Character' && viewingEntry.status && (<p className={`text-sm ${currentTheme.textSecondary} opacity-80 mb-1`}>สถานะ: {viewingEntry.status}</p>)}
            {viewingEntry.projectId && getProjectName(viewingEntry.projectId) && (<p className={`text-sm ${currentTheme.textSecondary} opacity-70 mb-1 flex items-center`}><Package size={14} className="mr-1.5 opacity-80"/> โปรเจกต์: {getProjectName(viewingEntry.projectId)}</p>)}
            <p className={`text-xs ${currentTheme.textSecondary} opacity-60 mb-3`}>สร้างเมื่อ: {new Date(viewingEntry.createdAt).toLocaleDateString('th-TH', { day:'numeric', month:'short', year:'numeric'})}</p>

            <div className={`flex-grow min-h-[150px] p-3 rounded-lg ${currentTheme.inputBg} bg-opacity-50 ${currentTheme.textSecondary} text-sm mb-4 whitespace-pre-wrap break-words custom-scrollbar`}>{viewingEntry.content || (viewingEntry.type === 'Character' ? 'ไม่มีคำอธิบาย' : 'ไม่มีเนื้อหา')}</div>
            
            {viewingEntry.type === 'Character' && viewingEntry.characterArcana && viewingEntry.characterArcana.length > 0 && (
                <div className="mb-3">
                    <h4 className={`text-sm font-semibold ${currentTheme.text} opacity-90 mb-1 flex items-center`}><ArcanaIcon size={14} className="mr-1 opacity-70"/> Arcana ที่เกี่ยวข้อง:</h4>
                    <div className="flex flex-wrap gap-1.5">
                        {viewingEntry.characterArcana.map(arcanaId => {
                            const arcanaEntry = loreEntries.find(l => l.id === arcanaId);
                            return (<span key={arcanaId} className={`${currentTheme.accent} bg-opacity-30 text-xs px-2 py-0.5 rounded ${currentTheme.accent.replace('bg-','text-')} font-medium`}>{arcanaEntry ? arcanaEntry.title : arcanaId}</span>);
                        })}
                    </div>
                </div>
            )}

            {viewingEntry.type === 'Character' && viewingEntry.relationships && viewingEntry.relationships.length > 0 && (
                 <div className="mb-3">
                    <h4 className={`text-sm font-semibold ${currentTheme.text} opacity-90 mb-1 flex items-center`}><Link2 size={14} className="mr-1 opacity-70"/> ความสัมพันธ์:</h4>
                    <ul className="list-disc list-inside space-y-1 pl-2 text-sm">
                        {viewingEntry.relationships.map((rel, index) => (
                            <li key={index} className={`${currentTheme.textSecondary} opacity-80`}>
                                <strong className="font-medium">{rel.targetCharacterName || rel.targetCharacterId}</strong>: {rel.relationshipType}
                                {rel.relationshipType === 'Other' && rel.description ? <span className="text-xs opacity-70 italic"> ({rel.description.replace("กำหนดเอง: ", "")})</span> 
                                 : rel.description && rel.relationshipType !== 'Other' ? <span className="text-xs opacity-70 italic"> ({rel.description})</span>
                                 : null}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            {viewingEntry.customFields && Object.keys(viewingEntry.customFields).length > 0 && (
                 <div className="mb-3">
                    <h4 className={`text-sm font-semibold ${currentTheme.text} opacity-90 mb-1 flex items-center`}><FileJson size={14} className="mr-1 opacity-70"/> ฟิลด์ข้อมูลที่กำหนดเอง:</h4>
                    <div className={`space-y-1 text-sm ${currentTheme.inputBg} bg-opacity-20 p-2 rounded-md custom-scrollbar max-h-28 overflow-y-auto`}>
                        {Object.entries(viewingEntry.customFields).map(([key, value]) => (
                            <p key={key} className={`${currentTheme.textSecondary} opacity-80`}>
                                <strong className="opacity-95">{key}:</strong> {String(value)}
                            </p>
                        ))}
                    </div>
                </div>
            )}

            {viewingEntry.tags.length > 0 && (<div className="flex gap-1.5 flex-wrap mb-4">{viewingEntry.tags.map(tag => (<span key={tag} className={`${currentTheme.accent} bg-opacity-20 text-xs px-2.5 py-1 rounded-full ${currentTheme.accent.replace('bg-','text-')} font-medium`}>#{tag}</span>))}</div>)}
            <div className="mt-auto flex justify-end gap-3">
                <button onClick={() => { handleEditEntry(viewingEntry); }} className={`${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} px-4 py-2 rounded-xl transition-all hover:bg-opacity-80`}>แก้ไข</button>
                <button onClick={() => setViewingEntry(null)} className={`${currentTheme.button} ${currentTheme.buttonText} px-5 py-2 rounded-xl transition-all hover:scale-105 shadow-md`}>ปิด</button>
            </div>
        </div>
        </div>
    )}
    </div>
  );
};

export default WorldAnvilManager;
