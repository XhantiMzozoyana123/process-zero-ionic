import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MeetingDto } from '../models/dtos/meeting-dto.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MeetingService {
  private apiUrl = `${environment.apiUrl}/meeting`; // Update with your API URL

  constructor(private http: HttpClient) {}

  // GET all meetings
  getAllMeetings(): Observable<MeetingDto[]> {
    return this.http.get<MeetingDto[]>(`${this.apiUrl}`);
  }

  // GET meetings for current user
  getUserMeetings(): Observable<MeetingDto[]> {
    return this.http.get<MeetingDto[]>(`${this.apiUrl}/user`);
  }

  // GET single meeting by id
  getMeetingById(id: number): Observable<MeetingDto> {
    return this.http.get<MeetingDto>(`${this.apiUrl}/${id}`);
  }

  // POST create a new meeting
  createMeeting(meetingDto: MeetingDto, notes?: string): Observable<void> {
    const params = notes ? new HttpParams().set('notes', notes) : undefined;
    return this.http.post<void>(`${this.apiUrl}`, meetingDto, { params });
  }

  // PUT update a meeting
  updateMeeting(id: number, meetingDto: MeetingDto, notes?: string): Observable<void> {
    const params = notes ? new HttpParams().set('notes', notes) : undefined;
    return this.http.put<void>(`${this.apiUrl}/${id}`, meetingDto, { params });
  }

  // DELETE a meeting
  deleteMeeting(id: number, notes?: string): Observable<void> {
    const params = notes ? new HttpParams().set('notes', notes) : undefined;
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { params });
  }
}