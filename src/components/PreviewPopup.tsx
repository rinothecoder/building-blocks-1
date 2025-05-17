import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface PreviewPopupProps {
  imageUrl: string;
  title: string;
  onClose: () => void;
}

const PreviewPopup: React.FC<PreviewPopupProps> = ({ imageUrl, title, onClose }) => {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div ref={popupRef} className="relative max-w-4xl w-full mx-4 bg-white rounded-lg shadow-xl animate-slideUpAndFade">
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>
        
        <div className="p-4">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-auto rounded-md"
          />
        </div>
      </div>
    </div>
  );
};

export default PreviewPopup;