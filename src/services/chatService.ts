
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type Community = Database['public']['Tables']['communities_enhanced']['Row'];
export type Channel = Database['public']['Tables']['community_channels']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type CommunityMember = Database['public']['Tables']['community_members']['Row'];
export type CommunityRole = Database['public']['Tables']['community_roles']['Row'];
export type DMConversation = Database['public']['Tables']['dm_conversations']['Row'];

export interface MessageWithAuthor extends Message {
  author: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  reply_message?: MessageWithAuthor;
  thread_replies?: MessageWithAuthor[];
}

export interface CommunityWithChannels extends Community {
  channels: Channel[];
  roles: CommunityRole[];
  member_role?: string;
}

class ChatService {
  // Communities
  async getCommunities(): Promise<CommunityWithChannels[]> {
    const { data: communities, error } = await supabase
      .from('communities_enhanced')
      .select(`
        *,
        channels:community_channels(*),
        roles:community_roles(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return communities as CommunityWithChannels[];
  }

  async createCommunity(name: string, description?: string): Promise<Community> {
    const { data, error } = await supabase
      .from('communities_enhanced')
      .insert({ name, description, created_by: (await supabase.auth.getUser()).data.user?.id! })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async joinCommunity(communityId: string): Promise<void> {
    const { error } = await supabase
      .from('community_members')
      .insert({ 
        community_id: communityId, 
        user_id: (await supabase.auth.getUser()).data.user?.id! 
      });

    if (error) throw error;
  }

  // Channels
  async getChannels(communityId: string): Promise<Channel[]> {
    const { data, error } = await supabase
      .from('community_channels')
      .select('*')
      .eq('community_id', communityId)
      .order('position');

    if (error) throw error;
    return data;
  }

  async createChannel(communityId: string, name: string, type: 'text' | 'voice' = 'text', description?: string): Promise<Channel> {
    const { data, error } = await supabase
      .from('community_channels')
      .insert({
        community_id: communityId,
        name,
        type,
        description,
        created_by: (await supabase.auth.getUser()).data.user?.id!
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Messages
  async getMessages(channelId?: string, dmConversationId?: string): Promise<MessageWithAuthor[]> {
    const query = supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (channelId) {
      query.eq('channel_id', channelId);
    } else if (dmConversationId) {
      query.eq('dm_conversation_id', dmConversationId);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Since we don't have a profiles table, we'll create mock author data
    // In a real implementation, you'd want to create a profiles table or get user data differently
    return data.map(msg => ({
      ...msg,
      author: {
        id: msg.user_id,
        display_name: `User ${msg.user_id.slice(0, 8)}`,
        avatar_url: undefined
      }
    })) as MessageWithAuthor[];
  }

  async sendMessage(content: string, channelId?: string, dmConversationId?: string, replyTo?: string): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        content,
        channel_id: channelId,
        dm_conversation_id: dmConversationId,
        reply_to: replyTo,
        user_id: (await supabase.auth.getUser()).data.user?.id!
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async editMessage(messageId: string, content: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ 
        content, 
        is_edited: true, 
        edited_at: new Date().toISOString() 
      })
      .eq('id', messageId);

    if (error) throw error;
  }

  async deleteMessage(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) throw error;
  }

  async reactToMessage(messageId: string, emoji: string): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id!;
    
    // Get current reactions
    const { data: message } = await supabase
      .from('messages')
      .select('reactions')
      .eq('id', messageId)
      .single();

    const reactions = message?.reactions as Record<string, string[]> || {};
    
    if (!reactions[emoji]) {
      reactions[emoji] = [];
    }

    // Toggle reaction
    const userIndex = reactions[emoji].indexOf(userId);
    if (userIndex > -1) {
      reactions[emoji].splice(userIndex, 1);
      if (reactions[emoji].length === 0) {
        delete reactions[emoji];
      }
    } else {
      reactions[emoji].push(userId);
    }

    const { error } = await supabase
      .from('messages')
      .update({ reactions })
      .eq('id', messageId);

    if (error) throw error;
  }

  async pinMessage(messageId: string, channelId?: string, dmConversationId?: string): Promise<void> {
    const { error } = await supabase
      .from('pinned_messages')
      .insert({
        message_id: messageId,
        channel_id: channelId,
        dm_conversation_id: dmConversationId,
        pinned_by: (await supabase.auth.getUser()).data.user?.id!
      });

    if (error) throw error;
  }

  // Direct Messages
  async getDMConversations(): Promise<DMConversation[]> {
    const userId = (await supabase.auth.getUser()).data.user?.id!;
    
    const { data, error } = await supabase
      .from('dm_conversations')
      .select('*')
      .contains('participants', [userId])
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async createDMConversation(participantIds: string[], isGroup = false, name?: string): Promise<DMConversation> {
    const userId = (await supabase.auth.getUser()).data.user?.id!;
    const allParticipants = [...new Set([userId, ...participantIds])];

    const { data, error } = await supabase
      .from('dm_conversations')
      .insert({
        participants: allParticipants,
        is_group: isGroup,
        name,
        created_by: userId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Typing indicators - Fixed parameter order
  async startTyping(channelId: string, dmConversationId?: string): Promise<void> {
    const { error } = await supabase
      .from('typing_indicators')
      .upsert({
        channel_id: channelId,
        dm_conversation_id: dmConversationId,
        user_id: (await supabase.auth.getUser()).data.user?.id!,
        started_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  async stopTyping(channelId: string, dmConversationId?: string): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id!;
    
    let query = supabase
      .from('typing_indicators')
      .delete()
      .eq('user_id', userId);

    if (channelId) {
      query = query.eq('channel_id', channelId);
    } else if (dmConversationId) {
      query = query.eq('dm_conversation_id', dmConversationId);
    }

    await query;
  }

  // Voice chat - Fixed parameter order
  async startVoiceSession(channelId: string): Promise<string> {
    const sessionId = `room_${channelId}_${Date.now()}`;
    const userId = (await supabase.auth.getUser()).data.user?.id!;

    const { error } = await supabase
      .from('voice_sessions')
      .insert({
        channel_id: channelId,
        session_id: sessionId,
        started_by: userId,
        participants: [userId]
      });

    if (error) throw error;
    return sessionId;
  }

  async joinVoiceSession(sessionId: string): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id!;

    // Get current session
    const { data: session } = await supabase
      .from('voice_sessions')
      .select('participants')
      .eq('session_id', sessionId)
      .single();

    if (session) {
      const participants = [...session.participants, userId];
      
      const { error } = await supabase
        .from('voice_sessions')
        .update({ participants })
        .eq('session_id', sessionId);

      if (error) throw error;
    }
  }

  async leaveVoiceSession(sessionId: string): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id!;

    const { data: session } = await supabase
      .from('voice_sessions')
      .select('participants')
      .eq('session_id', sessionId)
      .single();

    if (session) {
      const participants = session.participants.filter(id => id !== userId);
      
      const { error } = await supabase
        .from('voice_sessions')
        .update({ participants })
        .eq('session_id', sessionId);

      if (error) throw error;
    }
  }

  // Real-time subscriptions
  subscribeToMessages(channelId?: string, dmConversationId?: string, callback: (message: MessageWithAuthor) => void) {
    let channel = supabase
      .channel('messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: channelId ? `channel_id=eq.${channelId}` : `dm_conversation_id=eq.${dmConversationId}`
        }, 
        (payload) => {
          // Fetch full message with author info
          this.getMessages(channelId, dmConversationId).then(messages => {
            const newMessage = messages.find(m => m.id === payload.new.id);
            if (newMessage) {
              callback(newMessage);
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  subscribeToTyping(channelId?: string, dmConversationId?: string, callback: (users: string[]) => void) {
    let channel = supabase
      .channel('typing')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: channelId ? `channel_id=eq.${channelId}` : `dm_conversation_id=eq.${dmConversationId}`
        },
        () => {
          // Fetch current typing users
          let query = supabase
            .from('typing_indicators')
            .select('user_id');
          
          if (channelId) {
            query = query.eq('channel_id', channelId);
          } else if (dmConversationId) {
            query = query.eq('dm_conversation_id', dmConversationId);
          }

          query.then(({ data }) => {
            const userIds = data?.map(t => t.user_id) || [];
            callback(userIds);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const chatService = new ChatService();
