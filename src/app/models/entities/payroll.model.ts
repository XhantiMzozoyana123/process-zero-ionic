export interface Payout {
  id?: number;
  userId?: string;
  bankAccountId?: number;
  amount?: number;
  month?: number;
  year?: number;
  notes?: string;
  isPaid?: boolean;
}

export interface PayrollUserNotification {
  userName: string;
  email: string;
  amount: number;
}

export interface PayrollReportResult {
  rows: string[][];
  adminEmails: string[];
  userNotifications: PayrollUserNotification[];
}

export interface PayrollGenerateResponse {
  downloadUrl: string;
}
