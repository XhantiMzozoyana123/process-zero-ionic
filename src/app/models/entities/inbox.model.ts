export interface Inbox {
  id?: number;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  username: string;
  password: string;
  smtpHost: string;
  smtpPort: number;
  smtpUseSsl: boolean;
  imapHost: string;
  imapPort: number;
  imapUseSsl: boolean;
  isPrimary: boolean;
}
