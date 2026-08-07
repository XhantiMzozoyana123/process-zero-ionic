import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface DataLakeExtract {
  [tableName: string]: any[];
}

@Injectable({
  providedIn: 'root'
})
export class DataLakeService {
  private apiUrl = `${environment.apiUrl}/datalake/extract`;

  constructor(private http: HttpClient) {}

  extractAll(): Observable<DataLakeExtract> {
    return this.http.get<DataLakeExtract>(this.apiUrl);
  }
}
