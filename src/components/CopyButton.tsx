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

  const extractJSON = (text: string): string => {
    // Find the first '{' and last '}'
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    
    if (start === -1 || end === -1 || end <= start) {
      throw new Error('No valid JSON object found in response');
    }
    
    return text.slice(start, end + 1);
  };

  const handleCopy = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(code);
      if (!response.ok) {
        throw new Error('Failed to fetch template content');
      }

      const responseText = await response.text();
      let jsonText: string;
      
      try {
        // First try to extract JSON from the response
        jsonText = extractJSON(responseText);
        
        // Validate that it's parseable JSON
        JSON.parse(jsonText);
      } catch (parseError) {
        console.error('Response text:', responseText);
        console.error('Parse error:', parseError);
        throw new Error('Invalid template format: Unable to extract valid JSON content');
      }

      const templateData = JSON.parse(jsonText);
      
      if (!templateData || typeof templateData !== 'object') {
        throw new Error('Invalid template data structure');
      }

      // Ensure required properties exist and are of correct type
      const elements = Array.isArray(templateData.content) ? templateData.content :
                      Array.isArray(templateData.elements) ? templateData.elements : [];
      
      const thumbnail = typeof templateData.thumbnail_url === 'string' ? templateData.thumbnail_url :
                       typeof templateData.thumbnail === 'string' ? templateData.thumbnail : '';

      // Construct proper site URL with protocol
      const siteUrl = new URL('/wp-json/', window.location.href).toString();

      // Format the template for Elementor
      const elementorTemplate = {
        title: String(title || ''),
        type: "elementor",
        siteurl: siteUrl,
        elements: elements,
        thumbnail: thumbnail
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