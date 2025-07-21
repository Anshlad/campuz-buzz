
import { supabase } from '@/integrations/supabase/client';

export interface Message {
  id: string;
  content: string;
  user_id: string;
  channel_id?: string;
  dm_conversation_id?: string;
  created_at: string;
  is_edited: boolean;
  edited_at?: string;
  attachments?: any[];
  mentions?: string[];
  reply_to?: string;
}

export const editMessage = async (messageId: string, newContent: string): Promise<void> => {
  const { error } = await supabase
    .from('messages')
    .update({
      content: newContent,
      is_edited: true,
      edited_at: new Date().toISOString()
    })
    .eq('id', messageId);

  if (error) {
    throw new Error(`Failed to edit message: ${error.message}`);
  }
};

export const deleteMessage = async (messageId: string): Promise<void> => {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId);

  if (error) {
    throw new Error(`Failed to delete message: ${error.message}`);
  }
};

export const getMessages = async (
  channelId?: string, 
  conversationId?: string,
  limit = 50
): Promise<Message[]> => {
  let query = supabase
    .from('messages')
    .select(`
      id,
      content,
      user_id,
      channel_id,
      dm_conversation_id,
      created_at,
      is_edited,
      edited_at,
      attachments,
      mentions,
      reply_to,
      profiles:user_id (
        display_name,
        avatar_url
      )
    `)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (channelId) {
    query = query.eq('channel_id', channelId);
  } else if (conversationId) {
    query = query.eq('dm_conversation_id', conversationId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch messages: ${error.message}`);
  }

  return data || [];
};

export const sendMessage = async (
  content: string,
  channelId?: string,
  conversationId?: string,
  attachments?: any[],
  replyTo?: string
): Promise<Message> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const messageData = {
    content,
    user_id: user.user.id,
    channel_id: channelId,
    dm_conversation_id: conversationId,
    attachments: attachments || [],
    reply_to: replyTo,
    mentions: extractMentions(content),
  };

  const { data, error } = await supabase
    .from('messages')
    .insert(messageData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to send message: ${error.message}`);
  }

  return data;
};

// Helper function to extract mentions from message content
const extractMentions = (content: string): string[] => {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
};
