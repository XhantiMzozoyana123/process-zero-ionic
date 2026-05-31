import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Webinar } from '../models/entities/webinar.model';

@Injectable({
  providedIn: 'root',
})
export class WebinarService {
  private apiUrl = `${environment.apiUrl}/webinar`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Webinar[]> {
    return this.http.get<Webinar[]>(this.apiUrl);
  }

  getById(id: number): Observable<Webinar> {
    return this.http.get<Webinar>(`${this.apiUrl}/${id}`);
  }

  create(webinar: Webinar): Observable<Webinar | void> {
    return this.http.post<Webinar | void>(this.apiUrl, webinar);
  }

  update(id: number, webinar: Webinar): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, webinar);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
