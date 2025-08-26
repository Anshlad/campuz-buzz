
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

// Lazy load components for better performance
const EnhancedAppLayout = lazy(() => import('@/components/layout/EnhancedAppLayout'));
const HomeFeed = lazy(() => import('@/pages/HomeFeed'));
const Profile = lazy(() => import('@/pages/Profile'));
const Communities = lazy(() => import('@/pages/Communities'));
const EventCalendar = lazy(() => import('@/pages/EventCalendar'));
const Chat = lazy(() => import('@/pages/Chat'));
const StudyGroups = lazy(() => import('@/pages/StudyGroups'));
const Explore = lazy(() => import('@/pages/Explore'));
const Settings = lazy(() => import('@/pages/Settings'));
const Testing = lazy(() => import('@/pages/Testing'));
const Mentorship = lazy(() => import('@/pages/Mentorship'));
const Announcements = lazy(() => import('@/pages/Announcements'));
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
              <EnhancedAppLayout>
                <Routes>
                  <Route path="/" element={
                    <Suspense fallback={<LoadingSkeletons type="feed" count={3} />}>
                      <HomeFeed />
                    </Suspense>
                  } />
                  <Route path="/profile" element={
                    <Suspense fallback={<LoadingSkeletons type="profile" count={1} />}>
                      <Profile />
                    </Suspense>
                  } />
                  <Route path="/communities" element={
                    <Suspense fallback={<LoadingSkeletons type="communities" count={6} />}>
                      <Communities />
                    </Suspense>
                  } />
                  <Route path="/events" element={
                    <Suspense fallback={<LoadingSkeletons type="feed" count={4} />}>
                      <EventCalendar />
                    </Suspense>
                  } />
                  <Route path="/chat" element={
                    <Suspense fallback={<LoadingSkeletons type="chat" count={1} />}>
                      <Chat />
                    </Suspense>
                  } />
                  <Route path="/study-groups" element={
                    <Suspense fallback={<LoadingSkeletons type="communities" count={4} />}>
                      <StudyGroups />
                    </Suspense>
                  } />
                  <Route path="/explore" element={
                    <Suspense fallback={<LoadingSkeletons type="feed" count={6} />}>
                      <Explore />
                    </Suspense>
                  } />
                  <Route path="/settings" element={
                    <Suspense fallback={<LoadingSkeletons type="profile" count={1} />}>
                      <Settings />
                    </Suspense>
                  } />
                  <Route path="/testing" element={
                    <Suspense fallback={<LoadingSkeletons type="feed" count={3} />}>
                      <Testing />
                    </Suspense>
                  } />
                  <Route path="/mentorship" element={
                    <Suspense fallback={<LoadingSkeletons type="communities" count={4} />}>
                      <Mentorship />
                    </Suspense>
                  } />
                  <Route path="/announcements" element={
                    <Suspense fallback={<LoadingSkeletons type="feed" count={5} />}>
                      <Announcements />
                    </Suspense>
                  } />
                  <Route path="/documentation" element={
                    <Suspense fallback={<LoadingSkeletons type="feed" count={1} />}>
                      <Documentation />
                    </Suspense>
                  } />
                  <Route path="/admin/deployment" element={
                    <Suspense fallback={<LoadingSkeletons type="feed" count={1} />}>
                      <DeploymentStatus />
                    </Suspense>
                  } />
                  <Route path="/admin/monitoring" element={
                    <Suspense fallback={<LoadingSkeletons type="feed" count={1} />}>
                      <MonitoringDashboard />
                    </Suspense>
                  } />
                  <Route path="/404" element={
                    <Suspense fallback={<div>Loading...</div>}>
                      <NotFound />
                    </Suspense>
                  } />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </EnhancedAppLayout>
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
