
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { securityService } from '@/services/securityService';

export interface RolePermissions {
  canModerate: boolean;
  canManageUsers: boolean;
  canDeleteAnyPost: boolean;
  canBanUsers: boolean;
  canCreateCommunity: boolean;
  canAccessAdminPanel: boolean;
  canViewAnalytics: boolean;
  canManageRoles: boolean;
}

export const useRoleBasedAccess = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<RolePermissions>({
    canModerate: false,
    canManageUsers: false,
    canDeleteAnyPost: false,
    canBanUsers: false,
    canCreateCommunity: false,
    canAccessAdminPanel: false,
    canViewAnalytics: false,
    canManageRoles: false,
  });
  const [userRole, setUserRole] = useState<string>('student');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserPermissions();
  }, [user]);

  const loadUserPermissions = async () => {
    if (!user) {
      setPermissions({
        canModerate: false,
        canManageUsers: false,
        canDeleteAnyPost: false,
        canBanUsers: false,
        canCreateCommunity: false,
        canAccessAdminPanel: false,
        canViewAnalytics: false,
        canManageRoles: false,
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Check individual permissions
      const [
        canModerate,
        canManageUsers,
        canDeleteAnyPost,
        canBanUsers,
        canCreateCommunity,
        hasAdminRole,
        hasModeratorRole
      ] = await Promise.all([
        securityService.canPerformAction('moderate_content'),
        securityService.canPerformAction('manage_users'),
        securityService.canPerformAction('delete_any_post'),
        securityService.canPerformAction('ban_user'),
        securityService.canPerformAction('create_community'),
        securityService.hasRole('admin'),
        securityService.hasRole('moderator')
      ]);

      // Determine user role
      let role = 'student';
      if (hasAdminRole) role = 'admin';
      else if (hasModeratorRole) role = 'moderator';

      setUserRole(role);
      setPermissions({
        canModerate,
        canManageUsers,
        canDeleteAnyPost,
        canBanUsers,
        canCreateCommunity,
        canAccessAdminPanel: hasAdminRole,
        canViewAnalytics: hasAdminRole || hasModeratorRole,
        canManageRoles: hasAdminRole,
      });

    } catch (error) {
      console.error('Error loading user permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPermission = async (action: string, resourceId?: string): Promise<boolean> => {
    try {
      return await securityService.canPerformAction(action, resourceId);
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  };

  const hasRole = (requiredRole: string): boolean => {
    const roleHierarchy = {
      'admin': 3,
      'moderator': 2,
      'student': 1
    };

    const userRoleLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

    return userRoleLevel >= requiredRoleLevel;
  };

  const requirePermission = (requiredPermission: keyof RolePermissions): boolean => {
    return permissions[requiredPermission];
  };

  return {
    permissions,
    userRole,
    loading,
    checkPermission,
    hasRole,
    requirePermission,
    refreshPermissions: loadUserPermissions
  };
};
