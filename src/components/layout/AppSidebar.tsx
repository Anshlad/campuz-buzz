
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Users,
  Calendar,
  MessageSquare,
  BookOpen,
  Compass,
  Settings,
  UserCheck,
  Megaphone,
  FileText,
  Server,
  Activity
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

interface AppSidebarProps {
  onToggle?: () => void;
}

const navigationItems = [
  { title: 'Home Feed', url: '/', icon: Home },
  { title: 'Communities', url: '/communities', icon: Users },
  { title: 'Events', url: '/events', icon: Calendar },
  { title: 'Chat', url: '/chat', icon: MessageSquare },
  { title: 'Study Groups', url: '/study-groups', icon: BookOpen },
  { title: 'Explore', url: '/explore', icon: Compass },
];

const secondaryItems = [
  { title: 'Mentorship', url: '/mentorship', icon: UserCheck },
  { title: 'Announcements', url: '/announcements', icon: Megaphone },
  { title: 'Documentation', url: '/documentation', icon: FileText },
];

const adminItems = [
  { title: 'Deployment', url: '/admin/deployment', icon: Server },
  { title: 'Monitoring', url: '/admin/monitoring', icon: Activity },
];

export const AppSidebar: React.FC<AppSidebarProps> = ({ onToggle }) => {
  const { state, toggleSidebar } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  const handleNavigation = (url: string) => {
    navigate(url);
  };

  const handleToggle = () => {
    toggleSidebar();
    onToggle?.();
  };

  return (
    <Sidebar
      className={state === 'collapsed' ? 'w-14' : 'w-60'}
      collapsible="icon"
    >
      <SidebarContent className="py-4">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={state === 'collapsed' ? 'sr-only' : ''}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => handleNavigation(item.url)}
                    isActive={isActive(item.url)}
                    className="w-full justify-start"
                  >
                    <item.icon className="h-4 w-4" />
                    {state !== 'collapsed' && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Secondary Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={state === 'collapsed' ? 'sr-only' : ''}>
            More
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => handleNavigation(item.url)}
                    isActive={isActive(item.url)}
                    className="w-full justify-start"
                  >
                    <item.icon className="h-4 w-4" />
                    {state !== 'collapsed' && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNavigation('/settings')}
                  isActive={isActive('/settings')}
                  className="w-full justify-start"
                >
                  <Settings className="h-4 w-4" />
                  {state !== 'collapsed' && <span>Settings</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section (conditional) */}
        <SidebarGroup>
          <SidebarGroupLabel className={state === 'collapsed' ? 'sr-only' : ''}>
            Admin
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => handleNavigation(item.url)}
                    isActive={isActive(item.url)}
                    className="w-full justify-start"
                  >
                    <item.icon className="h-4 w-4" />
                    {state !== 'collapsed' && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
