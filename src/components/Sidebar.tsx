import React, { useState, useEffect } from 'react';
import { Tag, Loader2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SidebarProps {
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
}

interface TagWithCount {
  name: string;
  count: number;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedTags, onTagSelect }) => {
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalTemplates, setTotalTemplates] = useState(0);

  useEffect(() => {
    loadTagsWithCounts();
  }, []);

  const loadTagsWithCounts = async () => {
    try {
      setLoading(true);

      // Get total templates count
      const { count: templatesCount, error: countError } = await supabase
        .from('templates')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;
      setTotalTemplates(templatesCount || 0);

      // Get tags with their template counts using a more accurate count
      const { data, error } = await supabase
        .from('tags')
        .select(`
          name,
          template_tags!inner (
            template_id
          )
        `);

      if (error) throw error;

      // Process the data to count unique templates per tag
      const tagsWithCounts = data.map(tag => ({
        name: tag.name,
        // Count unique template IDs for this tag
        count: new Set(tag.template_tags.map((tt: any) => tt.template_id)).size
      })).sort((a, b) => b.count - a.count);

      setTags(tagsWithCounts);
    } catch (error) {
      console.error('Error loading tags:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <aside className="w-full md:w-64 lg:w-72 bg-white md:border-r border-gray-200 md:h-[calc(100vh-64px)] overflow-y-auto md:sticky md:top-16 flex-shrink-0">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Filter Templates</h2>
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-full md:w-64 lg:w-72 bg-white md:border-r border-gray-200 md:h-[calc(100vh-64px)] overflow-y-auto md:sticky md:top-16 flex-shrink-0">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Filter Templates</h2>
          {selectedTags.length > 0 && (
            <button
              onClick={() => onTagSelect('')}
              className="flex items-center px-2 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X className="h-4 w-4 mr-1" />
              Clear filters
            </button>
          )}
        </div>
        
        <div className="space-y-1">
          <div 
            className={`group flex items-center justify-between rounded-md px-3 py-2 cursor-pointer ${selectedTags.length === 0 ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
            onClick={() => onTagSelect('')}
          >
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-2.5" />
              <span className="text-sm font-medium">All Templates</span>
            </div>
            <span className="text-xs text-gray-500">{totalTemplates}</span>
          </div>
          
          {tags.map((tag) => (
            <div
              key={tag.name}
              className={`group flex items-center justify-between rounded-md px-3 py-2 cursor-pointer ${
                selectedTags.includes(tag.name) ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => onTagSelect(tag.name)}
            >
              <div className="flex items-center">
                <Tag className="h-4 w-4 mr-2.5" />
                <span className="text-sm font-medium capitalize">{tag.name}</span>
              </div>
              <span className="text-xs text-gray-500">{tag.count}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;