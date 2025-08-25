
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { EnhancedErrorBoundary } from '@/components/common/EnhancedErrorBoundary';
import { SecurityMonitor } from '@/components/security/SecurityMonitor';
import { Toaster } from '@/components/ui/toaster';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useAdvancedErrorBoundary } from '@/hooks/useAdvancedErrorBoundary';
import { withLazyLoading, useMemoryTracker } from '@/components/common/PerformanceOptimizer';

// Lazy load components for better performance - fixed imports
const EnhancedAppLayout = withLazyLoading(() => import('@/components/layout/EnhancedAppLayout').then(module => ({ default: module.EnhancedAppLayout })));
const HomeFeed = withLazyLoading(() => import('@/pages/HomeFeed'));
const Profile = withLazyLoading(() => import('@/pages/Profile'));
const Communities = withLazyLoading(() => import('@/pages/Communities'));
const EventCalendar = withLazyLoading(() => import('@/pages/EventCalendar').then(module => ({ default: module.EventCalendar })));
const Chat = withLazyLoading(() => import('@/pages/Chat').then(module => ({ default: module.Chat })));
const StudyGroups = withLazyLoading(() => import('@/pages/StudyGroups'));
const Explore = withLazyLoading(() => import('@/pages/Explore'));
const Settings = withLazyLoading(() => import('@/pages/Settings'));
const Testing = withLazyLoading(() => import('@/pages/Testing').then(module => ({ default: module.Testing })));
const Mentorship = withLazyLoading(() => import('@/pages/Mentorship'));
const Announcements = withLazyLoading(() => import('@/pages/Announcements').then(module => ({ default: module.Announcements })));
const Documentation = withLazyLoading(() => import('@/pages/Documentation'));
const DeploymentStatus = withLazyLoading(() => import('@/pages/admin/DeploymentStatus'));
const MonitoringDashboard = withLazyLoading(() => import('@/pages/admin/MonitoringDashboard'));
const NotFound = withLazyLoading(() => import('@/pages/NotFound'));

// Enhanced query client with better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const AppContent: React.FC = () => {
  const { isOnline, isSlowConnection } = useNetworkStatus();
  const { logError } = useAdvancedErrorBoundary();
  useMemoryTracker();

  React.useEffect(() => {
    // Log app startup
    console.log('CampuzBuzz initialized');
    
    // Performance observer for monitoring - fixed type issues
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime);
          }
          if (entry.entryType === 'first-input') {
            const fidEntry = entry as PerformanceEventTiming;
            console.log('FID:', fidEntry.processingStart - fidEntry.startTime);
          }
        }
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
    }
  }, []);

  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <SecurityMonitor />
          <AuthGuard>
            {!isOnline && (
              <div className="bg-destructive text-destructive-foreground p-2 text-center text-sm">
                You're offline. Some features may not work properly.
              </div>
            )}
            {isSlowConnection && (
              <div className="bg-warning text-warning-foreground p-2 text-center text-sm">
                Slow connection detected. Content may load slowly.
              </div>
            )}
            <EnhancedAppLayout />
          </AuthGuard>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
};

function App() {
  return (
    <EnhancedErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppContent />
        <Toaster />
      </QueryClientProvider>
    </EnhancedErrorBoundary>
  );
}

export default App;
