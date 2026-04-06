export interface Invoice {
  id?: number;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  productId: number;
  clientId: number;
  invoiceCode: string;
  customerCode: string;
  amount: number;
  isPaid: boolean;
  issuedAt: string;
  paidAt?: string;
  externalInvoiceId?: string;
}
