
// TODO: TEMPORARY BYPASS - Authentication checks disabled in routing
import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AuthPages } from '@/components/auth/AuthPages';
import { Toaster } from '@/components/ui/toaster';
import { SmartSkeletonLoader } from '@/components/common/SmartSkeletonLoader';
import { ErrorBoundaryWithRetry } from '@/components/common/ErrorBoundaryWithRetry';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';

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
  useEffect(() => {
    // Prevent flash of unstyled content during theme initialization
    document.documentElement.classList.add('loading');
    
    // Remove loading class after theme is applied
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('loading');
    }, 100);

    // Add PWA manifest to head
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '/manifest.json';
    document.head.appendChild(link);

    // Add PWA theme color (will be updated by ThemeProvider)
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.setAttribute('name', 'theme-color');
      document.head.appendChild(themeColorMeta);
    }

    // Add apple-mobile-web-app-capable for iOS
    const appleMeta = document.createElement('meta');
    appleMeta.name = 'apple-mobile-web-app-capable';
    appleMeta.content = 'yes';
    document.head.appendChild(appleMeta);

    // Add apple-mobile-web-app-status-bar-style
    const appleStatusMeta = document.createElement('meta');
    appleStatusMeta.name = 'apple-mobile-web-app-status-bar-style';
    appleStatusMeta.content = 'black-translucent';
    document.head.appendChild(appleStatusMeta);

    return () => {
      clearTimeout(timer);
      document.head.removeChild(link);
      document.head.removeChild(appleMeta);
      document.head.removeChild(appleStatusMeta);
    };
  }, []);

  return (
    <ErrorBoundaryWithRetry>
      <AuthProvider>
        <ThemeProvider defaultTheme="dark" storageKey="campuzbuzz_theme">
          <BrowserRouter>
            <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
              <Routes>
                {/* TODO: TEMPORARY BYPASS - Removed /auth route, always show main app */}
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
            <PWAInstallPrompt />
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundaryWithRetry>
  );
}

export default App;
