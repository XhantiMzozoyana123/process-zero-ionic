import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contact } from '../models/entities/contact.model';
import { LeadLake } from '../models/entities/leadlake.model';
import { environment } from 'src/environments/environment';

type LeadLakeCreatePayload = Omit<LeadLake, 'industry'> & {
  industry: LeadLake['industry'] | number;
};

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = `${environment.apiUrl}/contact`;

  constructor(private http: HttpClient) {}

  // GET all contacts
  getAll(): Observable<Contact[]> {
    return this.http.get<Contact[]>(this.apiUrl);
  }

  // GET my contacts
  getMine(): Observable<Contact[]> {
    return this.http.get<Contact[]>(`${this.apiUrl}/me`);
  }

  // GET by id
  getById(id: number): Observable<Contact> {
    return this.http.get<Contact>(`${this.apiUrl}/${id}`);
  }

  // CREATE single contact from a LeadLake payload
  create(lead: LeadLakeCreatePayload): Observable<LeadLake> {
    return this.http.post<LeadLake>(this.apiUrl, lead);
  }

  // CREATE multiple contacts from LeadLake payloads
  createBatch(leads: LeadLake[]): Observable<{ added: number }> {
    return this.http.post<{ added: number }>(`${this.apiUrl}/batch`, leads);
  }

  // UPDATE contact
  update(id: number, contact: Contact): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, contact);
  }

  // DELETE contact
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
