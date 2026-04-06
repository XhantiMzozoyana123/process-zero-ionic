export interface ApplicationUser {
  id: string;
  userName: string;
  email: string;
  emailConfirmed: boolean;
  phoneNumber?: string;
  lockoutEnabled?: boolean;
  lockoutEnd?: string;
  isBanned?: boolean;
  bannedAt?: string;
  banReason?: string;
}
