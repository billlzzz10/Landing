
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppNote, AppTask, LoreEntry, Project } from './types'; 
import { AppTheme } from './NoteTaskApp'; 
import { BarChart2, ListChecks, FileText, Users, Layers, Aperture, Edit3, BookOpen, Type, Brain, Zap, Clock, FilePlus2, SquareTerminal, Settings, Package } from 'lucide-react'; 

interface DashboardPageProps {
  notes: AppNote[];
  tasks: AppTask[];
  loreEntries: LoreEntry[]; 
  activeProject: Project | null | undefined; 
  currentTheme: AppTheme;
  onQuickAddNote: () => void;
  onQuickAddTask: () => void;
  onNavigateToTab: (path: string) => void; // This prop might be less used now
}

const DashboardPage: React.FC<DashboardPageProps> = ({ 
  notes, 
  tasks, 
  loreEntries, 
  activeProject, 
  currentTheme,
  onQuickAddNote,
  onQuickAddTask,
  // onNavigateToTab // This prop might be less used if NavLinks handle navigation
}) => {
  const navigate = useNavigate();
  const projectNotes = activeProject ? notes.filter(n => n.projectId === activeProject.id) : notes;
  const projectTasks = activeProject ? tasks.filter(t => t.projectId === activeProject.id) : tasks;
  const projectLore = activeProject ? loreEntries.filter(l => l.projectId === activeProject.id) : loreEntries;

  const totalNotesInContext = projectNotes.length;
  const totalTasksInContext = projectTasks.length;
  const completedTasksInContext = projectTasks.filter(task => task.completed).length;
  const incompleteTasksInContext = totalTasksInContext - completedTasksInContext;
  
  const totalCharsInNotes = projectNotes.reduce((sum, note) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = note.rawMarkdownContent || note.content;
    const text = tempDiv.textContent || tempDiv.innerText || "";
    return sum + text.length;
  }, 0);

  const episodeChapterCount = projectNotes.filter(n => 
    ['chapter', 'episode'].includes(n.category.toLowerCase()) ||
    n.tags.some(tag => ['chapter', 'episode'].includes(tag.toLowerCase()))
  ).length;

  const characterCount = projectLore.filter(l => l.type === 'Character').length;
  const sceneCount = projectNotes.filter(n => 
    n.category.toLowerCase() === 'scene' ||
    n.tags.some(tag => tag.toLowerCase() === 'scene')
  ).length;
  const arcanaSystemCount = projectLore.filter(l => l.type === 'ArcanaSystem' || (l.type === 'Concept' && l.tags.some(tag => tag.toLowerCase() === 'arcana'))).length;
  const loreEntryCount = projectLore.length;

  const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; details?: string; colorClass?: string; onClick?: () => void; }> = ({ title, value, icon: Icon, details, colorClass, onClick }) => (
    <div 
      className={`${currentTheme.cardBg} p-5 sm:p-6 rounded-xl shadow-xl flex items-center space-x-4 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      <div className={`p-3 sm:p-4 rounded-full ${colorClass || currentTheme.accent} bg-opacity-20 flex-shrink-0`}>
        <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${colorClass || currentTheme.accent.replace('bg-','text-')}`} />
      </div>
      <div>
        <p className={`${currentTheme.textSecondary} text-sm sm:text-base`}>{title}</p>
        <p className={`text-2xl sm:text-3xl font-bold ${currentTheme.text}`}>{value}</p>
        {details && <p className={`${currentTheme.textSecondary} text-xs mt-0.5`}>{details}</p>}
      </div>
    </div>
  );
  
  const QuickActionCard: React.FC<{ title: string; icon: React.ElementType; onClick: () => void; description?: string;}> = ({ title, icon: Icon, onClick, description }) => (
    <button
      onClick={onClick}
      className={`${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-center text-center group hover:border hover:${currentTheme.accent.replace('bg-','border-')}/40`}
      aria-label={title}
    >
      <div className={`p-3 rounded-full ${currentTheme.accent} bg-opacity-20 mb-3 transition-all duration-300 group-hover:scale-110`}>
        <Icon className={`w-7 h-7 ${currentTheme.accent.replace('bg-','text-')}`} />
      </div>
      <h4 className={`font-semibold ${currentTheme.text} text-md mb-1`}>{title}</h4>
      {description && <p className={`${currentTheme.textSecondary} text-xs`}>{description}</p>}
    </button>
  );

  return (
    <div className="py-6">
      <h2 className={`text-3xl sm:text-4xl font-bold ${currentTheme.text} mb-8 text-center`}>
        {activeProject ? `ภาพรวมโปรเจกต์: ${activeProject.name}` : "ภาพรวมทั้งหมด"}
      </h2>

      {activeProject && (activeProject.genre || activeProject.description) && (
        <div className={`${currentTheme.cardBg} p-6 rounded-xl shadow-xl mb-8`}>
          {activeProject.genre && (
            <p className={`${currentTheme.text} text-md mb-1.5`}>
              <span className={`font-semibold opacity-80 ${currentTheme.textSecondary}`}>ประเภท:</span> {activeProject.genre}
            </p>
          )}
          {activeProject.description && (
            <p className={`${currentTheme.textSecondary} text-sm leading-relaxed`}>
             {activeProject.description}
            </p>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 mb-8">
        <StatCard title="โน้ตทั้งหมด" value={totalNotesInContext} icon={FileText} onClick={() => navigate('/notes')} />
        <StatCard title="งานทั้งหมด" value={totalTasksInContext} icon={ListChecks} details={`${completedTasksInContext} เสร็จสิ้น`} onClick={() => navigate('/tasks')} />
        <StatCard title="คลังข้อมูลโลก" value={loreEntryCount} icon={BookOpen} onClick={() => navigate('/world-items')} />
        <StatCard title="ตัวอักษรในโน้ต" value={totalCharsInNotes.toLocaleString()} icon={Type} />
        
        <StatCard title="บท/ตอน" value={episodeChapterCount} icon={Layers} colorClass="text-purple-400" onClick={() => navigate('/notes')}/>
        <StatCard title="ตัวละคร" value={characterCount} icon={Users} colorClass="text-indigo-400" onClick={() => navigate('/characters')}/>
        <StatCard title="ฉาก" value={sceneCount} icon={Aperture} colorClass="text-pink-400" onClick={() => navigate('/notes')}/>
        <StatCard title="ระบบ Arcana" value={arcanaSystemCount} icon={Brain} colorClass="text-cyan-400" onClick={() => navigate('/magic-systems')}/> 
      </div>
      
      <div className={`${currentTheme.cardBg} p-6 rounded-xl shadow-xl mb-8`}>
        <h3 className={`text-xl font-semibold ${currentTheme.text} mb-5 border-b ${currentTheme.divider} pb-3 flex items-center`}>
          <SquareTerminal className={`w-5 h-5 mr-2.5 ${currentTheme.accent.replace('bg-','text-')}`} />
          เครื่องมือด่วน
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionCard title="เพิ่มโน้ตใหม่" icon={FilePlus2} onClick={onQuickAddNote} description="สร้างโน้ตสำหรับไอเดียหรือเนื้อหาใหม่"/>
          <QuickActionCard title="เพิ่มงานใหม่" icon={ListChecks} onClick={onQuickAddTask} description="สร้างรายการสิ่งที่ต้องทำใหม่"/>
          <QuickActionCard title="เปิดคลังข้อมูลโลก" icon={BookOpen} onClick={() => navigate('/world-items')} description="จัดการตัวละคร สถานที่ และข้อมูลโลก"/>
          <QuickActionCard title="เปิดผู้ช่วย AI" icon={Zap} onClick={() => navigate('/ai-writer')} description="ใช้ผู้ช่วย AI ในการเขียน"/>
          <QuickActionCard title="เปิด Pomodoro" icon={Clock} onClick={() => navigate('/tasks')} description="เริ่มจับเวลาทำงานและพักผ่อน"/>
          <QuickActionCard title="ตั้งค่าแอป" icon={Settings} onClick={() => navigate('/settings')} description="ปรับแต่งการทำงานของแอป"/>
        </div>
      </div>

      {totalTasksInContext > 0 && (
        <div className={`${currentTheme.cardBg} p-6 rounded-xl shadow-xl mb-8`}>
          <h3 className={`text-xl font-semibold ${currentTheme.text} mb-4`}>สรุปสถานะงาน</h3>
          <div className="space-y-2.5">
              <div className="flex justify-between items-center text-sm">
                  <span className={`${currentTheme.textSecondary}`}>งานที่เสร็จแล้ว:</span>
                  <span className={`font-semibold ${currentTheme.text}`}>{completedTasksInContext}</span>
              </div>
              <div className={`w-full ${currentTheme.inputBg} bg-opacity-50 rounded-full h-3 sm:h-3.5`}>
                   <div className={`${currentTheme.accent} h-3 sm:h-3.5 rounded-full transition-all duration-500 ease-out`} style={{ width: `${totalTasksInContext > 0 ? (completedTasksInContext / totalTasksInContext) * 100 : 0}%` }}></div>
              </div>
               <div className="flex justify-between items-center mt-1 text-sm">
                  <span className={`${currentTheme.textSecondary}`}>งานที่ยังไม่เสร็จ:</span>
                  <span className={`font-semibold ${currentTheme.text}`}>{incompleteTasksInContext}</span>
              </div>
          </div>
        </div>
      )}
      
      <div className={`${currentTheme.cardBg} p-6 rounded-xl shadow-xl text-center opacity-90`}>
        <Edit3 className={`w-10 h-10 ${currentTheme.accent.replace('bg-','text-')} mx-auto mb-4`} />
        <h3 className={`text-xl font-semibold ${currentTheme.text} mb-2`}>เริ่มสร้างสรรค์ผลงานของคุณ</h3>
        <p className={`${currentTheme.textSecondary} text-sm`}>
          ใช้เครื่องมือต่างๆ เพื่อจัดการไอเดีย, โครงเรื่อง, ตัวละคร และงานเขียนของคุณให้เป็นระบบ
          Inkweaver พร้อมเป็นผู้ช่วยให้จินตนาการของคุณเป็นจริง!
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
