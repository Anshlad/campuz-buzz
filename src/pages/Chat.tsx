
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Search, Plus, Users } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group';
  participants: number;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  avatar?: string;
}

export const Chat = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>('1');
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatRooms: ChatRoom[] = [
    {
      id: '1',
      name: 'CS Study Group',
      type: 'group',
      participants: 8,
      lastMessage: 'Anyone working on the algorithm assignment?',
      lastMessageTime: '2 min ago',
      unreadCount: 3,
      avatar: '/placeholder.svg'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      type: 'direct',
      participants: 2,
      lastMessage: 'Thanks for the notes!',
      lastMessageTime: '1 hour ago',
      unreadCount: 0,
      avatar: '/placeholder.svg'
    },
    {
      id: '3',
      name: 'Project Team Alpha',
      type: 'group',
      participants: 5,
      lastMessage: 'Meeting tomorrow at 3 PM',
      lastMessageTime: '3 hours ago',
      unreadCount: 1,
      avatar: '/placeholder.svg'
    },
    {
      id: '4',
      name: 'Mike Chen',
      type: 'direct',
      participants: 2,
      lastMessage: 'See you in class!',
      lastMessageTime: '1 day ago',
      unreadCount: 0,
      avatar: '/placeholder.svg'
    }
  ];

  useEffect(() => {
    if (selectedChat) {
      // Mock messages for the selected chat
      const mockMessages: Message[] = [
        {
          id: '1',
          senderId: '2',
          senderName: 'Sarah Johnson',
          content: 'Hey everyone! Did anyone finish the algorithm assignment yet?',
          timestamp: new Date(Date.now() - 3600000),
          isOwn: false
        },
        {
          id: '2',
          senderId: '1',
          senderName: 'You',
          content: 'I\'m about halfway through. The dynamic programming part is tricky!',
          timestamp: new Date(Date.now() - 3500000),
          isOwn: true
        },
        {
          id: '3',
          senderId: '3',
          senderName: 'Mike Chen',
          content: 'Same here! Anyone want to form a study session this weekend?',
          timestamp: new Date(Date.now() - 3000000),
          isOwn: false
        },
        {
          id: '4',
          senderId: '1',
          senderName: 'You',
          content: 'I\'m in! Saturday afternoon works for me.',
          timestamp: new Date(Date.now() - 2800000),
          isOwn: true
        },
        {
          id: '5',
          senderId: '4',
          senderName: 'Emma Davis',
          content: 'Count me in too! Should we meet at the library?',
          timestamp: new Date(Date.now() - 120000),
          isOwn: false
        }
      ];
      setMessages(mockMessages);
    }
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: '1',
      senderName: 'You',
      content: messageInput,
      timestamp: new Date(),
      isOwn: true
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');
  };

  const selectedChatData = chatRooms.find(chat => chat.id === selectedChat);

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Chat List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Messages</CardTitle>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search conversations..." className="pl-10" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {chatRooms.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat.id)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer border-l-4 ${
                    selectedChat === chat.id ? 'border-blue-500 bg-blue-50' : 'border-transparent'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={chat.avatar} />
                        <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {chat.type === 'group' && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1">
                          <Users className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate">{chat.name}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">{chat.lastMessageTime}</span>
                          {chat.unreadCount > 0 && (
                            <Badge className="bg-red-500 text-white text-xs px-2 py-1">
                              {chat.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                      {chat.type === 'group' && (
                        <p className="text-xs text-gray-400">{chat.participants} participants</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedChatData ? (
            <>
              {/* Chat Header */}
              <CardHeader className="border-b">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedChatData.avatar} />
                    <AvatarFallback>{selectedChatData.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedChatData.name}</h3>
                    <p className="text-sm text-gray-500">
                      {selectedChatData.type === 'group' 
                        ? `${selectedChatData.participants} participants` 
                        : 'Online now'
                      }
                    </p>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${message.isOwn ? 'order-2' : 'order-1'}`}>
                      {!message.isOwn && (
                        <p className="text-xs text-gray-500 mb-1">{message.senderName}</p>
                      )}
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          message.isOwn
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${message.isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Message Input */}
              <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!messageInput.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-500">Choose from your existing conversations or start a new one.</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};
