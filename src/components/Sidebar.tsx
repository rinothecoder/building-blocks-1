import React from 'react';
import { getAllTags } from '../data/templates';
import { Tag } from 'lucide-react';

interface SidebarProps {
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedTags, onTagSelect }) => {
  const allTags = getAllTags();

  return (
    <aside className="w-full md:w-64 lg:w-72 bg-white md:border-r border-gray-200 md:h-[calc(100vh-64px)] overflow-y-auto md:sticky md:top-16 flex-shrink-0">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Filter Templates</h2>
        
        <div className="space-y-1">
          <div 
            className={`group flex items-center justify-between rounded-md px-3 py-2 cursor-pointer ${selectedTags.length === 0 ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
            onClick={() => onTagSelect('')}
          >
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-2.5" />
              <span className="text-sm font-medium">All Templates</span>
            </div>
            <span className="text-xs text-gray-500">{allTags.length}</span>
          </div>
          
          {allTags.map((tag) => (
            <div
              key={tag}
              className={`group flex items-center justify-between rounded-md px-3 py-2 cursor-pointer ${
                selectedTags.includes(tag) ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => onTagSelect(tag)}
            >
              <div className="flex items-center">
                <Tag className="h-4 w-4 mr-2.5" />
                <span className="text-sm font-medium capitalize">{tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;