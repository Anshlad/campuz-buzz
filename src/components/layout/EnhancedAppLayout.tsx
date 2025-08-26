
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { EnhancedTopBar } from './EnhancedTopBar';
import { AppSidebar } from './AppSidebar';
import { EnhancedMobileBottomNav } from './EnhancedMobileBottomNav';
import { PerformanceMonitor } from '@/components/common/PerformanceMonitor';
import { PWAInstallBanner } from '@/components/common/PWAInstallBanner';
import { OfflineBanner } from '@/components/common/OfflineBanner';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';

// Import page components - optimized loading
import FastHomeFeed from '@/pages/FastHomeFeed';
import { Chat } from '@/pages/Chat';
import Communities from '@/pages/Communities';
import StudyGroups from '@/pages/StudyGroups';
import { EventCalendar } from '@/pages/EventCalendar';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import Explore from '@/pages/Explore';
import { Announcements } from '@/pages/Announcements';

export const EnhancedAppLayout: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <EnhancedTopBar />
          
          {/* Offline/Sync Status */}
          <OfflineBanner />
          
          <main className="flex-1 p-4 pb-20 md:pb-4">
            <div className="max-w-7xl mx-auto">
              <Routes>
                <Route path="/" element={<FastHomeFeed />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/communities" element={<Communities />} />
                <Route path="/study-groups" element={<StudyGroups />} />
                <Route path="/events" element={<EventCalendar />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/announcements" element={<Announcements />} />
              </Routes>
            </div>
          </main>
          
          {/* Mobile Navigation */}
          <div className="md:hidden">
            <EnhancedMobileBottomNav />
          </div>
        </SidebarInset>
      </div>
      
      {/* PWA Install Prompt */}
      <PWAInstallBanner />
      
      {/* Performance Monitor (dev/performance issues only) */}
      <PerformanceMonitor />
      
      <Toaster />
    </SidebarProvider>
  );
};
