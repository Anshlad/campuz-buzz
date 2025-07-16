import { AuthPages } from '@/pages/AuthPages';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthGuard } from '@/guards/AuthGuard';
import { AuthProvider } from '@/contexts/AuthContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { EnhancedAppLayout } from '@/layouts/EnhancedAppLayout';
import { AppErrorBoundary } from '@/components/common/AppErrorBoundary';

function App() {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <BrowserRouter>
            <div className="min-h-screen bg-background text-foreground">
              <Routes>
                <Route path="/auth" element={<AuthPages />} />
                <Route path="/*" element={
                  <AuthGuard>
                    <EnhancedAppLayout />
                  </AuthGuard>
                } />
              </Routes>
            </div>
            <Toaster />
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </AppErrorBoundary>
  );
}

export default App;
