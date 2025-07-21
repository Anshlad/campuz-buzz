
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Search } from 'lucide-react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  trigger?: React.ReactNode;
}

const EMOJI_CATEGORIES = {
  'Smileys & People': [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥲', '☺️', '😊', '😇', '🙂', '🙃', '😉', '😌',
    '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸',
    '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢',
    '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔'
  ],
  'Animals & Nature': [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵',
    '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗'
  ],
  'Food & Drink': [
    '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝',
    '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐'
  ],
  'Activities': [
    '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃',
    '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️'
  ],
  'Objects': [
    '⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼',
    '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭'
  ],
  'Symbols': [
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
    '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈'
  ]
};

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ 
  onEmojiSelect, 
  trigger 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Smileys & People');
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredEmojis = searchTerm
    ? Object.values(EMOJI_CATEGORIES)
        .flat()
        .filter(emoji => 
          emoji.includes(searchTerm.toLowerCase())
        )
    : EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES] || [];

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={pickerRef}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger || (
          <EnhancedButton variant="ghost" size="sm">
            <Smile className="h-4 w-4" />
          </EnhancedButton>
        )}
      </div>

      {/* Picker Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute bottom-full mb-2 right-0 z-50"
          >
            <EnhancedCard className="w-80 max-h-96 p-0 overflow-hidden">
              {/* Search */}
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search emojis..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Categories */}
              {!searchTerm && (
                <div className="flex p-2 border-b overflow-x-auto">
                  {Object.keys(EMOJI_CATEGORIES).map((category) => (
                    <EnhancedButton
                      key={category}
                      variant={activeCategory === category ? "default" : "ghost"}
                      size="sm"
                      className="whitespace-nowrap mr-1 text-xs"
                      onClick={() => setActiveCategory(category)}
                    >
                      {category.split(' ')[0]}
                    </EnhancedButton>
                  ))}
                </div>
              )}

              {/* Emoji Grid */}
              <ScrollArea className="h-64">
                <div className="p-3">
                  <div className="grid grid-cols-8 gap-2">
                    {filteredEmojis.map((emoji, index) => (
                      <motion.button
                        key={`${emoji}-${index}`}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-xl hover:bg-muted rounded p-1 transition-colors"
                        onClick={() => handleEmojiClick(emoji)}
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>

                  {filteredEmojis.length === 0 && searchTerm && (
                    <div className="text-center py-8 text-muted-foreground">
                      No emojis found for "{searchTerm}"
                    </div>
                  )}
                </div>
              </ScrollArea>
            </EnhancedCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
