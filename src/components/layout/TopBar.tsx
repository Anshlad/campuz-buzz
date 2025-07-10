
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bell, Menu, Search } from 'lucide-react';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

interface TopBarProps {
  onMenuClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    // Refresh current page while maintaining user session
    window.location.reload();
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Mobile menu button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <div className="hidden lg:flex items-center space-x-4">
          <button 
            onClick={handleLogoClick}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <img 
              src="/lovable-uploads/e51f26a6-a9d4-4b1f-a787-2f24bdc5c8bf.png" 
              alt="CampuzBuzz Logo" 
              className="h-8 w-8 object-contain"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              CampuzBuzz
            </span>
          </button>
        </div>

        {/* Search bar */}
        <div className="flex-1 max-w-md mx-4 lg:mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search posts, people, groups..." 
              className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600"
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="flex items-center space-x-4">
          <NotificationCenter />
        </div>
      </div>
    </header>
  );
};
