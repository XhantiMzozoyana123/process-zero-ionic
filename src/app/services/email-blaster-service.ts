import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmailDto } from '../models/dtos/email-dto.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailBlasterService {
  private apiUrl = `${environment.apiUrl}/emailblaster`;

  constructor(private http: HttpClient) {}

  sendBulkToUsers(emails: EmailDto[]): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/send-users`, emails);
  }
}
