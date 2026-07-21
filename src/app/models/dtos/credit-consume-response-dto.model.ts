export interface CreditConsumeResponseDto {
  success: boolean;
  message: string;
  newBalance: number;
  creditsConsumed: number;
}