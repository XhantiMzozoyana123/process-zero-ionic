export interface PurchaseCreditsRequestDto {
  creditPackageId: number;
  paymentMethod?: string;
  paymentReference?: string;
}