
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Search, 
  Plus, 
  MessageSquare, 
  User,
  Calendar,
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const createMenuItems = [
    { icon: MessageSquare, label: 'New Post', path: '/' },
    { icon: Calendar, label: 'Create Event', path: '/events' },
    { icon: Users, label: 'Study Group', path: '/study-groups' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur-xl border-t border-border/40">
      <div className="flex items-center justify-around px-2 py-2">
        <NavLink
          to="/"
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
            isActive('/') ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </NavLink>

        <NavLink
          to="/explore"
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
            isActive('/explore') ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Search className="h-5 w-5" />
          <span className="text-xs mt-1">Explore</span>
        </NavLink>

        {/* Create Menu for Mobile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button
              className="flex flex-col items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <div className="bg-primary text-primary-foreground rounded-full p-1">
                <Plus className="h-4 w-4" />
              </div>
              <span className="text-xs mt-1">Create</span>
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" side="top" className="mb-2 bg-background/95 backdrop-blur-xl border-border/50">
            {createMenuItems.map((item) => (
              <DropdownMenuItem key={item.label} asChild>
                <NavLink to={item.path} className="cursor-pointer flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <NavLink
          to="/chat"
          className={`relative flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
            isActive('/chat') ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <MessageSquare className="h-5 w-5" />
          <span className="text-xs mt-1">Chat</span>
          <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-red-500 text-white text-xs rounded-full">
            3
          </Badge>
        </NavLink>

        <NavLink
          to="/profile"
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
            isActive('/profile') ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Profile</span>
        </NavLink>
      </div>
    </nav>
  );
};
