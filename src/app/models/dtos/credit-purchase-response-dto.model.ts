export interface CreditPurchaseResponseDto {
  success: boolean;
  message: string;
  newBalance: number;
  transactionId: number;
}