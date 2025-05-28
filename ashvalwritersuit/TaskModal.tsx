

import React from 'react';
import { AppTask } from './types'; 
import EmojiPicker from './EmojiPicker'; 
import { AppTheme } from './NoteTaskApp';
import { X } from 'lucide-react';


interface TaskModalProps {
  showModal: boolean;
  taskData: { title: string; icon?: string; priority: string; dueDate: string; category: string };
  onTaskDataChange: (field: keyof AppTask | 'title' | 'icon' | 'priority' | 'dueDate' | 'category', value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  currentTheme: AppTheme;
}

const TaskModal: React.FC<TaskModalProps> = ({
  showModal,
  taskData,
  onTaskDataChange,
  onSave,
  onCancel,
  currentTheme,
}) => {
  if (!showModal) return null;

  const selectArrowSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='${currentTheme.text === 'text-slate-200' || currentTheme.text === 'text-white' ? '%23CBD5E1' : '%236B7280'}'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E`;
  const optionBgClass = currentTheme.inputBg.includes('slate-700') || currentTheme.inputBg.includes('black') || currentTheme.inputBg.includes('white/10') ? 'bg-slate-700' : 'bg-gray-200';
  
  const baseInputStyle = `w-full px-4 py-3 rounded-xl ${currentTheme.inputBg} ${currentTheme.inputText} ${currentTheme.inputBorder} ${currentTheme.inputPlaceholder} ${currentTheme.focusRing} focus:border-transparent focus:outline-none`;
  const selectStyle = `${baseInputStyle} appearance-none bg-no-repeat bg-right-3`;


  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-40 p-4">
      <div className={`${currentTheme.cardBg} rounded-2xl p-6 sm:p-8 w-full max-w-lg shadow-2xl`}>
        <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl sm:text-2xl font-semibold ${currentTheme.text}`}>เพิ่มงานใหม่</h3>
            <button 
                onClick={onCancel} 
                className={`${currentTheme.textSecondary} hover:text-opacity-100 p-1.5 rounded-md hover:bg-white/10 transition-all`} 
                aria-label="ปิด"
            >
                <X size={26} />
            </button>
        </div>
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <EmojiPicker
              selectedEmoji={taskData.icon}
              onEmojiSelect={(emoji) => onTaskDataChange('icon', emoji)}
              currentTheme={currentTheme}
            />
            <input
                type="text"
                placeholder="ชื่องาน..."
                value={taskData.title}
                onChange={(e) => onTaskDataChange('title', e.target.value)}
                className={`flex-grow h-12 ${baseInputStyle}`}
                aria-label="ชื่องาน"
            />
          </div>
          <select
            value={taskData.priority}
            onChange={(e) => onTaskDataChange('priority', e.target.value)}
            className={`${selectStyle}`}
            style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1.25em' }}
            aria-label="ระดับความสำคัญ"
          >
            <option value="low" className={optionBgClass}>ความสำคัญต่ำ</option>
            <option value="medium" className={optionBgClass}>ความสำคัญปานกลาง</option>
            <option value="high" className={optionBgClass}>ความสำคัญสูง</option>
          </select>
          <input
            type="date"
            value={taskData.dueDate}
            onChange={(e) => onTaskDataChange('dueDate', e.target.value)}
            className={`${baseInputStyle}`}
            aria-label="วันที่ครบกำหนด"
          />
          <select
            value={taskData.category}
            onChange={(e) => onTaskDataChange('category', e.target.value)}
            className={`${selectStyle}`}
            style={{ backgroundImage: `url("${selectArrowSVG}")`, backgroundSize: '1.25em' }}
            aria-label="ประเภทงาน"
          >
            <option value="general" className={optionBgClass}>ทั่วไป</option>
            <option value="writing" className={optionBgClass}>การเขียน</option>
            <option value="design" className={optionBgClass}>การออกแบบ</option>
            <option value="research" className={optionBgClass}>การค้นคว้า</option>
            <option value="personal" className={optionBgClass}>ส่วนตัว</option>
            <option value="editing" className={optionBgClass}>ตรวจแก้</option>
            <option value="marketing" className={optionBgClass}>การตลาด</option>
          </select>
        </div>
        <div className={`flex gap-4 mt-8 pt-6 border-t ${currentTheme.divider}`}>
          <button
            onClick={onCancel}
            className={`flex-1 py-3 rounded-lg ${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} font-medium transition-all duration-300 hover:bg-opacity-80`}
          >
            ยกเลิก
          </button>
          <button
            onClick={onSave}
            className={`flex-1 py-3 rounded-lg ${currentTheme.button} ${currentTheme.buttonText} font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5`}
          >
            เพิ่มงาน
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
