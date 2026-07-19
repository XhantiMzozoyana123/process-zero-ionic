/**
 * UserStatusDto - returned from user search and online status endpoints
 */
export interface UserStatusDto {
  id: string;
  userName: string;
  email: string;
  isOnline: boolean;
  isAway?: boolean;
  lastSeen?: Date | string | null;
}

/**
 * CreateConversationDto - for creating new conversations
 */
export interface CreateConversationDto {
  userOneId?: string;
  userTwoId: string;
  isAnnouncement: boolean;
}
