/**
 * Message entity model for the messenger functionality.
 */
export interface Message {
  id: number;
  conversationId: number;
  senderId: string;
  text: string;
  sentAt: Date | string;
  read: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * MessageDto - returned from API
 */
export interface MessageDto {
  id: number;
  conversationId: number;
  senderId: string;
  senderName: string;
  text: string;
  sentAt: Date | string;
  read: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * SendMessageDto - for sending new messages
 */
export interface SendMessageDto {
  conversationId?: number;
  text: string;
}

/**
 * SendMessageResponseDto - response after sending a message
 */
export interface SendMessageResponseDto {
  id: number;
  conversationId: number;
  senderId: string;
  text: string;
  sentAt: Date | string;
  read: boolean;
}