
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, RefreshCw } from 'lucide-react';
import { checkSecurityHeaders } from '@/utils/enhancedSecurityValidation';
import { useToast } from '@/hooks/use-toast';

interface EnhancedAuthGuardProps {
  children: React.ReactNode;
  requireRole?: 'admin' | 'moderator' | 'faculty' | 'student';
  fallbackComponent?: React.ReactNode;
  checkSecurity?: boolean;
}

export const EnhancedAuthGuard: React.FC<EnhancedAuthGuardProps> = ({
  children,
  requireRole,
  fallbackComponent,
  checkSecurity = true
}) => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [securityIssues, setSecurityIssues] = useState<string[]>([]);

  useEffect(() => {
    // Check security headers if enabled
    if (checkSecurity) {
      const { secure, warnings } = checkSecurityHeaders();
      if (!secure) {
        setSecurityIssues(warnings);
        warnings.forEach(warning => {
          toast({
            title: 'Security Warning',
            description: warning,
            variant: 'destructive'
          });
        });
      }
    }
  }, [checkSecurity, toast]);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRoleLoading(false);
        return;
      }

      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user role:', error);
        } else {
          setUserRole(data?.role || 'student');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setRoleLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  // Show loading state
  if (loading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show security warnings if any
  if (securityIssues.length > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Security Issues Detected
            </CardTitle>
            <CardDescription>
              Please address these security concerns before continuing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {securityIssues.map((issue, index) => (
              <Alert key={index} variant="destructive">
                <AlertDescription>{issue}</AlertDescription>
              </Alert>
            ))}
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full mt-4"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check authentication
  if (!user) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Authentication Required
            </CardTitle>
            <CardDescription>
              You must be signed in to access this content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please sign in to continue using the application.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check role requirements
  if (requireRole && userRole !== requireRole && userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-destructive" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have the required permissions to access this content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Required role: {requireRole}. Your role: {userRole || 'unknown'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
