export interface CreateCreditPackageDto {
  name: string;
  description: string;
  creditAmount: number;
  price: number;
  currency?: string;
  durationMinutes?: number;
  isActive?: boolean;
  sortOrder?: number;
  discountPercentage?: number;
  isSubscription?: boolean;
}