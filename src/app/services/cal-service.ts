import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  CreateCalBookingRequest,
  CalBookingData,
  CalAvailabilityRequest,
  CalAvailabilityData,
  CancelBookingRequest,
} from '../models/dtos/cal-booking.model';

@Injectable({
  providedIn: 'root',
})
export class CalService {
  private apiUrl = `${environment.apiUrl}/cal`;

  constructor(private http: HttpClient) {}

  /**
   * POST /api/cal/bookings
   * Create a new booking in cal.com.
   */
  createBooking(request: CreateCalBookingRequest): Observable<CalBookingData> {
    return this.http.post<CalBookingData>(`${this.apiUrl}/bookings`, request);
  }

  /**
   * GET /api/cal/bookings/{id}
   * Get a booking by its cal.com numeric ID.
   */
  getBookingById(id: number): Observable<CalBookingData> {
    return this.http.get<CalBookingData>(`${this.apiUrl}/bookings/${id}`);
  }

  /**
   * GET /api/cal/bookings/uid/{uid}
   * Get a booking by its cal.com UID.
   */
  getBookingByUid(uid: string): Observable<CalBookingData> {
    return this.http.get<CalBookingData>(`${this.apiUrl}/bookings/uid/${uid}`);
  }

  /**
   * POST /api/cal/bookings/{id}/cancel
   * Cancel a cal.com booking.
   */
  cancelBooking(id: number, reason?: string): Observable<CalBookingData> {
    const body: CancelBookingRequest = { reason };
    return this.http.post<CalBookingData>(`${this.apiUrl}/bookings/${id}/cancel`, body);
  }

  /**
   * GET /api/cal/slots/available
   * Get available time slots from cal.com.
   */
  getAvailableSlots(request: CalAvailabilityRequest): Observable<CalAvailabilityData> {
    let params = new HttpParams()
      .set('eventTypeId', request.eventTypeId.toString())
      .set('startDate', request.startDate)
      .set('endDate', request.endDate);

    if (request.timeZone) {
      params = params.set('timeZone', request.timeZone);
    }

    return this.http.get<CalAvailabilityData>(`${this.apiUrl}/slots/available`, { params });
  }

  /**
   * GET /api/cal/slots/datetimes?eventTypeId=123&timeZone=Africa/Johannesburg
   * Returns a flattened sorted list of available ISO datetime strings for an event type.
   */
  getAllAvailableDateTimes(eventTypeId: number, timeZone?: string): Observable<string[]> {
    let params = new HttpParams().set('eventTypeId', eventTypeId.toString());
    if (timeZone) {
      params = params.set('timeZone', timeZone);
    }
    return this.http.get<string[]>(`${this.apiUrl}/slots/datetimes`, { params });
  }

  /**
   * POST /api/cal/webhook
   * Receive webhook events from cal.com.
   */
  handleWebhook(triggerEvent: string, body: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/webhook`, { triggerEvent, payload: body });
  }
}