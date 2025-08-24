import React from 'react';
import { AuthTestRunner } from '@/components/testing/AuthTestRunner';

export const Testing = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            CampuzBuzz Testing Suite
          </h1>
          <p className="text-lg text-muted-foreground">
            Authentication Testing: Login, Signup & Logout Verification
          </p>
        </div>
        
        <AuthTestRunner />
      </div>
    </div>
  );
};