/**
 * Conversation entity model for the messenger functionality.
 */
export interface Conversation {
  id: number;
  userOneId: string;
  userTwoId: string;
  isPinned: boolean;
  isAnnouncement: boolean;
  lastMessageAt?: Date | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * ConversationDto - returned from API with participant info and unread count
 */
export interface ConversationDto {
  id: number;
  otherParticipant: {
    id: string;
    userName: string;
    email: string;
    isOnline: boolean;
    lastSeen?: Date | string | null;
  };
  isPinned: boolean;
  isAnnouncement: boolean;
  lastMessage?: string;
  lastMessageAt?: Date | string | null;
  unreadCount: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}