import React, { useEffect, useRef, useState } from 'react';
import { Template } from '../types';
import TemplateCard from './TemplateCard';
import { useLayout } from '../context/LayoutContext';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

interface TemplateGridProps {
  selectedTags: string[];
}

const ITEMS_PER_PAGE = 12;

const TemplateGrid: React.FC<TemplateGridProps> = ({ selectedTags }) => {
  const { gridColumns } = useLayout();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const loadingRef = useRef<HTMLDivElement>(null);

  const gridColsClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }[gridColumns];

  const fetchTemplates = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('templates')
        .select(`
          id,
          name,
          thumbnail_url,
          template_url,
          template_tags!inner (
            tags (
              name
            )
          )
        `)
        .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1)
        .order('created_at', { ascending: false });

      // Filter by selected tags
      if (selectedTags.length > 0) {
        const tagFilter = selectedTags.map(tag => `template_tags.tags.name.eq.${tag}`).join(',');
        query = query.or(tagFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching templates:', error);
        return;
      }

      const formattedTemplates = data.map(template => ({
        id: template.id,
        title: template.name,
        imageUrl: template.thumbnail_url,
        templateUrl: template.template_url,
        tags: template.template_tags
          ?.filter(tt => tt?.tags)
          ?.map((tt: any) => tt.tags?.name)
          ?.filter(Boolean) || []
      }));

      if (page === 0) {
        setTemplates(formattedTemplates);
      } else {
        setTemplates(prev => [...prev, ...formattedTemplates]);
      }
      
      setHasMore(data.length === ITEMS_PER_PAGE);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset when tags change
    setTemplates([]);
    setPage(0);
    setHasMore(true);
  }, [selectedTags]);

  useEffect(() => {
    if (page === 0) {
      fetchTemplates();
    }
  }, [page, selectedTags]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          fetchTemplates();
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [loading, hasMore]);

  return (
    <div className="w-full p-4 md:p-6">
      {templates.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-gray-500 text-lg">No templates found matching your criteria.</p>
          <p className="text-gray-400 text-sm mt-2">Try selecting different tags or clearing your filter.</p>
        </div>
      ) : (
        <>
          <div className={`grid ${gridColsClass} gap-6`}>
            {templates.map((template) => (
              <TemplateCard 
                key={template.id} 
                template={template} 
                onTagClick={(tag) => {
                  if (!selectedTags.includes(tag)) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                selectedTags={selectedTags}
              />
            ))}
          </div>
          
          <div 
            ref={loadingRef} 
            className="flex justify-center py-8"
          >
            {loading && (
              <div className="flex items-center space-x-2 text-gray-500">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading more templates...</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TemplateGrid;