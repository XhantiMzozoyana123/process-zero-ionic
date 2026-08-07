import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Inbox } from '../models/entities/inbox.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminInboxService {
  private apiUrl = `${environment.apiUrl}/inbox`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Inbox[]> {
    return this.http.get<Inbox[]>(this.apiUrl);
  }

  getMyInboxes(): Observable<Inbox[]> {
    return this.http.get<Inbox[]>(`${this.apiUrl}/me`);
  }

  getById(id: number): Observable<Inbox> {
    return this.http.get<Inbox>(`${this.apiUrl}/${id}`);
  }

  create(inbox: Inbox): Observable<Inbox> {
    return this.http.post<Inbox>(this.apiUrl, inbox);
  }

  update(id: number, inbox: Inbox): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, inbox);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
