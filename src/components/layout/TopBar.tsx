
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Menu, Search, Plus, MessageSquare } from 'lucide-react';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

interface TopBarProps {
  onMenuClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogoClick = () => {
    window.location.reload();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-background/95 backdrop-blur-md border-b border-border px-4 lg:px-6 py-3 sticky top-0 z-30"
    >
      <div className="flex items-center justify-between">
        {/* Mobile menu button */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="lg:hidden hover:bg-accent"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo - Desktop */}
          <motion.button 
            onClick={handleLogoClick}
            className="hidden lg:flex items-center space-x-3 hover:opacity-80 transition-opacity"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img 
              src="/lovable-uploads/e51f26a6-a9d4-4b1f-a787-2f24bdc5c8bf.png" 
              alt="CampuzBuzz Logo" 
              className="h-8 w-8 object-contain"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CampuzBuzz
            </span>
          </motion.button>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4 lg:mx-8">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts, people, groups..." 
              className="pl-10 bg-muted/50 border-border/50 focus:bg-background focus:border-primary transition-all duration-200 rounded-full"
            />
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Quick Actions - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:bg-accent relative"
                onClick={() => navigate('/create')}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:bg-accent relative"
                onClick={() => navigate('/chat')}
              >
                <MessageSquare className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </Button>
            </motion.div>
          </div>

          {/* Notifications */}
          <NotificationCenter />

          {/* Profile */}
          <motion.button
            onClick={() => navigate('/profile')}
            className="flex items-center space-x-2 hover:bg-accent rounded-lg p-2 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Avatar className="h-8 w-8 ring-2 ring-primary/20">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                {user?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:block text-sm font-medium text-foreground">
              {user?.name?.split(' ')[0]}
            </span>
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};
