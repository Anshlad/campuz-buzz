
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

  async getMessageById(messageId: string): Promise<MessageWithAuthor | null> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .single();

    if (error) throw error;
    if (!data) return null;

    // Mock author data - in real implementation, join with profiles table
    return {
      ...data,
      author: {
        id: data.user_id,
        display_name: `User ${data.user_id.slice(0, 8)}`,
        avatar_url: undefined
      }
    };
  }
}

export const messageService = new MessageService();
