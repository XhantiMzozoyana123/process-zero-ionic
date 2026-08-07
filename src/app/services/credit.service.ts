import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserWalletDto } from '../models/dtos/user-wallet-dto.model';
import { CreditTransactionDto } from '../models/dtos/credit-transaction-dto.model';
import { CreditPackageDto } from '../models/dtos/credit-package-dto.model';
import { PurchaseCreditsRequestDto } from '../models/dtos/purchase-credits-request-dto.model';
import { ConsumeCreditsRequestDto } from '../models/dtos/consume-credits-request-dto.model';
import { CreditPurchaseResponseDto } from '../models/dtos/credit-purchase-response-dto.model';
import { CreditConsumeResponseDto } from '../models/dtos/credit-consume-response-dto.model';
import { CreditBalanceResponseDto } from '../models/dtos/credit-balance-response-dto.model';
import { CreateCreditPackageDto } from '../models/dtos/create-credit-package-dto.model';

/**
 * Custom header added to session-related credit requests so the AuthInterceptor
 * knows not to clear the session or redirect to login on 401 errors.
 * These are called from the timer/consumption system and should
 * never kick the user out.
 */
const SKIP_AUTH_REDIRECT_HEADER = new HttpHeaders({
  'X-Skip-Auth-Redirect': 'true'
});

@Injectable({
  providedIn: 'root'
})
export class CreditService {
  private apiUrl = `${environment.apiUrl}/credit`;

  constructor(private http: HttpClient) {}

  getWallet(): Observable<UserWalletDto> {
    return this.http.get<UserWalletDto>(`${this.apiUrl}/wallet`);
  }

  getAvailablePackages(): Observable<CreditPackageDto[]> {
    return this.http.get<CreditPackageDto[]>(`${this.apiUrl}/packages`);
  }

  getAllPackages(): Observable<CreditPackageDto[]> {
    return this.http.get<CreditPackageDto[]>(`${this.apiUrl}/packages/all`);
  }

  createPackage(packageDto: CreateCreditPackageDto): Observable<CreditPackageDto> {
    return this.http.post<CreditPackageDto>(`${this.apiUrl}/packages`, packageDto);
  }

  purchaseCredits(request: PurchaseCreditsRequestDto): Observable<CreditPurchaseResponseDto> {
    return this.http.post<CreditPurchaseResponseDto>(`${this.apiUrl}/purchase`, request);
  }

  consumeCredits(request: ConsumeCreditsRequestDto): Observable<CreditConsumeResponseDto> {
    return this.http.post<CreditConsumeResponseDto>(`${this.apiUrl}/consume`, request);
  }

  checkCreditBalance(requiredCredits: number): Observable<CreditBalanceResponseDto> {
    return this.http.post<CreditBalanceResponseDto>(`${this.apiUrl}/check`, requiredCredits);
  }

  getTransactionHistory(page: number = 1, pageSize: number = 50): Observable<CreditTransactionDto[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<CreditTransactionDto[]>(`${this.apiUrl}/transactions`, { params });
  }

  getTransactionById(id: number): Observable<CreditTransactionDto> {
    return this.http.get<CreditTransactionDto>(`${this.apiUrl}/transactions/${id}`);
  }

  adjustCredits(userId: string, creditAmount: number): Observable<CreditConsumeResponseDto> {
    const params = new HttpParams().set('userId', userId);
    return this.http.post<CreditConsumeResponseDto>(`${this.apiUrl}/adjust`, creditAmount, { params });
  }

  initializeWallet(): Observable<UserWalletDto> {
    return this.http.post<UserWalletDto>(`${this.apiUrl}/initialize`, {});
  }

  /**
   * Fetches remaining usage hours for the current user.
   * Uses skip-redirect header to prevent session-clearing on 401.
   */
  getRemainingHours(): Observable<{ remainingHours: number }> {
    return this.http.get<{ remainingHours: number }>(`${this.apiUrl}/remaining-hours`, {
      headers: SKIP_AUTH_REDIRECT_HEADER
    });
  }

  consumeActiveUsage(minutes: number = 10): Observable<CreditConsumeResponseDto> {
    const params = new HttpParams().set('minutes', minutes.toString());
    return this.http.post<CreditConsumeResponseDto>(`${this.apiUrl}/consume-active-usage`, {}, {
      params,
      headers: SKIP_AUTH_REDIRECT_HEADER
    });
  }
}
