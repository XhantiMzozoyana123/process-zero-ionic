import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PayGateService {
  private apiUrl = `${environment.apiUrl}/credit`;

  constructor(private http: HttpClient) {}

  /**
   * Create a PayGate order and get the payment URL to redirect the customer to.
   */
  createPayGateOrder(packageId: number, email?: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`
    });

    return this.http.post<{
      paymentUrl: string;
      orderId: string;
      packageId: number;
      addressIn: string;
    }>(
      `${this.apiUrl}/paygate/create-order`,
      { packageId, email: email || 'customer@processzero.xyz' },
      { headers }
    );
  }
}
