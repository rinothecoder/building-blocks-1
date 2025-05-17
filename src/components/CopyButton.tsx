import React, { useState } from 'react';
import { Copy, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { copyTemplateToClipboard } from '../lib/templateTransformer';

interface CopyButtonProps {
  templateUrl: string;
  title: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ templateUrl, title }) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCopy = async () => {
    try {
      setLoading(true);
      await copyTemplateToClipboard(templateUrl, title);
      setCopied(true);
      toast.success('Template copied successfully!');
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