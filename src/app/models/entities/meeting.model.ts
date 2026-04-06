export interface Meeting {
  id?: number;
  userId?: string;
  clientId?: number;
  productId?: number;
  meetingDate: string; // ISO string
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}