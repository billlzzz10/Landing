
import React from 'react';
import { Clock, Play, Pause, RotateCcw, SkipForward, Save, ChevronDown, ChevronUp, Settings2 } from 'lucide-react';
import { PomodoroConfig } from './types';
import { AppTheme } from './NoteTaskApp';

interface PomodoroTimerProps {
  config: PomodoroConfig;
  tempConfig: PomodoroConfig;
  currentMode: 'work' | 'shortBreak' | 'longBreak';
  timeLeft: number;
  isActive: boolean;
  currentRound: number;
  currentTheme: AppTheme;
  onStartPause: () => void;
  onResetCurrent: () => void;
  onSkip: () => void;
  onConfigChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveConfig: () => void;
  formatTime: (seconds: number) => string;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  config,
  tempConfig,
  currentMode,
  timeLeft,
  isActive,
  currentRound,
  currentTheme,
  onStartPause,
  onResetCurrent,
  onSkip,
  onConfigChange,
  onSaveConfig,
  formatTime,
}) => {
  const progressPercentage = currentMode === 'work' ? (config.work * 60 - timeLeft) / (config.work * 60) * 100 :
                             currentMode === 'shortBreak' ? (config.shortBreak * 60 - timeLeft) / (config.shortBreak * 60) * 100 :
                             (config.longBreak * 60 - timeLeft) / (config.longBreak * 60) * 100;
  
  const modeText = currentMode === 'work' ? 'ทำงาน' : currentMode === 'shortBreak' ? 'พักสั้น' : 'พักยาว';

  return (
    <div className={`${currentTheme.cardBg} rounded-2xl p-6 sm:p-8 mb-6 shadow-xl`}>
        <h3 className={`text-2xl font-semibold ${currentTheme.text} mb-6 flex items-center`}>
            <Clock className={`w-6 h-6 mr-2.5 ${currentTheme.accent.replace('bg-','text-')}`}/> Pomodoro Timer
        </h3>
        
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto mb-6">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Background Circle */}
                <circle
                    className="stroke-current opacity-20"
                    style={{ color: currentTheme.accent.replace('bg-','') }}
                    strokeWidth="8"
                    cx="50"
                    cy="50"
                    r="42"
                    fill="transparent"
                />
                {/* Progress Circle */}
                <circle
                    className="stroke-current transition-all duration-500"
                    style={{ color: currentTheme.accent.replace('bg-','') }}
                    strokeWidth="8"
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="42"
                    fill="transparent"
                    strokeDasharray="264" /* 2 * PI * 42 */
                    strokeDashoffset={264 - (progressPercentage / 100) * 264}
                    transform="rotate(-90 50 50)"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className={`text-4xl sm:text-5xl font-bold ${currentTheme.text}`}>{formatTime(timeLeft)}</p>
                <p className={`${currentTheme.textSecondary} text-sm mt-1`}>
                    {modeText} (รอบ {currentRound})
                </p>
            </div>
        </div>

        <div className="flex justify-center gap-3 sm:gap-4 mb-8 flex-wrap">
            <button 
                onClick={onStartPause} 
                className={`${currentTheme.button} ${currentTheme.buttonText} px-6 py-3 rounded-lg flex items-center gap-2 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all`}
            >
                {isActive ? <Pause className="w-5 h-5"/> : <Play className="w-5 h-5"/>} {isActive ? 'หยุดชั่วคราว' : 'เริ่ม'}
            </button>
            <button 
                onClick={onResetCurrent} 
                className={`${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} px-5 py-3 rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm hover:bg-opacity-80 transition-all`}
            >
                <RotateCcw className="w-4 h-4"/> รีเซ็ต
            </button>
            <button 
                onClick={onSkip} 
                className={`${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} px-5 py-3 rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm hover:bg-opacity-80 transition-all`}
            >
                <SkipForward className="w-4 h-4"/> ข้ามรอบ
            </button>
        </div>
        <details className="group">
            <summary className={`cursor-pointer ${currentTheme.textSecondary} hover:text-opacity-100 text-sm list-none flex items-center justify-center font-medium`}>
                <Settings2 size={16} className="mr-1.5" />
                ตั้งค่า Pomodoro
                <ChevronDown className="w-4 h-4 ml-1 group-open:hidden"/>
                <ChevronUp className="w-4 h-4 ml-1 hidden group-open:inline"/>
            </summary>
            <div className={`mt-6 p-4 rounded-lg ${currentTheme.inputBg} bg-opacity-50 border ${currentTheme.divider}`}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    {[
                        {label: 'ทำงาน (นาที):', name: 'work', value: tempConfig.work},
                        {label: 'พักสั้น (นาที):', name: 'shortBreak', value: tempConfig.shortBreak},
                        {label: 'พักยาว (นาที):', name: 'longBreak', value: tempConfig.longBreak},
                        {label: 'รอบก่อนพักยาว:', name: 'rounds', value: tempConfig.rounds},
                    ].map(field => (
                        <div key={field.name}>
                            <label htmlFor={`pomodoro-${field.name}`} className={`block mb-1.5 ${currentTheme.textSecondary} text-xs`}>{field.label}</label>
                            <input 
                                type="number" 
                                id={`pomodoro-${field.name}`} 
                                name={field.name} 
                                value={field.value} 
                                onChange={onConfigChange} 
                                className={`w-full px-3 py-2 rounded-md ${currentTheme.inputBg} ${currentTheme.inputText} ${currentTheme.inputBorder} ${currentTheme.focusRing} focus:border-transparent focus:outline-none`}
                            />
                        </div>
                    ))}
                </div>
                <button 
                    onClick={onSaveConfig} 
                    className={`${currentTheme.button} ${currentTheme.buttonText} mt-6 w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all`}
                >
                    <Save className="w-4 h-4"/> บันทึกการตั้งค่า
                </button>
            </div>
        </details>
    </div>
  );
};

export default PomodoroTimer;
