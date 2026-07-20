/**
 * UserWalletDto - Wallet information for credit-based access
 */
export interface UserWalletDto {
  id: number;
  userId: string;
  creditBalance: number;
  totalCreditsPurchased: number;
  totalCreditsConsumed: number;
  lastUpdatedAt: Date | null;
  subscriptionId: string | null;
  subscriptionStatus: string | null;
}