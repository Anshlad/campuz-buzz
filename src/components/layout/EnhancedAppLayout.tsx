
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { EnhancedTopBar } from './EnhancedTopBar';
import { AppSidebar } from './AppSidebar';
import { EnhancedMobileBottomNav } from './EnhancedMobileBottomNav';
import { PerformanceMonitor } from '@/components/common/PerformanceMonitor';
import { PWAInstallBanner } from '@/components/common/PWAInstallBanner';
import { OfflineBanner } from '@/components/common/OfflineBanner';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';

export const EnhancedAppLayout: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Outlet />;
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
              <Outlet />
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
