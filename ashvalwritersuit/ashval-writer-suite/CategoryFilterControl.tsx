import React from 'react';

interface CategoryFilterControlProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilterControl: React.FC<CategoryFilterControlProps> = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div className="my-4">
      <span className="mr-2 text-gray-700 dark:text-gray-300">Filter by category:</span>
      {categories.map(category => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`px-3 py-1 mr-2 mb-2 rounded text-sm ${activeCategory === category ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
        >
          {category === 'all' ? 'All' : category}
        </button>
      ))}
    </div>
  );
};
export default CategoryFilterControl;