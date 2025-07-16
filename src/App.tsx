
import { AuthPages } from '@/components/auth/AuthPages';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AuthProvider } from '@/contexts/AuthContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { EnhancedAppLayout } from '@/components/layout/EnhancedAppLayout';
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
