// src/app/models/bank-account.model.ts
export interface BankAccount {
  id?: number;
  accountHolderName: string;
  maskedAccountNumber?: string; // comes from backend
  bankName?: string;
  bankCode?: string; // optional, usually hidden
  accountNumber?: string; // only for sending to backend, not for display
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}