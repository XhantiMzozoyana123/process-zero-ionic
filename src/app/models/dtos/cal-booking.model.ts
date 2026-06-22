export interface CreateCalBookingRequest {
  eventTypeId: number;
  attendee: CalAttendee;
  start: string; // ISO 8601
  end: string;   // ISO 8601
  location?: string;
  metadata?: Record<string, string>;
  owner?: string; // OwnerEmail
}

export interface CalAttendee {
  name: string;
  email: string;
  timeZone?: string;
  language?: string;
  guests?: string[];
  metadata?: Record<string, string>;
}

// ── Response DTOs ──────────────────────────

export interface CalBookingResponse {
  status: string;
  data?: CalBookingData;
  error?: CalError;
}

export interface CalBookingData {
  id: number;
  uid: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: string;
  cancellationReason?: string;
  cancelledByEmail?: string;
  attendees?: CalAttendeeData[];
  location?: string;
  meetingUrl?: string;
  metadata?: Record<string, string>;
  eventTypeId: number;
  eventType?: CalEventTypeData;
}

export interface CalAttendeeData {
  name: string;
  email: string;
  timeZone?: string;
  language?: string;
}

export interface CalEventTypeData {
  id: number;
  slug: string;
  title: string;
  lengthMinutes: number;
}

export interface CalError {
  code: string;
  message: string;
}

// ── Availability ───────────────────────────

export interface CalAvailabilityRequest {
  eventTypeId: number;
  startDate: string; // "YYYY-MM-DD"
  endDate: string;   // "YYYY-MM-DD"
  timeZone?: string;
}

export interface CalAvailabilityResponse {
  status: string;
  data?: CalAvailabilityData;
  error?: CalError;
}

export interface CalAvailabilityData {
  slots?: Record<string, CalSlot[]>;
  minimumBookingNotice: number;
  lengthMinutes: number;
}

export interface CalSlot {
  time: string;
  attendees?: number;
}

// ── Webhook payloads ───────────────────────

export interface CalWebhookBookingCreated {
  triggerEvent: string;
  payload?: CalWebhookBookingPayload;
}

export interface CalWebhookBookingPayload {
  bookingId: number;
  uid: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: string;
  location?: string;
  meetingUrl?: string;
  attendees?: CalAttendeeData[];
  eventTypeId: number;
  eventType?: CalEventTypeData;
  metadata?: Record<string, string>;
}

export interface CancelBookingRequest {
  reason?: string;
}