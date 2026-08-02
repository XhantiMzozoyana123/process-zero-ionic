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

// Default currency for credit packages
export const DEFAULT_CREDIT_PACKAGE_CURRENCY = 'ZAR';
