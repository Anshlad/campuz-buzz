
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AuthPages } from '@/components/auth/AuthPages';
import { Toaster } from '@/components/ui/toaster';
import { SmartSkeletonLoader } from '@/components/common/SmartSkeletonLoader';
import { ErrorBoundaryWithRetry } from '@/components/common/ErrorBoundaryWithRetry';

// Lazy load main components for better performance
const EnhancedAppLayout = lazy(() => import('@/components/layout/EnhancedAppLayout').then(module => ({ default: module.EnhancedAppLayout })));

// Create a loading fallback component
const AppLoadingFallback = () => (
  <div className="min-h-screen bg-background">
    <div className="max-w-7xl mx-auto p-6">
      <SmartSkeletonLoader type="feed" />
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundaryWithRetry>
      <AuthProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <BrowserRouter>
            <div className="min-h-screen bg-background text-foreground">
              <Routes>
                <Route path="/auth" element={<AuthPages />} />
                <Route path="/*" element={
                  <AuthGuard>
                    <Suspense fallback={<AppLoadingFallback />}>
                      <EnhancedAppLayout />
                    </Suspense>
                  </AuthGuard>
                } />
              </Routes>
            </div>
            <Toaster />
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundaryWithRetry>
  );
}

export default App;
