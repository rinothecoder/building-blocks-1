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

  const handleCopy = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(code);
      if (!response.ok) {
        throw new Error('Failed to fetch template content');
      }

      let templateData;
      const contentType = response.headers.get('content-type');
      const responseText = await response.text(); // Get response as text first

      try {
        // Try to parse the response text as JSON
        templateData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse template content:', responseText);
        throw new Error('Invalid template format: Unable to parse JSON content');
      }
      
      if (!templateData || typeof templateData !== 'object') {
        throw new Error('Invalid template data structure');
      }

      // Format the template for Elementor
      const elementorTemplate = {
        title: title,
        type: "elementor",
        siteurl: window.location.origin + '/wp-json/',
        elements: templateData.content || templateData.elements || [],
        thumbnail: templateData.thumbnail_url || templateData.thumbnail
      };

      // Convert to string with proper formatting
      const templateString = JSON.stringify(elementorTemplate, null, 2);

      await navigator.clipboard.writeText(templateString);
      
      setCopied(true);
      toast.success('Template copied! You can now paste it into Elementor');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying template:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to copy template. Please try again.');
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