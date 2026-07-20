/**
 * CreditPackageDto - Credit package for purchase
 */
export interface CreditPackageDto {
  id: number;
  name: string;
  description: string;
  creditAmount: number;
  price: number;
  currency: string;
  durationMinutes: number | null;
  isActive: boolean;
  sortOrder: number;
  discountPercentage: number | null;
  isSubscription: boolean;
  discountedPrice: number | null;
}

/**
 * CreateCreditPackageDto - Used to create a new credit package (Admin only)
 */
export interface CreateCreditPackageDto {
  name: string;
  description: string;
  creditAmount: number;
  price: number;
  currency?: string;
  durationMinutes?: number | null;
  isActive?: boolean;
  sortOrder?: number;
  discountPercentage?: number | null;
  isSubscription?: boolean;
}