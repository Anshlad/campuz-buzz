
// TODO: TEMPORARY BYPASS - Authentication is disabled. Restore original functionality later.
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MOCK_USER, MOCK_SESSION } from '@/utils/mockUser';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// TODO: TEMPORARY BYPASS - All auth functions are mocked
const logSecurityEvent = async (eventType: string, metadata: any = {}) => {
  console.log('MOCK: Security event would be logged:', eventType, metadata);
};

const validatePasswordStrength = (password: string): { isStrong: boolean; errors: string[] } => {
  // TODO: TEMPORARY BYPASS - Always return valid for demo
  return { isStrong: true, errors: [] };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // TODO: TEMPORARY BYPASS - Always return mock user and session
  const [user, setUser] = useState<User | null>(MOCK_USER);
  const [session, setSession] = useState<Session | null>(MOCK_SESSION);
  const [loading, setLoading] = useState(false); // No loading needed for mock
  const { toast } = useToast();

  useEffect(() => {
    // TODO: TEMPORARY BYPASS - Skip all Supabase auth initialization
    console.log('AUTH BYPASS: Using mock user data instead of Supabase auth');
    
    // Simulate auth initialization complete
    setUser(MOCK_USER);
    setSession(MOCK_SESSION);
    setLoading(false);
  }, []);

  const createOrUpdateProfile = async (user: User) => {
    // TODO: TEMPORARY BYPASS - Skip profile creation
    console.log('MOCK: Profile would be created/updated for user:', user.id);
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    // TODO: TEMPORARY BYPASS - Mock successful signup
    console.log('MOCK: Signup would be processed for:', email);
    toast({
      title: "Demo Mode",
      description: "Authentication is bypassed. You're already signed in as demo user."
    });
  };

  const signIn = async (email: string, password: string) => {
    // TODO: TEMPORARY BYPASS - Mock successful signin
    console.log('MOCK: Signin would be processed for:', email);
    toast({
      title: "Demo Mode",
      description: "Authentication is bypassed. You're already signed in as demo user."
    });
  };

  const signOut = async () => {
    // TODO: TEMPORARY BYPASS - Mock signout (but don't actually sign out)
    console.log('MOCK: Signout would be processed');
    toast({
      title: "Demo Mode",
      description: "Authentication is bypassed. Cannot sign out in demo mode."
    });
  };

  const resetPassword = async (email: string) => {
    // TODO: TEMPORARY BYPASS - Mock password reset
    console.log('MOCK: Password reset would be sent to:', email);
    toast({
      title: "Demo Mode",
      description: "Authentication is bypassed. Password reset not available."
    });
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
