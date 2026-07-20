/**
 * CreditTransactionType - Enum for transaction types
 */
export type CreditTransactionType = 'Purchase' | 'Consumption' | 'Refund' | 'Adjustment' | 'Bonus' | 'Subscription';

/**
 * CreditTransactionDto - Transaction record for credit movements
 */
export interface CreditTransactionDto {
  id: number;
  userWalletId: number;
  transactionType: CreditTransactionType;
  creditAmount: number;
  balanceAfterTransaction: number;
  description: string;
  referenceId: string | null;
  relatedEntityType: string | null;
  relatedEntityId: number | null;
  transactionDate: Date;
}