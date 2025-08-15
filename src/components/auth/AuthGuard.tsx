
// TODO: TEMPORARY BYPASS - AuthGuard is disabled, always allows access
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthPages } from './AuthPages';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  // TODO: TEMPORARY BYPASS - Skip all auth checks, always render children
  console.log('AUTH BYPASS: AuthGuard is disabled, allowing access to all routes');
  
  // Original auth logic is commented out but preserved for easy restoration:
  /*
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPages />;
  }
  */

  return <>{children}</>;
};
