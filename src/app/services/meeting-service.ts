import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MeetingDto } from '../models/dtos/meeting-dto.model';
import { environment } from 'src/environments/environment.prod';

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class MeetingService {
  private apiUrl = `${environment.apiUrl}/meeting`;

  constructor(private http: HttpClient) {}

  getAllMeetings(page: number = 1, pageSize: number = 50): Observable<PagedResult<MeetingDto>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<PagedResult<MeetingDto>>(this.apiUrl, { params });
  }

  getUserMeetings(): Observable<MeetingDto[]> {
    return this.http.get<MeetingDto[]>(`${this.apiUrl}/user`);
  }

  getMeetingById(id: number): Observable<MeetingDto> {
    return this.http.get<MeetingDto>(`${this.apiUrl}/${id}`);
  }

  createMeeting(meetingDto: MeetingDto, notes?: string): Observable<void> {
    const params = notes ? new HttpParams().set('notes', notes) : undefined;
    return this.http.post<void>(this.apiUrl, meetingDto, { params });
  }

  updateMeeting(id: number, meetingDto: MeetingDto, notes?: string): Observable<void> {
    const params = notes ? new HttpParams().set('notes', notes) : undefined;
    return this.http.put<void>(`${this.apiUrl}/${id}`, meetingDto, { params });
  }

  deleteMeeting(id: number, notes?: string): Observable<void> {
    const params = notes ? new HttpParams().set('notes', notes) : undefined;
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { params });
  }
}