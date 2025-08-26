
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from '@/components/ui/toaster';
import { SecurityMonitor } from '@/components/security/SecurityMonitor';
import { PerformanceMonitor } from '@/components/common/PerformanceMonitor';
import { ErrorBoundaryWithRetry } from '@/components/common/ErrorBoundaryWithRetry';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { LoadingSkeletons } from '@/components/common/LoadingSkeletons';

// Lazy load components for better performance - fix for named exports
const EnhancedAppLayout = lazy(() => import('@/components/layout/EnhancedAppLayout').then(module => ({ default: module.EnhancedAppLayout })));
const HomeFeed = lazy(() => import('@/pages/HomeFeed'));
const Profile = lazy(() => import('@/pages/Profile'));
const Communities = lazy(() => import('@/pages/Communities'));
const EventCalendar = lazy(() => import('@/pages/EventCalendar').then(module => ({ default: module.EventCalendar })));
const Chat = lazy(() => import('@/pages/Chat').then(module => ({ default: module.Chat })));
const StudyGroups = lazy(() => import('@/pages/StudyGroups'));
const Explore = lazy(() => import('@/pages/Explore'));
const Settings = lazy(() => import('@/pages/Settings'));
const Testing = lazy(() => import('@/pages/Testing').then(module => ({ default: module.Testing })));
const Mentorship = lazy(() => import('@/pages/Mentorship'));
const Announcements = lazy(() => import('@/pages/Announcements').then(module => ({ default: module.Announcements })));
const Documentation = lazy(() => import('@/pages/Documentation'));
const DeploymentStatus = lazy(() => import('@/pages/admin/DeploymentStatus'));
const MonitoringDashboard = lazy(() => import('@/pages/admin/MonitoringDashboard'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { isOnline, isSlowConnection } = useNetworkStatus();

  return (
    <ErrorBoundaryWithRetry>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <SecurityMonitor />
            <PerformanceMonitor />
            
            {!isOnline && (
              <div className="bg-destructive text-destructive-foreground p-2 text-center text-sm">
                You're offline. Some features may not work properly.
              </div>
            )}
            {isSlowConnection && (
              <div className="bg-orange-500 text-white p-2 text-center text-sm">
                Slow connection detected. Content may load slowly.
              </div>
            )}

            <Suspense fallback={<LoadingSkeletons type="feed" count={1} />}>
              <EnhancedAppLayout />
            </Suspense>
            
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundaryWithRetry>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
