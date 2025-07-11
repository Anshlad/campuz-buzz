
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { chatService, type CommunityWithChannels, type Channel, type DMConversation } from '@/services/chatService';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { ChannelSidebar } from '@/components/chat/ChannelSidebar';
import { 
  MessageSquare, 
  Users, 
  Plus, 
  Search,
  UserPlus,
  Hash,
  AtSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmptyState } from '@/components/common/EmptyState';

export const Chat = () => {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<CommunityWithChannels[]>([]);
  const [dmConversations, setDmConversations] = useState<DMConversation[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityWithChannels | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [selectedDM, setSelectedDM] = useState<DMConversation | null>(null);
  const [activeTab, setActiveTab] = useState<'communities' | 'dms'>('communities');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [communitiesData, dmData] = await Promise.all([
        chatService.getCommunities(),
        chatService.getDMConversations()
      ]);
      
      setCommunities(communitiesData);
      setDmConversations(dmData);
      
      // Auto-select first community and channel
      if (communitiesData.length > 0 && !selectedCommunity) {
        const firstCommunity = communitiesData[0];
        setSelectedCommunity(firstCommunity);
        if (firstCommunity.channels.length > 0) {
          setSelectedChannel(firstCommunity.channels[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load chat data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommunitySelect = (community: CommunityWithChannels) => {
    setSelectedCommunity(community);
    setSelectedDM(null);
    if (community.channels.length > 0) {
      setSelectedChannel(community.channels[0]);
    }
    setActiveTab('communities');
  };

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel);
    setSelectedDM(null);
  };

  const handleDMSelect = (dm: DMConversation) => {
    setSelectedDM(dm);
    setSelectedChannel(null);
    setSelectedCommunity(null);
    setActiveTab('dms');
  };

  const filteredCommunities = communities.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] max-w-full">
      {/* Left Sidebar - Communities/DMs List */}
      <div className="w-72 bg-muted/30 border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Chat</h2>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
          <TabsList className="mx-4 mt-2">
            <TabsTrigger value="communities" className="flex-1">
              <Users className="h-4 w-4 mr-2" />
              Communities
            </TabsTrigger>
            <TabsTrigger value="dms" className="flex-1">
              <MessageSquare className="h-4 w-4 mr-2" />
              DMs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="communities" className="flex-1 m-0">
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {filteredCommunities.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No communities found</p>
                    <Button size="sm" variant="outline" className="mt-2">
                      <Plus className="h-4 w-4 mr-2" />
                      Join Community
                    </Button>
                  </div>
                ) : (
                  filteredCommunities.map((community) => (
                    <motion.div
                      key={community.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <Button
                        variant={selectedCommunity?.id === community.id ? 'secondary' : 'ghost'}
                        className="w-full justify-start h-12 mb-1"
                        onClick={() => handleCommunitySelect(community)}
                      >
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarImage src={community.avatar_url} />
                          <AvatarFallback>{community.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <div className="font-medium truncate">{community.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {community.member_count} members
                          </div>
                        </div>
                        {community.channels.some(c => c.name === 'general') && (
                          <Badge variant="secondary" className="ml-2">
                            3
                          </Badge>
                        )}
                      </Button>
                    </motion.div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="dms" className="flex-1 m-0">
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-10 text-muted-foreground"
                >
                  <UserPlus className="h-4 w-4 mr-3" />
                  Start new conversation
                </Button>
                
                {dmConversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No direct messages</p>
                  </div>
                ) : (
                  dmConversations.map((dm) => (
                    <Button
                      key={dm.id}
                      variant={selectedDM?.id === dm.id ? 'secondary' : 'ghost'}
                      className="w-full justify-start h-12"
                      onClick={() => handleDMSelect(dm)}
                    >
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarFallback>
                          {dm.is_group ? <Users className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <div className="font-medium truncate">
                          {dm.name || `${dm.participants.length} participants`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Last message...
                        </div>
                      </div>
                    </Button>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Middle - Channel List (for communities) */}
      {selectedCommunity && activeTab === 'communities' && (
        <ChannelSidebar
          community={selectedCommunity}
          activeChannelId={selectedChannel?.id}
          onChannelSelect={handleChannelSelect}
          onCreateChannel={() => console.log('Create channel')}
        />
      )}

      {/* Right - Chat Interface */}
      <div className="flex-1 flex flex-col">
        {selectedChannel || selectedDM ? (
          <ChatInterface
            channel={selectedChannel || undefined}
            dmConversationId={selectedDM?.id}
            communityId={selectedCommunity?.id}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon={<MessageSquare className="h-12 w-12" />}
              title="No conversation selected"
              description="Choose a community channel or direct message to start chatting"
            />
          </div>
        )}
      </div>
    </div>
  );
};
