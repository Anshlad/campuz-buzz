
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserPermissions {
  canModerate: boolean;
  canAdmin: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canManageContent: boolean;
}

export const useRoleBasedAccess = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string>('student');
  const [permissions, setPermissions] = useState<UserPermissions>({
    canModerate: false,
    canAdmin: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canManageContent: false,
  });
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
          const role = profile.role || 'student';
          setUserRole(role);
          
          // Set permissions based on role
          const newPermissions: UserPermissions = {
            canModerate: role === 'moderator' || role === 'admin',
            canAdmin: role === 'admin',
            canManageUsers: role === 'admin',
            canViewAnalytics: role === 'moderator' || role === 'admin',
            canManageContent: role === 'moderator' || role === 'admin',
          };
          setPermissions(newPermissions);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole('student');
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

  return { userRole, hasRole, permissions, loading };
};
