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
    // If it's already a valid Elementor template, return as is
    if (
      template.version === "0.4" && 
      template.type === "elementor" && 
      Array.isArray(template.elements)
    ) {
      return template;
    }

    // Extract elements from the template
    const elements = template.content?.elements || template.elements || [];

    // Ensure each element has required properties
    const processElement = (element: any): any => {
      if (!element) return null;

      // Ensure required properties exist
      const processed = {
        id: element.id || Math.random().toString(36).substr(2, 9),
        elType: element.elType || 'section',
        settings: element.settings || {},
        elements: Array.isArray(element.elements) 
          ? element.elements.map(processElement).filter(Boolean)
          : []
      };

      // Add widgetType for widget elements
      if (processed.elType === 'widget') {
        processed.widgetType = element.widgetType || 'text-editor';
      }

      return processed;
    };

    // Process all elements recursively
    const processedElements = elements.map(processElement).filter(Boolean);

    // Return properly formatted Elementor template
    return {
      version: "0.4",
      title: title || "Imported Template",
      type: "elementor",
      elements: processedElements
    };
  };

  const handleCopy = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(code);
      if (!response.ok) {
        throw new Error('Failed to fetch template content');
      }
      
      const templateData = await response.json();
      
      // Validate and format the template
      const elementorTemplate = validateElementorTemplate(templateData);

      // Convert to string with proper formatting
      const templateString = JSON.stringify(elementorTemplate, null, 2);

      await navigator.clipboard.writeText(templateString);
      
      setCopied(true);
      toast.success('Template copied! You can now paste it into Elementor');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying template:', error);
      toast.error('Failed to copy template. Please try again.');
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