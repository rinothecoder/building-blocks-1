import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  code: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
        copied
          ? 'bg-green-100 text-green-600'
          : 'bg-gray-100 text-gray-700 hover:bg-blue-500 hover:text-white'
      }`}
    >
      {copied ? (
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