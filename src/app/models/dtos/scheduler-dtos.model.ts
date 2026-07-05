export interface ScheduleSmsDto {
  phoneNumber: string;
  message: string;
  scheduledAt: string;
}

export interface ScheduleWhatsAppDto {
  phoneNumber: string;
  message: string;
  scheduledAt: string;
}

export interface ScheduleFacebookDto {
  recipientId: string;
  message: string;
  scheduledAt: string;
}

export interface ScheduleEmailDto {
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
  scheduledAt: string;
}

export interface RescheduleMessageDto {
  newScheduledAt: string;
}

export interface PendingSmsItem {
  id: number;
  phoneNumber: string;
  message: string;
  scheduledAt: string;
}

export interface PendingWhatsAppItem {
  id: number;
  phoneNumber: string;
  message: string;
  scheduledAt: string;
}

export interface PendingFacebookItem {
  id: number;
  recipientId: string;
  message: string;
  scheduledAt: string;
}

export interface PendingEmailItem {
  id: number;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
  scheduledAt: string;
}

export interface PagedResult<T> {
  count: number;
  messages: T[];
}

export interface ScheduleResult {
  message: string;
  id: number;
}

export interface ApiMessageResponse {
  message?: string;
  error?: string;
}