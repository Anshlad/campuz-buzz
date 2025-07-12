
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type Message = Database['public']['Tables']['messages']['Row'];
export type MessageInsert = Database['public']['Tables']['messages']['Insert'];
export type MessageUpdate = Database['public']['Tables']['messages']['Update'];

export interface MessageWithAuthor extends Message {
  author: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  reply_message?: MessageWithAuthor;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

class MessageService {
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

  async addReaction(messageId: string, emoji: string, userId: string): Promise<void> {
    // Get current reactions
    const { data: message } = await supabase
      .from('messages')
      .select('reactions')
      .eq('id', messageId)
      .single();

    const reactions = (message?.reactions as Record<string, string[]>) || {};
    
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

  async unpinMessage(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('pinned_messages')
      .delete()
      .eq('message_id', messageId);

    if (error) throw error;
  }

  async getMessageById(messageId: string): Promise<MessageWithAuthor | null> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles!messages_user_id_fkey (
          display_name,
          avatar_url
        )
      `)
      .eq('id', messageId)
      .single();

    if (error) throw error;
    if (!data) return null;

    // Parse attachments from JSON
    const attachments = Array.isArray(data.attachments) 
      ? data.attachments as MessageAttachment[]
      : [];

    return {
      ...data,
      author: {
        id: data.user_id,
        display_name: (data.profiles as any)?.display_name || `User ${data.user_id.slice(0, 8)}`,
        avatar_url: (data.profiles as any)?.avatar_url
      },
      attachments
    };
  }

  async sendMessageWithAttachments(
    content: string,
    attachments: MessageAttachment[],
    channelId?: string,
    dmConversationId?: string,
    replyTo?: string
  ): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        content,
        channel_id: channelId,
        dm_conversation_id: dmConversationId,
        reply_to: replyTo,
        attachments: attachments,
        user_id: (await supabase.auth.getUser()).data.user?.id!
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  subscribeToMessageUpdates(
    callback: (payload: any) => void,
    channelId?: string,
    dmConversationId?: string
  ) {
    const channel = supabase
      .channel('message_updates')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'messages',
          filter: channelId ? `channel_id=eq.${channelId}` : `dm_conversation_id=eq.${dmConversationId}`
        }, 
        callback
      )
      .on('postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: channelId ? `channel_id=eq.${channelId}` : `dm_conversation_id=eq.${dmConversationId}`
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const messageService = new MessageService();
