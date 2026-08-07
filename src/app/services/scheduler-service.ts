import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ScheduleSmsDto,
  ScheduleWhatsAppDto,
  ScheduleFacebookDto,
  ScheduleEmailDto,
  RescheduleMessageDto,
  PagedResult,
  PendingSmsItem,
  PendingWhatsAppItem,
  PendingFacebookItem,
  PendingEmailItem,
  ScheduleResult
} from '../models/dtos/scheduler-dtos.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SchedulerService {
  private apiUrl = `${environment.apiUrl}/scheduler`;

  constructor(private http: HttpClient) {}

  // Schedule
  scheduleSms(dto: ScheduleSmsDto): Observable<ScheduleResult> {
    return this.http.post<ScheduleResult>(`${this.apiUrl}/schedule-sms`, dto);
  }

  scheduleWhatsApp(dto: ScheduleWhatsAppDto): Observable<ScheduleResult> {
    return this.http.post<ScheduleResult>(`${this.apiUrl}/schedule-whatsapp`, dto);
  }

  scheduleFacebook(dto: ScheduleFacebookDto): Observable<ScheduleResult> {
    return this.http.post<ScheduleResult>(`${this.apiUrl}/schedule-facebook`, dto);
  }

  scheduleEmail(dto: ScheduleEmailDto): Observable<ScheduleResult> {
    return this.http.post<ScheduleResult>(`${this.apiUrl}/schedule-email`, dto);
  }

  // Reschedule
  rescheduleSms(id: number, newScheduledAt: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/reschedule-sms/${id}`, { newScheduledAt });
  }

  rescheduleWhatsApp(id: number, newScheduledAt: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/reschedule-whatsapp/${id}`, { newScheduledAt });
  }

  rescheduleFacebook(id: number, newScheduledAt: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/reschedule-facebook/${id}`, { newScheduledAt });
  }

  rescheduleEmail(id: number, newScheduledAt: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/reschedule-email/${id}`, { newScheduledAt });
  }

  // Cancel
  cancelScheduledSms(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/cancel-sms/${id}`);
  }

  cancelScheduledWhatsApp(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/cancel-whatsapp/${id}`);
  }

  cancelScheduledFacebook(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/cancel-facebook/${id}`);
  }

  cancelScheduledEmail(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/cancel-email/${id}`);
  }

  // Get pending
  getPendingSms(): Observable<PagedResult<PendingSmsItem>> {
    return this.http.get<PagedResult<PendingSmsItem>>(`${this.apiUrl}/pending-sms`);
  }

  getPendingWhatsApp(): Observable<PagedResult<PendingWhatsAppItem>> {
    return this.http.get<PagedResult<PendingWhatsAppItem>>(`${this.apiUrl}/pending-whatsapp`);
  }

  getPendingFacebook(): Observable<PagedResult<PendingFacebookItem>> {
    return this.http.get<PagedResult<PendingFacebookItem>>(`${this.apiUrl}/pending-facebook`);
  }

  getPendingEmails(): Observable<PagedResult<PendingEmailItem>> {
    return this.http.get<PagedResult<PendingEmailItem>>(`${this.apiUrl}/pending-emails`);
  }
}
