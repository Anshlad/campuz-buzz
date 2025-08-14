
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Settings as SettingsIcon, Users, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ModerationDashboard } from '@/components/moderation/ModerationDashboard';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');

  // Check if user is admin/moderator (you'd implement this based on your user role system)
  const isModeratorOrAdmin = false; // Replace with actual role check

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">
            <SettingsIcon className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Shield className="h-4 w-4 mr-2" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          {isModeratorOrAdmin && (
            <TabsTrigger value="moderation">
              <Shield className="h-4 w-4 mr-2" />
              Moderation
              <Badge variant="destructive" className="ml-2">
                Admin
              </Badge>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <Button variant="outline">Update Profile</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Privacy settings will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Notification settings will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {isModeratorOrAdmin && (
          <TabsContent value="moderation">
            <ModerationDashboard />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
