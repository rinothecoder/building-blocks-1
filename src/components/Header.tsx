import React from 'react';
import { Layout, Search, LayoutGrid, Columns2, Columns3, Grid as Grid4X4, Shield, LogOut, Bug } from 'lucide-react';
import { useLayout } from '../context/LayoutContext';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const Header: React.FC = () => {
  const { gridColumns, setGridColumns } = useLayout();
  const { user } = useAuth();
  const navigate = useNavigate();

  const getLayoutIcon = (cols: number) => {
    switch (cols) {
      case 2:
        return <Columns2 className="h-4 w-4" />;
      case 3:
        return <Columns3 className="h-4 w-4" />;
      case 4:
        return <Grid4X4 className="h-4 w-4" />;
      default:
        return <LayoutGrid className="h-4 w-4" />;
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 md:px-8">
        <div className="flex items-center">
          <Layout className="h-6 w-6 text-blue-600 mr-2" />
          <span className="text-xl font-semibold text-gray-800">Building Blocks for Elementor</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              className="ml-2 w-40 border-none outline-none text-sm md:w-60"
            />
          </div>

          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            {[2, 3, 4].map((cols) => (
              <button
                key={cols}
                onClick={() => setGridColumns(cols as 2 | 3 | 4)}
                className={`flex items-center justify-center p-1.5 rounded ${
                  gridColumns === cols
                    ? 'bg-white shadow text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title={`${cols} columns`}
              >
                {getLayoutIcon(cols)}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to="/logs"
              className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Bug className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Logs</span>
            </Link>

            {user ? (
              <>
                <Link
                  to="/admin"
                  className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Shield className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Admin</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Shield className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;