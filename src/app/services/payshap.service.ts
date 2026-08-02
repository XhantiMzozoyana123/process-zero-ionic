import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CreatePayShapOrderRequest, CreatePayShapOrderResponse, SubmitPaymentProofRequest, SubmitPaymentProofResponse } from '../models/dtos/pay-shap-dtos.model';

@Injectable({
  providedIn: 'root'
})
export class PayShapService {
  private apiUrl = `${environment.apiUrl}/credit`;

  constructor(private http: HttpClient) {}

  /**
   * Create a PayShap order for manual bank transfer
   */
  createPayShapOrder(packageId: number, email?: string, phone?: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`
    });

    const request: CreatePayShapOrderRequest = {
      packageId,
      email: email || undefined,
      phone: phone || undefined
    };

    return this.http.post<CreatePayShapOrderResponse>(
      `${this.apiUrl}/payshap/create-order`,
      request,
      { headers }
    );
  }

  /**
   * Submit payment proof (screenshot) after completing the bank transfer
   */
  submitPaymentProof(orderId: string, screenshotBase64: string, bankTransactionReference?: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`
    });

    const request: SubmitPaymentProofRequest = {
      orderId,
      paymentProofScreenshot: screenshotBase64,
      bankTransactionReference: bankTransactionReference
    };

    return this.http.post<SubmitPaymentProofResponse>(
      `${this.apiUrl}/payshap/submit-proof`,
      request,
      { headers }
    );
  }
}