
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { realtimeChatService, type RoomWithParticipants } from '@/services/realtimeChatService';
import { Plus, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatRoomListProps {
  selectedRoomId?: string;
  onRoomSelect: (room: RoomWithParticipants) => void;
  onCreateRoom: () => void;
}

export const ChatRoomList: React.FC<ChatRoomListProps> = ({
  selectedRoomId,
  onRoomSelect,
  onCreateRoom
}) => {
  const [rooms, setRooms] = useState<RoomWithParticipants[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setIsLoading(true);
      const data = await realtimeChatService.getUserRooms();
      setRooms(data);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-80 border-r bg-muted/30 p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-r bg-muted/30 flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Chat Rooms</h2>
          <Button size="sm" onClick={onCreateRoom}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          <AnimatePresence>
            {rooms.map((room) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Button
                  variant={selectedRoomId === room.id ? 'secondary' : 'ghost'}
                  className="w-full justify-start h-16 p-3"
                  onClick={() => onRoomSelect(room)}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Hash className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-medium truncate">{room.name}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {room.participants.length} member{room.participants.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    {room.unread_count && room.unread_count > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {room.unread_count}
                      </Badge>
                    )}
                  </div>
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>

          {rooms.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No chat rooms yet</p>
              <Button size="sm" variant="outline" className="mt-2" onClick={onCreateRoom}>
                Create your first room
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
