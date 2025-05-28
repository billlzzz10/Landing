

import React, { useState, useEffect } from 'react';
import { SceneCreatorFormData, ScenePurpose, LoreEntry } from './types';
import { AppTheme } from './NoteTaskApp'; 
import { Send, Film, Users, Zap as ArcanaIcon, BookOpen as ChapterIcon, MapPin, Clock, Cloud, Sparkles, ShieldAlert, Edit, Thermometer, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

interface SceneCreatorFormProps {
  currentTheme: AppTheme;
  onSubmitSceneData: (sceneData: SceneCreatorFormData) => void;
  isLoading: boolean;
  initialData?: SceneCreatorFormData | null;
  projectCharacters: LoreEntry[]; 
  projectArcanaSystems: LoreEntry[]; 
}

const initialFormState: SceneCreatorFormData = {
  title: '',
  chapter: '',
  sceneNumber: '',
  settingLocation: '',
  timeOfDay: '',
  weather: '',
  description: '',
  charactersInvolved: [],
  povCharacter: '',
  emotionalArc: '',
  conflictType: '',
  keyPlotPoints: '',
  foreshadowing: '',
  arcanaElements: [],
  purpose: '',
  advancedYaml: '',
};

const SceneCreatorForm: React.FC<SceneCreatorFormProps> = ({
  currentTheme,
  onSubmitSceneData,
  isLoading,
  initialData,
  projectCharacters,
  projectArcanaSystems,
}) => {
  const [formData, setFormData] = useState<SceneCreatorFormData>(initialData || initialFormState);
  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(initialFormState); 
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (name: 'charactersInvolved' | 'arcanaElements', selectedOptions: HTMLSelectElement) => {
    const values = Array.from(selectedOptions.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, [name]: values }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitSceneData(formData);
  };

  const purposeOptions: { value: ScenePurpose; label: string }[] = [
    { value: '', label: 'เลือกจุดประสงค์...' },
    { value: 'advance-plot', label: 'ดำเนินเรื่อง' },
    { value: 'character-development', label: 'พัฒนาตัวละคร' },
    { value: 'world-building', label: 'สร้างโลก' },
    { value: 'reveal', label: 'เปิดเผยความลับ' },
    { value: 'foreshadowing', label: 'ส่งสัญญาณล่วงหน้า' },
    { value: 'action', label: 'ฉากต่อสู้/ปะทะ' },
    { value: 'dialogue', label: 'สนทนา/ความสัมพันธ์' },
  ];

  const selectArrowSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='${currentTheme.text === 'text-white' || currentTheme.text === 'text-slate-300' ? '%23CBD5E1' : '%2364748B'}'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E`;
  const optionBgClass = currentTheme.text === 'text-white' || currentTheme.text === 'text-slate-300' ? 'bg-slate-700' : 'bg-gray-200 text-gray-800';
  const multiSelectStyle = {
    minHeight: '80px', 
    padding: '0.5rem 0.75rem',
  };
  const inputBaseClass = `w-full px-3 py-2 rounded-lg ${currentTheme.inputBg} ${currentTheme.inputText} ${currentTheme.inputBorder} focus:outline-none focus:ring-2 ${currentTheme.accent.replace('bg-','focus:ring-')} text-sm`;
  const labelBaseClass = `block text-sm font-medium ${currentTheme.text} opacity-90 mb-1 flex items-center`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-4">
      <h4 className={`${labelBaseClass} text-md font-semibold`}>
        <Film className={`w-5 h-5 mr-2 ${currentTheme.accent.replace('bg-','text-')}`} />
        รายละเอียดฉาก (สำหรับ AI)
      </h4>
      
      <div>
        <label htmlFor="scene-title" className={labelBaseClass}>ชื่อฉาก</label>
        <input type="text" id="scene-title" name="title" value={formData.title} onChange={handleChange} disabled={isLoading} className={inputBaseClass} placeholder="ระบุชื่อฉาก..." />
      </div>
      
      <div>
        <label htmlFor="scene-description" className={`${labelBaseClass}`}><Edit size={14} className="mr-1.5 opacity-70" />คำอธิบายฉากโดยรวม (สำคัญมาก)</label>
        <textarea id="scene-description" name="description" rows={4} value={formData.description} onChange={handleChange} disabled={isLoading} className={`${inputBaseClass} resize-y`} placeholder="อธิบายสิ่งที่เกิดขึ้นในฉากนี้, เป้าหมาย, หรือใจความสำคัญ... AI จะใช้ข้อมูลส่วนนี้เป็นหลักในการสร้าง/วิเคราะห์ฉาก"/>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
            <label htmlFor="scene-settingLocation" className={labelBaseClass}><MapPin size={14} className="mr-1.5 opacity-70" />สถานที่ (Location)</label>
            <input type="text" id="scene-settingLocation" name="settingLocation" value={formData.settingLocation || ''} onChange={handleChange} disabled={isLoading} className={inputBaseClass} placeholder="เช่น ป่าต้องห้าม, ห้องบัลลังก์"/>
        </div>
        <div>
          <label htmlFor="scene-purpose" className={`${labelBaseClass}`}>จุดประสงค์ของฉาก (Purpose)</label>
          <select id="scene-purpose" name="purpose" value={formData.purpose} onChange={handleChange} disabled={isLoading} className={`${inputBaseClass} appearance-none bg-no-repeat bg-right-2.5`} style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1.25em' }}>
            {purposeOptions.map(opt => <option key={opt.value} value={opt.value} className={optionBgClass}>{opt.label}</option>))}
          </select>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowAdvancedDetails(!showAdvancedDetails)}
          className={`w-full flex items-center justify-between gap-1.5 text-sm font-medium ${currentTheme.text} hover:opacity-80 py-2.5 px-3 rounded-lg ${currentTheme.inputBg} border ${currentTheme.inputBorder} transition-all`}
          aria-expanded={showAdvancedDetails}
          aria-controls="advanced-scene-details"
        >
          <span>รายละเอียดเพิ่มเติม (ไม่บังคับ)</span>
          {showAdvancedDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {showAdvancedDetails && (
          <div id="advanced-scene-details" className={`mt-4 space-y-4 p-3 rounded-lg border ${currentTheme.inputBorder} bg-opacity-50 ${currentTheme.inputBg}`}>
            <fieldset className={`p-3 rounded-lg border ${currentTheme.text === 'text-white' || currentTheme.text === 'text-slate-300' ? 'border-slate-600/50' : 'border-gray-300/50'}`}>
              <legend className={`text-xs font-medium px-1 ${currentTheme.text} opacity-80`}>การจัดระเบียบ (Organizational)</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div>
                    <label htmlFor="scene-chapter" className={labelBaseClass}><ChapterIcon size={14} className="mr-1.5 opacity-70" />บทที่/ตอน</label>
                    <input type="text" id="scene-chapter" name="chapter" value={formData.chapter || ''} onChange={handleChange} disabled={isLoading} className={inputBaseClass} placeholder="เช่น บทที่ 1, ตอนที่ 5"/>
                </div>
                <div>
                    <label htmlFor="scene-number" className={labelBaseClass}>หมายเลขฉาก</label>
                    <input type="text" id="scene-number" name="sceneNumber" value={formData.sceneNumber || ''} onChange={handleChange} disabled={isLoading} className={inputBaseClass} placeholder="เช่น 1, 2.1"/>
                </div>
              </div>
            </fieldset>
            
            <fieldset className={`p-3 rounded-lg border ${currentTheme.text === 'text-white' || currentTheme.text === 'text-slate-300' ? 'border-slate-600/50' : 'border-gray-300/50'}`}>
              <legend className={`text-xs font-medium px-1 ${currentTheme.text} opacity-80`}>บรรยากาศและเวลา</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div>
                      <label htmlFor="scene-timeOfDay" className={labelBaseClass}><Clock size={14} className="mr-1.5 opacity-70" />ช่วงเวลาของวัน</label>
                      <input type="text" id="scene-timeOfDay" name="timeOfDay" value={formData.timeOfDay || ''} onChange={handleChange} disabled={isLoading} className={inputBaseClass} placeholder="เช่น รุ่งสาง, ยามวิกาล"/>
                  </div>
                  <div>
                      <label htmlFor="scene-weather" className={labelBaseClass}><Cloud size={14} className="mr-1.5 opacity-70" />สภาพอากาศ</label>
                      <input type="text" id="scene-weather" name="weather" value={formData.weather || ''} onChange={handleChange} disabled={isLoading} className={inputBaseClass} placeholder="เช่น ฝนตกหนัก, มีหมอก"/>
                  </div>
              </div>
            </fieldset>
            
             <fieldset className={`p-3 rounded-lg border ${currentTheme.text === 'text-white' || currentTheme.text === 'text-slate-300' ? 'border-slate-600/50' : 'border-gray-300/50'}`}>
                <legend className={`text-xs font-medium px-1 ${currentTheme.text} opacity-80`}>ตัวละครและมุมมอง</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <div>
                    <label htmlFor="characters-involved" className={`${labelBaseClass}`}><Users size={14} className="mr-1.5 opacity-70"/>ตัวละครที่เกี่ยวข้อง</label>
                    <select id="characters-involved" name="charactersInvolved" multiple value={formData.charactersInvolved} onChange={(e) => handleMultiSelectChange('charactersInvolved', e.currentTarget)} disabled={isLoading || projectCharacters.length === 0} className={`${inputBaseClass} leading-tight`} style={multiSelectStyle}>
                        {projectCharacters.length === 0 && <option disabled className={optionBgClass}>ไม่มีตัวละครในโปรเจกต์</option>}
                        {projectCharacters.map(char => (<option key={char.id} value={char.id} className={optionBgClass}>{char.title}</option>))}
                    </select>
                    {projectCharacters.length > 0 && <p className={`text-xs ${currentTheme.text} opacity-60 mt-1`}>กด Ctrl/Cmd ค้างไว้เพื่อเลือกหลายรายการ</p>}
                    </div>
                    <div>
                    <label htmlFor="pov-character" className={labelBaseClass}>ตัวละคร POV</label>
                    <select id="pov-character" name="povCharacter" value={formData.povCharacter} onChange={handleChange} disabled={isLoading || projectCharacters.length === 0} className={`${inputBaseClass} appearance-none bg-no-repeat bg-right-2.5`} style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1.25em' }}>
                        <option value="" className={optionBgClass}>-- เลือกตัวละคร POV --</option>
                        {projectCharacters.length === 0 && <option disabled className={optionBgClass}>ไม่มีตัวละครในโปรเจกต์</option>}
                        {projectCharacters.map(char => (<option key={char.id} value={char.id} className={optionBgClass}>{char.title}</option>))}
                    </select>
                    </div>
                </div>
            </fieldset>

            <fieldset className={`p-3 rounded-lg border ${currentTheme.text === 'text-white' || currentTheme.text === 'text-slate-300' ? 'border-slate-600/50' : 'border-gray-300/50'}`}>
              <legend className={`text-xs font-medium px-1 ${currentTheme.text} opacity-80`}>อารมณ์และความขัดแย้ง</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div>
                      <label htmlFor="scene-emotionalArc" className={`${labelBaseClass}`}><Thermometer size={14} className="mr-1.5 opacity-70" />เส้นอารมณ์</label>
                      <textarea id="scene-emotionalArc" name="emotionalArc" rows={2} value={formData.emotionalArc || ''} onChange={handleChange} disabled={isLoading} className={`${inputBaseClass} resize-y`} placeholder="เช่น สับสน > เจ็บปวด > สิ้นหวัง"/>
                  </div>
                  <div>
                      <label htmlFor="scene-conflictType" className={`${labelBaseClass}`}><ShieldAlert size={14} className="mr-1.5 opacity-70" />ประเภทความขัดแย้ง</label>
                      <textarea id="scene-conflictType" name="conflictType" rows={2} value={formData.conflictType || ''} onChange={handleChange} disabled={isLoading} className={`${inputBaseClass} resize-y`} placeholder="เช่น ภายใน (การตัดสินใจ), ภายนอก (การต่อสู้)"/>
                  </div>
              </div>
            </fieldset>

            <fieldset className={`p-3 rounded-lg border ${currentTheme.text === 'text-white' || currentTheme.text === 'text-slate-300' ? 'border-slate-600/50' : 'border-gray-300/50'}`}>
              <legend className={`text-xs font-medium px-1 ${currentTheme.text} opacity-80`}>รายละเอียดโครงเรื่อง</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div>
                      <label htmlFor="scene-keyPlotPoints" className={`${labelBaseClass}`}>จุดสำคัญของเนื้อเรื่อง (Key Plot Points)</label>
                      <textarea id="scene-keyPlotPoints" name="keyPlotPoints" rows={3} value={formData.keyPlotPoints || ''} onChange={handleChange} disabled={isLoading} className={`${inputBaseClass} resize-y`} placeholder="เช่น\n- ตัวเอกพบเบาะแสสำคัญ\n- เกิดการหักมุม"/>
                  </div>
                  <div>
                      <label htmlFor="scene-foreshadowing" className={`${labelBaseClass}`}>การปูเรื่อง/บอกใบ้ (Foreshadowing)</label>
                      <textarea id="scene-foreshadowing" name="foreshadowing" rows={3} value={formData.foreshadowing || ''} onChange={handleChange} disabled={isLoading} className={`${inputBaseClass} resize-y`} placeholder="เช่น\n- สัญลักษณ์ที่ปรากฏซ้ำๆ\n- คำพูดปริศนา"/>
                  </div>
              </div>
            </fieldset>
            
            <div>
                <label htmlFor="arcana-elements" className={`${labelBaseClass}`}><ArcanaIcon size={14} className="mr-1.5 opacity-70"/>ระบบ Arcana ที่ใช้</label>
                <select id="arcana-elements" name="arcanaElements" multiple value={formData.arcanaElements} onChange={(e) => handleMultiSelectChange('arcanaElements', e.currentTarget)} disabled={isLoading || projectArcanaSystems.length === 0} className={`${inputBaseClass} leading-tight`} style={multiSelectStyle}>
                    {projectArcanaSystems.length === 0 && <option disabled className={optionBgClass}>ไม่มีระบบ Arcana ในโปรเจกต์</option>}
                    {projectArcanaSystems.map(arcana => (<option key={arcana.id} value={arcana.id} className={optionBgClass}>{arcana.title}</option>))}
                </select>
                {projectArcanaSystems.length > 0 && <p className={`text-xs ${currentTheme.text} opacity-60 mt-1`}>กด Ctrl/Cmd ค้างไว้เพื่อเลือกหลายรายการ</p>}
            </div>

            <div>
              <label htmlFor="advanced-yaml" className={`${labelBaseClass}`}>YAML Configuration (สำหรับผู้ใช้ขั้นสูง)</label>
              <textarea id="advanced-yaml" name="advancedYaml" rows={4} value={formData.advancedYaml} onChange={handleChange} disabled={isLoading} className={`${inputBaseClass} font-mono resize-y`} placeholder="ข้อมูล YAML เพิ่มเติม (ถ้ามี)..."/>
            </div>
          </div>
        )}
      </div>


      <div className="flex justify-end mt-4">
        <button type="submit" disabled={isLoading || !formData.description.trim()} className={`${currentTheme.button} ${currentTheme.buttonText} flex items-center justify-center gap-2 font-medium py-2.5 px-5 rounded-lg transition-transform duration-200 shadow-md hover:scale-105 disabled:opacity-60 disabled:hover:scale-100`}>
          {isLoading ? (<Loader2 className={`w-5 h-5 ${currentTheme.buttonText} animate-spin`} aria-hidden="true" />) : (<Send className="w-4 h-4" />)}
          {isLoading ? 'กำลังส่ง...' : 'ส่งข้อมูลฉากให้ AI'}
        </button>
      </div>
    </form>
  );
};

export default SceneCreatorForm;
