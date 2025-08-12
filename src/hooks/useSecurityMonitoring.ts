
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityEvent {
  id: string;
  event_type: string;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

interface SecuritySettings {
  password_changed_at: string;
  failed_login_attempts: number;
  account_locked_until: string | null;
  two_factor_enabled: boolean;
  security_questions_set: boolean;
}

export const useSecurityMonitoring = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSecurityData();
    }
  }, [user]);

  const loadSecurityData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load recent security events
      const { data: events, error: eventsError } = await supabase
        .from('security_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (eventsError) throw eventsError;
      setSecurityEvents(events || []);

      // Load security settings
      const { data: settings, error: settingsError } = await supabase
        .from('user_security_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError;
      }

      setSecuritySettings(settings);

      // Check for security alerts
      if (settings?.failed_login_attempts && settings.failed_login_attempts > 3) {
        toast({
          title: "Security Alert",
          description: `${settings.failed_login_attempts} failed login attempts detected on your account.`,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const logSecurityEvent = async (eventType: string, metadata: Record<string, any> = {}) => {
    try {
      await supabase.from('security_events').insert({
        user_id: user?.id,
        event_type: eventType,
        user_agent: navigator.userAgent,
        metadata
      });
      
      // Refresh security events
      loadSecurityData();
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  const updateSecuritySettings = async (updates: Partial<SecuritySettings>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_security_settings')
        .upsert({
          user_id: user.id,
          ...updates,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      await logSecurityEvent('security_settings_updated', { changes: Object.keys(updates) });
      loadSecurityData();

      toast({
        title: "Security settings updated",
        description: "Your security preferences have been saved."
      });
    } catch (error) {
      console.error('Error updating security settings:', error);
      toast({
        title: "Error updating settings",
        description: "Failed to update security settings.",
        variant: "destructive"
      });
    }
  };

  return {
    securityEvents,
    securitySettings,
    loading,
    logSecurityEvent,
    updateSecuritySettings,
    refreshSecurityData: loadSecurityData
  };
};
