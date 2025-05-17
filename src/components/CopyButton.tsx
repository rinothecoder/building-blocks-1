import React, { useState } from 'react';
import { Copy, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface CopyButtonProps {
  code: string;
  title: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ code, title }) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateElementorTemplate = (template: any) => {
    // Check for required root properties
    if (!template.content || typeof template.content !== 'object') {
      throw new Error('Invalid template: missing or invalid content object');
    }

    // Ensure elements array exists and is valid
    if (!Array.isArray(template.content.elements)) {
      throw new Error('Invalid template: content.elements must be an array');
    }

    // Validate each element in the template
    const validateElement = (element: any) => {
      if (!element.elType || !element.id || !element.settings) {
        throw new Error('Invalid template: elements must have elType, id, and settings');
      }

      if (element.elType === 'widget' && !element.widgetType) {
        throw new Error('Invalid template: widgets must have widgetType');
      }

      if (Array.isArray(element.elements)) {
        element.elements.forEach(validateElement);
      }
    };

    template.content.elements.forEach(validateElement);
    return true;
  };

  const handleCopy = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(code);
      if (!response.ok) {
        throw new Error('Failed to fetch template content');
      }
      
      const templateData = await response.json();
      
      // Ensure the template follows Elementor's format
      const elementorTemplate = {
        version: "0.4",
        title: title,
        type: "elementor",
        content: {
          elements: Array.isArray(templateData.content?.elements) 
            ? templateData.content.elements 
            : [templateData],
          page_settings: templateData.content?.page_settings || {}
        }
      };

      // Validate the template structure
      validateElementorTemplate(elementorTemplate);

      // Remove any Skelementor-specific properties
      const cleanTemplate = JSON.stringify(elementorTemplate, (key, value) => {
        // Skip these properties
        if (['source', 'siteurl'].includes(key)) {
          return undefined;
        }
        return value;
      }, 2);

      await navigator.clipboard.writeText(cleanTemplate);
      
      setCopied(true);
      toast.success('Template copied! You can now paste it into Elementor');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying template:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to copy template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCopy}
      disabled={loading}
      className={`flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
        copied
          ? 'bg-green-100 text-green-600'
          : loading
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-gray-100 text-gray-700 hover:bg-blue-500 hover:text-white'
      }`}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          <span>Loading...</span>
        </>
      ) : copied ? (
        <>
          <Check className="h-4 w-4 mr-1" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-1" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
};

export default CopyButton;