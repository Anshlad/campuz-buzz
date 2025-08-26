import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from '@/components/ui/toaster';
import { LoadingSkeletons } from '@/components/ui/loading-skeletons';
import { AuthGuard } from '@/components/auth/AuthGuard';

// Lazy load components with proper named export handling
const EnhancedAppLayout = React.lazy(() => 
  import('@/components/layout/EnhancedAppLayout').then(module => ({ default: module.EnhancedAppLayout }))
);
const EventCalendar = React.lazy(() => 
  import('@/pages/EventCalendar').then(module => ({ default: module.EventCalendar }))
);
const Testing = React.lazy(() => 
  import('@/pages/Testing').then(module => ({ default: module.default }))
);

// Other imports
import HomeFeed from '@/pages/HomeFeed';
import Profile from '@/pages/Profile';
import Communities from '@/pages/Communities';
import StudyGroups from '@/pages/StudyGroups';
import { Chat } from '@/pages/Chat';
import Explore from '@/pages/Explore';
import { Announcements } from '@/pages/Announcements';
import NotFound from '@/pages/NotFound';

// Lazy load additional components
const Settings = React.lazy(() => import('@/pages/Settings'));
const Mentorship = React.lazy(() => import('@/pages/Mentorship'));
const Documentation = React.lazy(() => import('@/pages/Documentation'));
const DeploymentStatus = React.lazy(() => import('@/pages/DeploymentStatus'));
const MonitoringDashboard = React.lazy(() => import('@/pages/MonitoringDashboard'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AuthGuard>
              <Suspense fallback={<LoadingSkeletons type="feed" count={1} />}>
                <Routes>
                  <Route path="/" element={<EnhancedAppLayout />}>
                    <Route index element={
                      <Suspense fallback={<LoadingSkeletons type="feed" count={3} />}>
                        <HomeFeed />
                      </Suspense>
                    } />
                    <Route path="profile" element={
                      <Suspense fallback={<LoadingSkeletons type="profile" count={1} />}>
                        <Profile />
                      </Suspense>
                    } />
                    <Route path="communities" element={
                      <Suspense fallback={<LoadingSkeletons type="communities" count={6} />}>
                        <Communities />
                      </Suspense>
                    } />
                    <Route path="events" element={
                      <Suspense fallback={<LoadingSkeletons type="feed" count={4} />}>
                        <EventCalendar />
                      </Suspense>
                    } />
                    <Route path="chat" element={
                      <Suspense fallback={<LoadingSkeletons type="chat" count={1} />}>
                        <Chat />
                      </Suspense>
                    } />
                    <Route path="study-groups" element={
                      <Suspense fallback={<LoadingSkeletons type="communities" count={4} />}>
                        <StudyGroups />
                      </Suspense>
                    } />
                    <Route path="explore" element={
                      <Suspense fallback={<LoadingSkeletons type="feed" count={6} />}>
                        <Explore />
                      </Suspense>
                    } />
                    <Route path="settings" element={
                      <Suspense fallback={<LoadingSkeletons type="profile" count={1} />}>
                        <Settings />
                      </Suspense>
                    } />
                    <Route path="testing" element={
                      <Suspense fallback={<LoadingSkeletons type="feed" count={3} />}>
                        <Testing />
                      </Suspense>
                    } />
                    <Route path="mentorship" element={
                      <Suspense fallback={<LoadingSkeletons type="communities" count={4} />}>
                        <Mentorship />
                      </Suspense>
                    } />
                    <Route path="announcements" element={
                      <Suspense fallback={<LoadingSkeletons type="feed" count={5} />}>
                        <Announcements />
                      </Suspense>
                    } />
                    <Route path="documentation" element={
                      <Suspense fallback={<LoadingSkeletons type="feed" count={1} />}>
                        <Documentation />
                      </Suspense>
                    } />
                    <Route path="admin/deployment" element={
                      <Suspense fallback={<LoadingSkeletons type="feed" count={1} />}>
                        <DeploymentStatus />
                      </Suspense>
                    } />
                    <Route path="admin/monitoring" element={
                      <Suspense fallback={<LoadingSkeletons type="feed" count={1} />}>
                        <MonitoringDashboard />
                      </Suspense>
                    } />
                    <Route path="404" element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <NotFound />
                      </Suspense>
                    } />
                    <Route path="*" element={<Navigate to="/404" replace />} />
                  </Route>
                </Routes>
              </Suspense>
            </AuthGuard>
            <Toaster />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
