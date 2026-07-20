/**
 * PurchaseCreditsRequestDto - Request to purchase credits
 */
export interface PurchaseCreditsRequestDto {
  creditPackageId: number;
  paymentMethod?: string;
  paymentReference?: string;
}

/**
 * CreditPurchaseResponseDto - Response from credit purchase
 */
export interface CreditPurchaseResponseDto {
  success: boolean;
  message: string;
  newBalance: number;
  transactionId: number;
}