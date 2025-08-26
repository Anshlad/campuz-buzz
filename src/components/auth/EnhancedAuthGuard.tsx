
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthPages } from './AuthPages';
import { LoadingSkeletons } from '@/components/common/LoadingSkeletons';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const EnhancedAuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      // Add a small delay to prevent flash
      const timer = setTimeout(() => {
        setShowAuth(true);
      }, 100);
      return () => clearTimeout(timer);
    } else if (user) {
      setShowAuth(false);
    }
  }, [loading, user]);

  // Show loading spinner while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading CampuzBuzz...</p>
        </div>
      </div>
    );
  }

  // Show auth pages if user is not authenticated
  if (!user && showAuth) {
    return <AuthPages />;
  }

  // User is authenticated, show the app
  if (user) {
    return <>{children}</>;
  }

  // Fallback loading state
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSkeletons type="feed" count={1} />
    </div>
  );
};
