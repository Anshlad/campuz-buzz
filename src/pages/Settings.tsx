
import React, { useState } from 'react';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Bell, 
  Shield, 
  Palette,
  User,
  Mail,
  Lock
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const { profile, updateProfile } = useUserProfile();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState({
    posts: true,
    comments: true,
    mentions: true,
    messages: true,
    events: true
  });

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Save notification preferences
      await updateProfile({
        privacy_settings: {
          ...profile?.privacy_settings,
          notifications
        }
      });
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <SettingsIcon className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          </div>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appearance */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <EnhancedCard variant="glass">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Palette className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Appearance</h2>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Theme</Label>
                      <p className="text-sm text-muted-foreground">
                        Choose your preferred color scheme
                      </p>
                    </div>
                    <EnhancedButton
                      variant="outline"
                      size="sm"
                      onClick={toggleTheme}
                      className="flex items-center gap-2"
                    >
                      {theme === 'light' ? (
                        <>
                          <Moon className="h-4 w-4" />
                          Dark Mode
                        </>
                      ) : (
                        <>
                          <Sun className="h-4 w-4" />
                          Light Mode
                        </>
                      )}
                    </EnhancedButton>
                  </div>
                </div>
              </EnhancedCard>
            </motion.div>

            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <EnhancedCard variant="glass">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Bell className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Notifications</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="capitalize">{key}</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications for {key}
                          </p>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) =>
                            setNotifications(prev => ({ ...prev, [key]: checked }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </EnhancedCard>
            </motion.div>

            {/* Account */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <EnhancedCard variant="glass">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Account</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile?.user_id || ''}
                        disabled
                        className="mt-1"
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <EnhancedButton variant="outline" className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Change Password
                      </EnhancedButton>
                      <EnhancedButton variant="outline" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Update Email
                      </EnhancedButton>
                    </div>
                  </div>
                </div>
              </EnhancedCard>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <EnhancedCard variant="glass">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <EnhancedButton
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleSaveSettings}
                      disabled={loading}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Settings'}
                    </EnhancedButton>
                    <EnhancedButton
                      variant="outline"
                      className="w-full justify-start text-destructive hover:text-destructive"
                      onClick={signOut}
                    >
                      Sign Out
                    </EnhancedButton>
                  </div>
                </div>
              </EnhancedCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
