export interface ConsumeCreditsRequestDto {
  creditAmount: number;
  description: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
}