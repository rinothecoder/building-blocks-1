import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import TemplateGrid from './TemplateGrid';
import { Menu, X } from 'lucide-react';

const Layout: React.FC = () => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleTagSelect = (tag: string) => {
    if (tag === '') {
      // Clear all filters
      setSelectedTags([]);
    } else if (selectedTags.includes(tag)) {
      // Remove tag
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      // Add tag
      setSelectedTags([...selectedTags, tag]);
    }
    
    // Close mobile menu after selection on small screens
    if (window.innerWidth < 768) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex flex-col md:flex-row flex-1">
        {/* Mobile Sidebar Toggle */}
        <button
          className="md:hidden fixed bottom-4 right-4 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        
        {/* Mobile Sidebar */}
        <div 
          className={`fixed inset-0 z-10 bg-white transform transition-transform duration-300 ease-in-out md:hidden ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar selectedTags={selectedTags} onTagSelect={handleTagSelect} />
        </div>
        
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar selectedTags={selectedTags} onTagSelect={handleTagSelect} />
        </div>
        
        {/* Main Content */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto">
            <TemplateGrid selectedTags={selectedTags} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;