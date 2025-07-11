
export const parseMessageMentions = (content: string): { text: string; mentions: string[] } => {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }

  return { text: content, mentions };
};

export const parseSlashCommands = (content: string): { isCommand: boolean; command?: string; args?: string[] } => {
  if (!content.startsWith('/')) {
    return { isCommand: false };
  }

  const parts = content.slice(1).split(' ');
  const command = parts[0];
  const args = parts.slice(1);

  return { isCommand: true, command, args };
};

export const formatMessageTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffInHours < 168) { // Less than a week
    return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
};

export const generateInviteLink = (communityId: string, inviteCode: string): string => {
  return `${window.location.origin}/invite/${inviteCode}`;
};

export const validateChannelName = (name: string): { isValid: boolean; error?: string } => {
  if (name.length < 1) {
    return { isValid: false, error: 'Channel name is required' };
  }
  
  if (name.length > 100) {
    return { isValid: false, error: 'Channel name must be less than 100 characters' };
  }
  
  if (!/^[a-z0-9-_]+$/.test(name)) {
    return { isValid: false, error: 'Channel name can only contain lowercase letters, numbers, hyphens, and underscores' };
  }
  
  return { isValid: true };
};

export const getVoiceChatURL = (sessionId: string): string => {
  // In a real implementation, this would generate a Jitsi Meet URL
  return `https://meet.jit.si/${sessionId}`;
};

export const SLASH_COMMANDS = {
  '/help': 'Show available commands',
  '/poll': 'Create a poll - /poll "Question" "Option 1" "Option 2"',
  '/invite': 'Generate an invite link',
  '/nick': 'Change your nickname in this server - /nick NewName',
  '/mute': 'Mute a user (moderators only) - /mute @username',
  '/kick': 'Kick a user (moderators only) - /kick @username',
  '/ban': 'Ban a user (moderators only) - /ban @username',
  '/clear': 'Clear recent messages (moderators only) - /clear 10',
} as const;

export const EMOJI_SHORTCUTS = {
  ':)': '😊',
  ':D': '😃',
  ':(': '😢',
  ':P': '😛',
  ':o': '😮',
  '<3': '❤️',
  ':thumbsup:': '👍',
  ':thumbsdown:': '👎',
  ':fire:': '🔥',
  ':100:': '💯',
} as const;

export const processMessageContent = (content: string): string => {
  let processed = content;
  
  // Replace emoji shortcuts
  Object.entries(EMOJI_SHORTCUTS).forEach(([shortcut, emoji]) => {
    processed = processed.replace(new RegExp(shortcut.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), emoji);
  });
  
  return processed;
};
