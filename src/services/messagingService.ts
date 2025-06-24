
export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
  chatId: string;
  isRead: boolean;
}

export interface Chat {
  id: string;
  name: string;
  avatar?: string;
  type: 'direct' | 'group' | 'study';
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  isOnline?: boolean;
}

class MessagingService {
  private mockChats: Chat[] = [
    {
      id: 'direct-1',
      name: 'Sarah Johnson',
      avatar: '/placeholder.svg',
      type: 'direct',
      participants: ['1', '2'],
      unreadCount: 2,
      isOnline: true
    },
    {
      id: 'group-1',
      name: 'CS Study Group',
      avatar: '/placeholder.svg',
      type: 'study',
      participants: ['1', '2', '3', '4'],
      unreadCount: 0,
      isOnline: false
    },
    {
      id: 'group-2',
      name: 'Machine Learning Club',
      avatar: '/placeholder.svg',
      type: 'group',
      participants: ['1', '2', '5', '6'],
      unreadCount: 1,
      isOnline: false
    }
  ];

  private mockMessages: Message[] = [
    {
      id: '1',
      senderId: '2',
      senderName: 'Sarah Johnson',
      senderAvatar: '/placeholder.svg',
      content: 'Hey! How did your ML project presentation go?',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      type: 'text',
      chatId: 'direct-1',
      isRead: false
    },
    {
      id: '2',
      senderId: '2',
      senderName: 'Sarah Johnson',
      senderAvatar: '/placeholder.svg',
      content: 'I heard it went really well! 🎉',
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      type: 'text',
      chatId: 'direct-1',
      isRead: false
    },
    {
      id: '3',
      senderId: '3',
      senderName: 'Mike Chen',
      content: 'Anyone free for the study session tomorrow?',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      type: 'text',
      chatId: 'group-1',
      isRead: true
    }
  ];

  private listeners: ((chats: Chat[]) => void)[] = [];
  private messageListeners: ((messages: Message[]) => void)[] = [];

  async getChats(userId: string): Promise<Chat[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Add last messages to chats
    const chatsWithMessages = this.mockChats.map(chat => {
      const chatMessages = this.mockMessages
        .filter(msg => msg.chatId === chat.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      return {
        ...chat,
        lastMessage: chatMessages[0]
      };
    });
    
    return chatsWithMessages;
  }

  async getMessages(chatId: string): Promise<Message[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return this.mockMessages
      .filter(msg => msg.chatId === chatId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async sendMessage(chatId: string, content: string, senderId: string, senderName: string): Promise<Message> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId,
      senderName,
      senderAvatar: '/placeholder.svg',
      content,
      timestamp: new Date().toISOString(),
      type: 'text',
      chatId,
      isRead: false
    };
    
    this.mockMessages.push(newMessage);
    
    // Notify listeners
    this.messageListeners.forEach(listener => {
      const chatMessages = this.mockMessages
        .filter(msg => msg.chatId === chatId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      listener(chatMessages);
    });
    
    return newMessage;
  }

  async markAsRead(chatId: string, userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    this.mockMessages
      .filter(msg => msg.chatId === chatId && msg.senderId !== userId)
      .forEach(msg => msg.isRead = true);
    
    // Update unread count
    const chat = this.mockChats.find(c => c.id === chatId);
    if (chat) {
      chat.unreadCount = 0;
    }
  }

  subscribeToMessages(chatId: string, callback: (messages: Message[]) => void): () => void {
    this.messageListeners.push(callback);
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance of new message every 5 seconds
        // Simulate receiving a message (in real app, this would come from WebSocket)
        const chatMessages = this.mockMessages
          .filter(msg => msg.chatId === chatId)
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        callback(chatMessages);
      }
    }, 5000);
    
    return () => {
      clearInterval(interval);
      this.messageListeners = this.messageListeners.filter(l => l !== callback);
    };
  }

  async createGroupChat(name: string, participants: string[]): Promise<Chat> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newChat: Chat = {
      id: `group-${Date.now()}`,
      name,
      type: 'group',
      participants,
      unreadCount: 0,
      isOnline: false
    };
    
    this.mockChats.push(newChat);
    return newChat;
  }
}

export const messagingService = new MessagingService();
