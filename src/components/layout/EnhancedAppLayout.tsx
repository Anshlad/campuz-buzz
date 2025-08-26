
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { EnhancedTopBar } from './EnhancedTopBar';
import { MobileBottomNav } from './MobileBottomNav';

export const EnhancedAppLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full">
        <AppSidebar onToggle={handleSidebarToggle} />
        
        <div className="flex-1 flex flex-col min-w-0">
          <EnhancedTopBar 
            sidebarCollapsed={sidebarCollapsed}
            onSidebarToggle={handleSidebarToggle}
          />
          
          <main className="flex-1 overflow-auto pb-16 md:pb-0">
            <Outlet />
          </main>
          
          <MobileBottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
};
