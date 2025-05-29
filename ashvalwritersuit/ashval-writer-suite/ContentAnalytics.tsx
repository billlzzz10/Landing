import React from 'react';
import { AppNote } from './types'; // And other types for analytics

interface ContentAnalyticsProps {
  notes: AppNote[];
  // activeProjectId: string | null;
}

const ContentAnalytics: React.FC<ContentAnalyticsProps> = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Content Analytics</h2>
      <p className="text-gray-600 dark:text-gray-300">Charts and stats about content (word counts, readability, etc.) will be here.</p>
    </div>
  );
};
export default ContentAnalytics;