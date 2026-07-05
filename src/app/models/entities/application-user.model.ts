export interface ApplicationUser {
  id: string;
  userName: string;
  email: string;
  emailConfirmed: boolean;
  phoneNumber?: string;
  facebookRecipientId?: string;
  messengerRecipientId?: string;
  recipientId?: string;
  lockoutEnabled?: boolean;
  lockoutEnd?: string;
  isBanned?: boolean;
  bannedAt?: string;
  banReason?: string;
}
