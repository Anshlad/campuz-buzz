
import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AuthPages } from '@/components/auth/AuthPages';
import { Toaster } from '@/components/ui/toaster';
import { SmartSkeletonLoader } from '@/components/common/SmartSkeletonLoader';
import { ErrorBoundaryWithRetry } from '@/components/common/ErrorBoundaryWithRetry';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes - faster refresh
      gcTime: 5 * 60 * 1000, // 5 minutes - faster cleanup
      retry: 1, // Reduce retries for faster failure
      refetchOnWindowFocus: false,
      networkMode: 'offlineFirst', // Better offline support
    },
  },
});

// Lazy load main components for better performance
const EnhancedAppLayout = lazy(() => import('@/components/layout/EnhancedAppLayout').then(module => ({ default: module.EnhancedAppLayout })));

// Faster loading fallback
const AppLoadingFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

function App() {
  useEffect(() => {
    // Minimal initialization for faster startup
    document.documentElement.classList.remove('loading');
    
    // Add essential meta tags only
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="dark" storageKey="campuzbuzz_theme">
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
    </QueryClientProvider>
  );
}

export default App;
