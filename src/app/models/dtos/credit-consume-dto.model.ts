/**
 * ConsumeCreditsRequestDto - Request to consume credits for platform access
 */
export interface ConsumeCreditsRequestDto {
  creditAmount: number;
  description: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
}

/**
 * CreditConsumeResponseDto - Response from credit consumption
 */
export interface CreditConsumeResponseDto {
  success: boolean;
  message: string;
  newBalance: number;
  creditsConsumed: number;
}

/**
 * CreditBalanceResponseDto - Response for credit balance check
 */
export interface CreditBalanceResponseDto {
  creditBalance: number;
  hasSufficientCredits: boolean;
  message: string;
}