import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CreditPurchaseResponseDto } from '../models/dtos/credit-purchase-response-dto.model';

@Injectable({
  providedIn: 'root'
})
export class PayPalService {
  private apiUrl = `${environment.apiUrl}/credit`;

  constructor(private http: HttpClient) {}

  createPayPalOrder(packageId: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`
    });

    return this.http.post<{ orderId: string; packageId: number }>(
      `${this.apiUrl}/paypal/create`,
      { packageId },
      { headers }
    );
  }

  capturePayPalOrder(orderId: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`
    });

    return this.http.post<CreditPurchaseResponseDto>(
      `${this.apiUrl}/paypal/capture`,
      { orderId },
      { headers }
    );
  }
}