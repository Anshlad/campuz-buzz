
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useRoleBasedAccess = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string>('student');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          setUserRole(profile.role || 'student');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole('student'); // Default fallback
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const hasRole = (requiredRole: string): boolean => {
    if (!requiredRole) return true;
    
    const roleHierarchy = {
      'student': 1,
      'moderator': 2,
      'admin': 3
    };

    const userRoleLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 1;
    const requiredRoleLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 1;

    return userRoleLevel >= requiredRoleLevel;
  };

  return { userRole, hasRole, loading };
};
