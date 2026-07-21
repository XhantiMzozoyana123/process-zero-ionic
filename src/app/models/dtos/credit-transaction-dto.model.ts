export interface CreditTransactionDto {
  id: number;
  userWalletId: number;
  transactionType: string;
  creditAmount: number;
  balanceAfterTransaction: number;
  description: string;
  referenceId?: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
  transactionDate: string;
  createdAt: string;
  updatedAt?: string;
}