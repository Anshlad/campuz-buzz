
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  major: string;
  year: string;
  bio?: string;
  isAdmin: boolean;
  interests: string[];
  joinedGroups: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  loading: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  major: string;
  year: string;
  interests?: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const savedUser = localStorage.getItem('campuzbuzz_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: '1',
        name: 'Alex Thompson',
        email,
        avatar: '/placeholder.svg',
        major: 'Computer Science',
        year: 'Junior',
        bio: 'Passionate about technology and connecting with fellow students.',
        isAdmin: email === 'admin@college.edu',
        interests: ['Programming', 'Machine Learning', 'Basketball'],
        joinedGroups: ['cs-study-group', 'ml-enthusiasts']
      };
      
      setUser(mockUser);
      localStorage.setItem('campuzbuzz_user', JSON.stringify(mockUser));
      
      toast({
        title: "Welcome back!",
        description: "Successfully logged in to CampuzBuzz."
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        major: userData.major,
        year: userData.year,
        isAdmin: false,
        interests: userData.interests || [],
        joinedGroups: []
      };
      
      setUser(newUser);
      localStorage.setItem('campuzbuzz_user', JSON.stringify(newUser));
      
      toast({
        title: "Welcome to CampuzBuzz!",
        description: "Your account has been created successfully."
      });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Please try again later.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Password reset sent",
        description: "Check your email for password reset instructions."
      });
    } catch (error) {
      toast({
        title: "Reset failed",
        description: "Please try again later.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (!user) return;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('campuzbuzz_user', JSON.stringify(updatedUser));
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Please try again later.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('campuzbuzz_user');
    toast({
      title: "Logged out",
      description: "See you next time!"
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, resetPassword, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
