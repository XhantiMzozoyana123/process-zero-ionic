export interface Product {
  id?: number;
  userId?: string;
  name?: string;
  description?: string;
  profilePictureBase64?: string;
  url?: string;
  negotiableAmounts?: string;
  actualAmount?: number;
  createdAt?: string;
  updatedAt?: string;
}