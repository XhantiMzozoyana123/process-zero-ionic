export interface Meeting {
  id?: number;
  userId?: string;
  clientId?: number;
  productId?: number;
  meetingDate: string; // ISO string
  notes?: string;
  calBookingUid?: string;    // cal.com booking UID
  calMeetingUrl?: string;    // cal.com meeting URL (video link)
  createdAt?: string;
  updatedAt?: string;
}
