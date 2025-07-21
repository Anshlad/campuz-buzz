
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chatService, type Channel } from '@/services/chatService';
import { getMessages, sendMessage, type MessageWithAuthor, type MessageAttachment } from '@/services/messageService';
import { EnhancedMessageBubble } from './EnhancedMessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { VoiceChatButton } from './VoiceChatButton';
import { ChannelHeader } from './ChannelHeader';
import { FileUpload } from '@/components/common/FileUpload';
import { fileUploadService, type UploadResult } from '@/services/fileUploadService';
import { 
  Send, 
  Smile, 
  Paperclip, 
  Hash,
  Volume2,
  Pin,
  Users,
  Settings,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInterfaceProps {
  channel?: Channel;
  dmConversationId?: string;
  communityId?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  channel, 
  dmConversationId, 
  communityId 
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageWithAuthor[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [replyTo, setReplyTo] = useState<MessageWithAuthor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleMessageUpdated = (messageId: string, newContent: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: newContent, is_edited: true, edited_at: new Date().toISOString() }
          : msg
      )
    );
  };

  const handleMessageDeleted = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const handleReply = (message: MessageWithAuthor) => {
    setReplyTo(message);
  };

  useEffect(() => {
    if (channel?.id || dmConversationId) {
      loadMessages();
      
      const unsubscribe = chatService.subscribeToMessages(
        (newMessage) => {
          // Convert chatService message to messageService format
          const convertedMessage: MessageWithAuthor = {
            id: newMessage.id,
            content: newMessage.content,
            user_id: newMessage.user_id,
            channel_id: newMessage.channel_id,
            dm_conversation_id: newMessage.dm_conversation_id,
            created_at: newMessage.created_at,
            is_edited: newMessage.is_edited || false,
            edited_at: newMessage.edited_at,
            attachments: Array.isArray(newMessage.attachments) ? newMessage.attachments : [],
            mentions: newMessage.mentions || [],
            reply_to: newMessage.reply_to,
            reactions: newMessage.reactions as Record<string, string[]> || {},
            author: newMessage.author
          };
          setMessages(prev => [...prev, convertedMessage]);
        },
        channel?.id,
        dmConversationId
      );

      const unsubscribeTyping = chatService.subscribeToTyping(
        setTypingUsers,
        channel?.id,
        dmConversationId
      );

      return () => {
        unsubscribe();
        unsubscribeTyping();
      };
    }
  }, [channel?.id, dmConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const data = await getMessages(channel?.id, dmConversationId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !user) return;

    try {
      await sendMessage(
        messageInput.trim(),
        channel?.id,
        dmConversationId,
        attachments,
        replyTo?.id
      );
      
      setMessageInput('');
      setReplyTo(null);
      setAttachments([]);
      handleStopTyping();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = async () => {
    if (!isTyping) {
      setIsTyping(true);
      await chatService.startTyping(channel?.id, dmConversationId);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 3000);
  };

  const handleStopTyping = async () => {
    if (isTyping) {
      setIsTyping(false);
      await chatService.stopTyping(channel?.id, dmConversationId);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleFileUpload = (result: UploadResult) => {
    const attachment: MessageAttachment = {
      id: Date.now().toString(),
      fileName: result.fileName,
      fileSize: result.fileSize,
      fileType: result.fileType,
      mimeType: result.mimeType,
      url: result.url
    };
    setAttachments(prev => [...prev, attachment]);
    setShowFileUpload(false);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <ChannelHeader 
        channel={channel}
        dmConversationId={dmConversationId}
        communityId={communityId}
      />

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-1">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <EnhancedMessageBubble
                key={message.id}
                message={message}
                isOwnMessage={message.user_id === user?.id}
                showAvatar={index === 0 || messages[index - 1].user_id !== message.user_id}
                onReply={handleReply}
                onMessageUpdated={handleMessageUpdated}
                onMessageDeleted={handleMessageDeleted}
              />
            ))}
          </AnimatePresence>
          
          {typingUsers.length > 0 && (
            <TypingIndicator users={typingUsers.filter(id => id !== user?.id)} />
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <AnimatePresence>
        {showFileUpload && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 border-t bg-muted/30"
          >
            <FileUpload
              type="attachment"
              onUploadComplete={handleFileUpload}
              multiple
              maxFiles={5}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 border-t bg-muted/50"
          >
            <div className="flex flex-wrap gap-2">
              {attachments.map((attachment, index) => (
                <div key={index} className="relative bg-background border rounded p-2 flex items-center space-x-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{attachment.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {(attachment.fileSize / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeAttachment(index)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2 bg-muted border-l-4 border-primary"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-muted-foreground">Replying to</span>
                <span className="font-medium">{replyTo.author.display_name}</span>
                <span className="text-muted-foreground truncate max-w-xs">
                  {replyTo.content}
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setReplyTo(null)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <Input
              value={messageInput}
              onChange={(e) => {
                setMessageInput(e.target.value);
                handleTyping();
              }}
              onBlur={handleStopTyping}
              placeholder={`Message ${channel ? `#${channel.name}` : 'direct message'}...`}
              className="pr-20 resize-none"
              maxLength={2000}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
              <Button 
                size="sm" 
                variant="ghost" 
                type="button"
                onClick={() => setShowFileUpload(!showFileUpload)}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" type="button">
                <Smile className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={!messageInput.trim()}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <div className="text-xs text-muted-foreground mt-1">
          {messageInput.length}/2000 characters
        </div>
      </div>
    </div>
  );
};
