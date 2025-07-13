
import { supabase } from '@/integrations/supabase/client';

// Re-export everything from chatService to maintain compatibility
export * from './chatService';
export { chatService as messageService } from './chatService';

// Additional message-specific functions
export const addReaction = async (messageId: string, emoji: string, userId: string) => {
  const { data: message } = await supabase
    .from('messages')
    .select('reactions')
    .eq('id', messageId)
    .single();

  const reactions = message?.reactions as Record<string, string[]> || {};
  
  if (!reactions[emoji]) {
    reactions[emoji] = [];
  }

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
};

export const editMessage = async (messageId: string, content: string) => {
  const { error } = await supabase
    .from('messages')
    .update({ 
      content, 
      is_edited: true, 
      edited_at: new Date().toISOString() 
    })
    .eq('id', messageId);

  if (error) throw error;
};

export const deleteMessage = async (messageId: string) => {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId);

  if (error) throw error;
};

export const pinMessage = async (messageId: string, channelId?: string, dmConversationId?: string) => {
  const { error } = await supabase
    .from('pinned_messages')
    .insert({
      message_id: messageId,
      channel_id: channelId,
      dm_conversation_id: dmConversationId,
      pinned_by: (await supabase.auth.getUser()).data.user?.id!
    });

  if (error) throw error;
};
