
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  MessageSquare, 
  Bell,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  PenTool,
  Calendar,
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { motion } from 'framer-motion';

export const EnhancedTopBar: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const createMenuItems = [
    { icon: PenTool, label: 'New Post', action: () => navigate('/') },
    { icon: Calendar, label: 'Create Event', action: () => navigate('/events') },
    { icon: Users, label: 'Study Group', action: () => navigate('/study-groups') },
    { icon: MessageSquare, label: 'Community', action: () => navigate('/communities') }
  ];

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/85"
    >
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <SidebarTrigger className="md:hidden" />
          
          {/* Logo - Desktop */}
          <motion.button 
            onClick={handleLogoClick}
            className="hidden lg:flex items-center space-x-3 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              <img 
                src="/lovable-uploads/e51f26a6-a9d4-4b1f-a787-2f24bdc5c8bf.png" 
                alt="CampuzBuzz Logo" 
                className="h-8 w-8 object-contain transition-transform group-hover:rotate-12"
              />
              <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse">
              CampuzBuzz
            </span>
          </motion.button>
        </div>

        {/* Center - Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4 lg:mx-8">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts, people, communities..." 
              className="pl-10 bg-muted/30 border-border/50 focus:bg-background focus:border-primary/50 transition-all duration-300 rounded-full shadow-sm hover:shadow-md focus:shadow-lg"
            />
          </div>
        </form>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Quick Actions - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Create Dropdown */}
            <DropdownMenu open={showCreateMenu} onOpenChange={setShowCreateMenu}>
              <DropdownMenuTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <EnhancedButton 
                    variant="ghost" 
                    size="icon"
                    className="relative hover:bg-accent/50"
                  >
                    <Plus className="h-5 w-5" />
                  </EnhancedButton>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-xl border-border/50">
                {createMenuItems.map((item) => (
                  <DropdownMenuItem 
                    key={item.label}
                    onClick={item.action} 
                    className="cursor-pointer flex items-center gap-2"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <EnhancedButton 
                variant="ghost" 
                size="icon"
                className="relative hover:bg-accent/50"
                onClick={() => navigate('/chat')}
              >
                <MessageSquare className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs rounded-full animate-pulse">
                  3
                </Badge>
              </EnhancedButton>
            </motion.div>
          </div>

          {/* Notifications */}
          <NotificationCenter />

          {/* Theme Toggle */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <EnhancedButton
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hover:bg-accent/50"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </EnhancedButton>
          </motion.div>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                className="flex items-center space-x-2 hover:bg-accent/50 rounded-lg p-2 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Avatar className="h-8 w-8 ring-2 ring-primary/20 transition-all hover:ring-primary/40">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-semibold">
                    {profile?.display_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-sm font-medium text-foreground">
                  {profile?.display_name?.split(' ')[0] || 'User'}
                </span>
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-xl border-border/50">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{profile?.display_name}</p>
                <p className="text-xs text-muted-foreground">{profile?.major} • {profile?.year}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="cursor-pointer text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
};
