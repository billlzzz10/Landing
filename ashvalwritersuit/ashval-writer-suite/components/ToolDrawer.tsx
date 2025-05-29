import React, { forwardRef } from 'react';

interface ToolDrawerProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
}

const ToolDrawer = forwardRef<HTMLDivElement, ToolDrawerProps>(({ id, isOpen, onClose }, ref) => {
  return (
    <div
      id={id}
      ref={ref}
      className={`tool-drawer-transition fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl p-6 transform z-[60] overflow-y-auto
                  ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      aria-labelledby="toolDrawerLabel"
      aria-hidden={!isOpen}
      role="dialog"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 id="toolDrawerLabel" className="text-xl font-semibold text-indigo-800 dark:text-indigo-200">
          เครื่องมือพิเศษ
        </h3>
        <button
          id="closeToolDrawerButton"
          onClick={onClose}
          aria-label="ปิดลิ้นชักเครื่องมือ"
          className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-300 smooth-transition p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>
      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">AI Writer ขั้นสูง</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">เข้าถึงการตั้งค่า AI และ Prompt ที่ซับซ้อน...</p>
        </div>
        <div>
          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">พจนานุกรม / อรรถาภิธาน</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">ค้นหาความหมายและคำศัพท์...</p>
        </div>
        <div>
          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Pomodoro Timer</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">ช่วยให้คุณมีสมาธิกับการทำงาน...</p>
        </div>
      </div>
    </div>
  );
});

ToolDrawer.displayName = 'ToolDrawer';
export default ToolDrawer;