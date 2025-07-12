
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useTheme } from '@/contexts/ThemeContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { StatusIndicator } from '@/components/ui/status-indicator';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { motion } from 'framer-motion';
import { 
  Home, 
  User, 
  Calendar, 
  MessageSquare, 
  Megaphone, 
  Search, 
  Users,
  LogOut,
  Moon,
  Sun,
  BookOpen,
  Zap,
  TrendingUp
} from 'lucide-react';

const getRoleBadge = (role: string) => {
  const roleConfig = {
    admin: { label: 'Admin', className: 'badge-admin' },
    professor: { label: 'Prof', className: 'badge-professor' },
    club: { label: 'Club', className: 'badge-mentor' },
    student: { label: 'Student', className: 'badge-student' }
  };
  
  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.student;
  return (
    <Badge className={`text-xs ${config.className}`}>
      {config.label}
    </Badge>
  );
};

export const AppSidebar = () => {
  const { signOut } = useAuth();
  const { profile } = useUserProfile();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const { state } = useSidebar();

  const navItems = [
    { icon: Home, label: 'Home', path: '/', color: 'text-blue-500' },
    { icon: TrendingUp, label: 'Trending', path: '/explore', color: 'text-orange-500' },
    { icon: Users, label: 'Communities', path: '/communities', color: 'text-green-500' },
    { icon: Calendar, label: 'Events', path: '/events', color: 'text-purple-500' },
    { icon: MessageSquare, label: 'Chat', path: '/chat', color: 'text-pink-500', badge: 3 },
    { icon: BookOpen, label: 'Study Groups', path: '/study-groups', color: 'text-indigo-500' },
    { icon: Megaphone, label: 'Announcements', path: '/announcements', color: 'text-red-500' },
  ];

  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border/50">
        <div className="flex items-center justify-between p-2">
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="relative">
              <img 
                src="/lovable-uploads/e51f26a6-a9d4-4b1f-a787-2f24bdc5c8bf.png" 
                alt="CampuzBuzz Logo" 
                className="h-8 w-8 object-contain"
              />
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-bold gradient-text bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                CampuzBuzz
              </span>
            )}
          </motion.div>
          <SidebarTrigger className="ml-auto" />
        </div>

        {/* User Profile Card */}
        {!isCollapsed && (
          <div className="p-2">
            <motion.div 
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors cursor-pointer"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative">
                <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {profile?.display_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <StatusIndicator 
                  status="online" 
                  className="absolute -bottom-1 -right-1" 
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="text-sm font-semibold text-sidebar-foreground truncate">
                    {profile?.display_name || 'User'}
                  </p>
                  {profile?.role && getRoleBadge(profile.role)}
                </div>
                <p className="text-xs text-sidebar-foreground/70 truncate">
                  {profile?.major} • {profile?.year}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  <Zap className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs text-sidebar-foreground/70">
                    {profile?.engagement_score || 0} pts
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {isCollapsed && (
          <div className="flex justify-center p-2">
            <Avatar className="h-8 w-8 ring-2 ring-primary/20">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs">
                {profile?.display_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton 
                      asChild
                      isActive={isActive}
                      tooltip={isCollapsed ? item.label : undefined}
                    >
                      <NavLink to={item.path}>
                        <item.icon className={`h-4 w-4 ${isActive ? '' : item.color}`} />
                        <span>{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto bg-red-500 text-white text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={toggleTheme}
              tooltip={isCollapsed ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={signOut}
              tooltip={isCollapsed ? 'Sign Out' : undefined}
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
