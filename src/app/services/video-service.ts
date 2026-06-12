import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Video } from '../models/entities/video.model';

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  // NOTE: API endpoint intentionally remains `/webinar` to match the backend contract.
  private apiUrl = `${environment.apiUrl}/webinar`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Video[]> {
    return this.http.get<Video[]>(this.apiUrl);
  }

  getById(id: number): Observable<Video> {
    return this.http.get<Video>(`${this.apiUrl}/${id}`);
  }

  create(video: Video): Observable<Video | void> {
    return this.http.post<Video | void>(this.apiUrl, video);
  }

  update(id: number, video: Video): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, video);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}