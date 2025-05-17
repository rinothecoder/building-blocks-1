import React from 'react';
import { Template } from '../types';
import TemplateCard from './TemplateCard';
import { useLayout } from '../context/LayoutContext';

interface TemplateGridProps {
  templates: Template[];
}

const TemplateGrid: React.FC<TemplateGridProps> = ({ templates }) => {
  const { gridColumns } = useLayout();

  const gridColsClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }[gridColumns];

  return (
    <div className="w-full p-4 md:p-6">
      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-gray-500 text-lg">No templates found matching your criteria.</p>
          <p className="text-gray-400 text-sm mt-2">Try selecting different tags or clearing your filter.</p>
        </div>
      ) : (
        <div className={`grid ${gridColsClass} gap-6`}>
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplateGrid