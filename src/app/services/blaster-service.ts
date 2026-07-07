import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmailDto } from '../models/dtos/email-dto.model';
import { TwilioFacebookDto } from '../models/dtos/twilio-facebook-dto.model';
import { TwilioSmsDto } from '../models/dtos/twilio-sms-dto.model';
import { TwilioWhatsAppDto } from '../models/dtos/twilio-whatsapp-dto.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminBlasterService {
  private apiUrl = `${environment.apiUrl}/blaster`;

  constructor(private http: HttpClient) {}

  sendBulkEmails(emails: EmailDto[]): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/send-bulk-emails`, emails);
  }

  sendBulkSms(messages: TwilioSmsDto[]): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/send-bulk-sms`, messages);
  }

  sendBulkWhatsApp(messages: TwilioWhatsAppDto[]): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/send-bulk-whatsapp`, messages);
  }

  sendBulkFacebook(messages: TwilioFacebookDto[]): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/send-bulk-facebook`, messages);
  }

  sendBulkToUsers(emails: EmailDto[]): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/send-users`, emails);
  }
}
