
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppTheme } from './NoteTaskApp';
import { Project } from './types';
import { FolderKanban, ChevronRight, Package, Edit3 } from 'lucide-react';

interface HomePageProps {
  currentTheme: AppTheme;
  onCreateProject: (projectName: string) => string;
  onOpenAddNoteModal: () => void; // Retained if needed for other quick actions
  projects: Project[];
  activeProjectId: string | null; // To highlight active project if any
  setActiveProjectId: (projectId: string | null) => void;
}

// Placeholder images - replace with actual logic or remove if not desired
const placeholderImages = [
  'https://source.unsplash.com/random/400x225?sig=1&fantasy,dark,abstract',
  'https://source.unsplash.com/random/400x225?sig=2&mystery,ancient,scroll',
  'https://source.unsplash.com/random/400x225?sig=3&adventure,landscape,epic',
  'https://source.unsplash.com/random/400x225?sig=4&magic,forest,night',
  'https://source.unsplash.com/random/400x225?sig=5&dragon,castle,myth',
];

const getProjectImage = (index: number) => {
  return placeholderImages[index % placeholderImages.length];
};


const HomePage: React.FC<HomePageProps> = ({
  currentTheme,
  onCreateProject,
  projects,
  activeProjectId,
  setActiveProjectId,
}) => {
  const navigate = useNavigate();

  const handleProjectClick = (projectId: string) => {
    setActiveProjectId(projectId);
    navigate('/dashboard'); // Navigate to dashboard for the selected project
  };

  const sortedProjects = [...projects].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt).getTime();
    const dateB = new Date(b.updatedAt || b.createdAt).getTime();
    return dateB - dateA;
  });

  return (
    <div className={`py-6 sm:py-8 ${currentTheme.contentBg} px-4 min-h-full`}>
      <div className="mb-8">
        <h1 className={`text-3xl sm:text-4xl font-bold ${currentTheme.text} flex items-center`}>
          <FolderKanban className={`w-9 h-9 mr-3 ${currentTheme.accent.replace('bg-', 'text-')}`} />
          โครงการของฉัน
        </h1>
      </div>

      {projects.length === 0 && (
        <div className={`mt-10 text-center ${currentTheme.cardBg} p-8 sm:p-12 rounded-2xl shadow-xl max-w-lg mx-auto`}>
          <Edit3 className={`w-16 h-16 mx-auto mb-6 ${currentTheme.accent.replace('bg-', 'text-')}`} />
          <h2 className={`text-2xl font-semibold mb-4 ${currentTheme.text}`}>เริ่มสร้างผลงานชิ้นเอกของคุณ</h2>
          <p className={`${currentTheme.textSecondary} text-sm mb-6`}>
            คุณยังไม่ได้สร้างโปรเจกต์ใดๆ คลิกปุ่ม "สร้างโปรเจกต์ใหม่" ที่แถบด้านบนเพื่อเริ่มต้นการเดินทางในฐานะนักเขียนกับ Inkweaver
          </p>
          <button
            onClick={() => {
              const newProjectName = prompt("กรุณาใส่ชื่อโปรเจกต์ใหม่:");
              if (newProjectName && newProjectName.trim() !== "") {
                const newId = onCreateProject(newProjectName.trim());
                handleProjectClick(newId);
              }
            }}
            className={`${currentTheme.button} ${currentTheme.buttonText} px-6 py-3 rounded-lg font-semibold transition-transform hover:scale-105 shadow-lg text-md`}
          >
            สร้างโปรเจกต์แรกของคุณ
          </button>
        </div>
      )}

      {projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedProjects.map((project, index) => (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project.id)}
              className={`rounded-xl overflow-hidden shadow-lg transition-all duration-300 ease-in-out transform hover:scale-[1.03] hover:shadow-2xl cursor-pointer ${currentTheme.cardBg} flex flex-col`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleProjectClick(project.id)}
            >
              <div className="relative w-full h-48 sm:h-52">
                <img 
                    src={getProjectImage(index)} 
                    alt={`ภาพตัวอย่างของโปรเจกต์ ${project.name}`} 
                    className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <p className={`text-xs ${currentTheme.textSecondary} opacity-80 mb-1`}>
                  แก้ไขล่าสุด: {new Date(project.updatedAt || project.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
                <h3 className={`text-lg font-semibold ${currentTheme.text} mb-1.5 truncate`}>{project.name}</h3>
                <p className={`${currentTheme.textSecondary} text-sm line-clamp-2 flex-grow mb-3`}>
                  {project.description || 'ไม่มีคำอธิบาย'}
                </p>
                <div className="mt-auto flex justify-end">
                  <button 
                    className={`text-xs font-medium ${currentTheme.accent.replace('bg-','text-')} hover:underline flex items-center`}
                    onClick={(e) => { e.stopPropagation(); handleProjectClick(project.id);}} // Prevent card click if button handles navigation
                  >
                    เปิดโปรเจกต์ <ChevronRight size={14} className="ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;