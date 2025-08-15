
import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const AuthPages = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            CampuzBuzz
          </h1>
          <p className="text-gray-600 mt-2">
            Connect with your college community
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardContent className="p-6">
            {isLogin ? <LoginForm /> : <RegisterForm />}
            
            <div className="mt-6 text-center">
              <Button 
                variant="ghost" 
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:text-blue-700"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
