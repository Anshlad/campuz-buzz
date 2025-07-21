
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import {
  Bell,
  BellOff,
  Heart,
  MessageCircle,
  UserPlus,
  Calendar,
  Users,
  BookOpen,
  Settings,
  Check,
  X,
  MoreHorizontal
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'event' | 'group' | 'announcement';
  title: string;
  message?: string;
  data?: any;
  is_read: boolean;
  created_at: string;
  user_id: string;
  sender?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
}

export const RealTimeNotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    loadNotifications();
    
    // Subscribe to real-time notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show browser notification if permission is granted
          if (Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/favicon.ico'
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const updatedNotification = payload.new as Notification;
          setNotifications(prev =>
            prev.map(n =>
              n.id === updatedNotification.id ? updatedNotification : n
            )
          );
          
          // Update unread count
          if (updatedNotification.is_read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          sender:profiles!notifications_user_id_fkey(
            id,
            display_name,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment': return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'follow': return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'event': return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'group': return <Users className="h-4 w-4 text-orange-500" />;
      case 'announcement': return <BookOpen className="h-4 w-4 text-indigo-500" />;
      default: return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  const filteredNotifications = notifications.filter(n =>
    filter === 'all' ? true : !n.is_read
  );

  if (loading) {
    return (
      <div className="w-80 h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-background border rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
            
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 mt-3">
          <Button
            variant={filter === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
            className="text-xs"
          >
            All
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('unread')}
            className="text-xs"
          >
            Unread ({unreadCount})
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-80">
        <AnimatePresence>
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <BellOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                    !notification.is_read ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                  }`}
                  onClick={() => {
                    if (!notification.is_read) {
                      markAsRead(notification.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={notification.sender?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {notification.sender?.display_name?.charAt(0) || 'S'}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getNotificationIcon(notification.type)}
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true
                          })}
                        </span>
                      </div>
                      
                      <p className="text-sm font-medium mt-1">
                        {notification.title}
                      </p>
                      
                      {notification.message && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={requestNotificationPermission}
          className="w-full text-xs"
        >
          Enable Browser Notifications
        </Button>
      </div>
    </div>
  );
};
