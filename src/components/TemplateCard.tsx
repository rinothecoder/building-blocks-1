import React, { useState } from 'react';
import { Template } from '../types';
import CopyButton from './CopyButton';
import PreviewPopup from './PreviewPopup';
import { Eye } from 'lucide-react';

interface TemplateCardProps {
  template: Template;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      <div 
        className="relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1" 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-video overflow-hidden group">
          <img 
            src={template.imageUrl} 
            alt={template.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>
          
          <div className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="flex items-center space-x-2">
              <CopyButton code={template.code} />
              <button 
                onClick={() => setShowPreview(true)}
                className="flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition-all duration-200"
              >
                <Eye className="h-4 w-4 mr-1" />
                <span>Preview</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="text-base font-medium text-gray-800 mb-2 truncate">{template.title}</h3>
          <div className="flex flex-wrap gap-2">
            {template.tags.map((tag) => (
              <span 
                key={tag} 
                className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-600 capitalize"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {showPreview && (
        <PreviewPopup
          imageUrl={template.imageUrl}
          title={template.title}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
};

export default TemplateCard;