/**
 * Request DTO for creating a PayShap payment order
 */
export interface CreatePayShapOrderRequest {
  packageId: number;
  email?: string;
  phone?: string;
}

/**
 * Response DTO for creating a PayShap payment order
 */
export interface CreatePayShapOrderResponse {
  orderId: string;
  packageId: number;
  amount: number;
  currency: string;
  payShapAccountNumber: string;
  payShapAccountHolder: string;
  payShapReference: string;
  instructions: string;
  expiresAt: string; // ISO date string
}

/**
 * Request DTO for submitting payment proof (screenshot)
 */
export interface SubmitPaymentProofRequest {
  orderId: string;
  paymentProofScreenshot: string; // Base64 encoded image
  bankTransactionReference?: string;
}

/**
 * Response DTO for payment proof submission
 */
export interface SubmitPaymentProofResponse {
  success: boolean;
  message: string;
  orderId: string;
  status: string;
  /**
   * Indicates whether the AI verification of the payment proof image passed.
   * When false, the user should retry uploading a valid payment screenshot.
   * Credits are only added when this is true.
   */
  verificationPassed?: boolean;
}

/**
 * DTO for payment order details
 */
export interface PaymentOrderDto {
  orderId: string;
  userId: string;
  userEmail: string;
  creditPackageId: number;
  packageName: string;
  amount: number;
  currency: string;
  payShapAccountNumber: string;
  payShapAccountHolder: string;
  payShapReference: string;
  status: string;
  paymentProofScreenshot?: string;
  bankTransactionReference?: string;
  adminNotes?: string;
  createdAt: string;
  expiresAt: string;
  verifiedAt?: string;
  completedAt?: string;
}