export interface UserWalletDto {
  id: number;
  userId: string;
  creditBalance: number;
  totalCreditsPurchased: number;
  totalCreditsConsumed: number;
  lastUpdatedAt?: string;
  subscriptionId?: string;
  subscriptionStatus?: string;
  createdAt: string;
  updatedAt?: string;
}