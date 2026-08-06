import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
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

    const returnUrl = `${window.location.origin}/account/credits/wallet?paypal=success`;
    const cancelUrl = `${window.location.origin}/account/credits/packages?paypal=cancelled`;

    return this.http.post<{ orderId: string; approvalUrl: string; packageId: number }>(
      `${this.apiUrl}/paypal/create`,
      { packageId, returnUrl, cancelUrl },
      { headers }
    );
  }

  capturePayPalOrder(orderId: string, packageId: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`
    });

    return this.http.post<{ capture: any; credits: CreditPurchaseResponseDto }>(
      `${this.apiUrl}/paypal/capture`,
      { orderId, packageId },
      { headers }
    );
  }
}