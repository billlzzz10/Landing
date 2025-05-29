import React from 'react';

// Define a type for Stat Card props if you plan to make it more dynamic
interface StatCardProps {
  iconClass: string;
  iconBgClass: string;
  hoverShadowClass?: string;
  title: string;
  value: string;
  unit?: string;
  valueDetails?: string;
  iconColorClass: string; // e.g. text-indigo-500 dark:text-indigo-300
}

const StatCard: React.FC<StatCardProps> = ({ iconClass, iconBgClass, hoverShadowClass, title, value, unit, valueDetails, iconColorClass }) => {
  return (
    <article 
        className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg flex items-center space-x-3 sm:space-x-4 smooth-transition group hover:-translate-y-1 ${hoverShadowClass || 'hover:shadow-indigo-500/30'}`}
        role="listitem" 
        tabIndex={0}
    >
      <div className={`p-3 ${iconBgClass} rounded-lg group-hover:brightness-110 dark:group-hover:brightness-125 smooth-transition`}>
        <i className={`${iconClass} ${iconColorClass} text-xl sm:text-2xl`} aria-hidden="true"></i>
      </div>
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">{title}</p>
        <p className="text-gray-800 dark:text-white font-semibold text-xl sm:text-2xl">
          {value}
          {unit && <span className="text-xs font-normal ml-1">{unit}</span>}
          {valueDetails && <span className="text-xs font-normal text-gray-400 dark:text-gray-500 ml-1">{valueDetails}</span>}
        </p>
      </div>
    </article>
  );
};


const DashboardPage: React.FC = () => {
    // Data for stats cards (can be fetched or managed via state later)
    const stats = [
        { id: 1, iconClass: 'fas fa-sticky-note', iconBgClass: 'bg-indigo-50 dark:bg-indigo-500/20 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/30', iconColorClass: 'text-indigo-500 dark:text-indigo-300', hoverShadowClass: 'hover:shadow-indigo-500/30', title: 'โน้ตทั้งหมด', value: '42' },
        { id: 2, iconClass: 'fas fa-tasks', iconBgClass: 'bg-teal-50 dark:bg-teal-500/20 group-hover:bg-teal-100 dark:group-hover:bg-teal-500/30', iconColorClass: 'text-teal-500 dark:text-teal-300', hoverShadowClass: 'hover:shadow-teal-500/30', title: 'งานที่ต้องทำ', value: '16', valueDetails: '/ 24' },
        { id: 3, iconClass: 'fas fa-clock', iconBgClass: 'bg-purple-50 dark:bg-purple-500/20 group-hover:bg-purple-100 dark:group-hover:bg-purple-500/30', iconColorClass: 'text-purple-500 dark:text-purple-300', hoverShadowClass: 'hover:shadow-purple-500/30', title: 'เวลาเขียน', value: '12.5', unit: 'ชม.' },
        { id: 4, iconClass: 'fas fa-robot', iconBgClass: 'bg-orange-50 dark:bg-orange-500/20 group-hover:bg-orange-100 dark:group-hover:bg-orange-500/30', iconColorClass: 'text-orange-500 dark:text-orange-300', hoverShadowClass: 'hover:shadow-orange-500/30', title: 'ใช้ AI', value: '8', unit: 'ครั้ง' },
    ];

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-6"> {/* Added padding to main content area */}
            <section
                id="dashboard"
                className="space-y-6"
                role="region"
                aria-label="แดชบอร์ด"
            >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h2
                            className="text-indigo-800 dark:text-indigo-200 text-2xl sm:text-3xl font-semibold leading-tight"
                        >
                            สวัสดี, นักเขียน!
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-2xl mt-1">
                            ภาพรวมโปรเจกต์และความคืบหน้าล่าสุดของคุณ
                        </p>
                    </div>
                    <div className="flex-shrink-0 flex space-x-2 mt-2 sm:mt-0">
                        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md smooth-transition text-sm font-medium flex items-center space-x-2">
                            <i className="fas fa-plus text-xs"></i>
                            <span>โน้ตใหม่</span>
                        </button>
                        {/* Add other CTAs if needed */}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" role="list">
                    {stats.map(stat => (
                        <StatCard
                            key={stat.id}
                            iconClass={stat.iconClass}
                            iconBgClass={stat.iconBgClass}
                            hoverShadowClass={stat.hoverShadowClass}
                            iconColorClass={stat.iconColorClass}
                            title={stat.title}
                            value={stat.value}
                            unit={stat.unit}
                            valueDetails={stat.valueDetails}
                        />
                    ))}
                </div>
            </section>
            {/* Future sections for recent notes, tasks, etc. can go here */}
        </div>
    );
};

export default DashboardPage;