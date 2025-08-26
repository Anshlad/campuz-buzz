
import React from 'react';
import { EnhancedAuthGuard } from './EnhancedAuthGuard';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  return <EnhancedAuthGuard>{children}</EnhancedAuthGuard>;
};
