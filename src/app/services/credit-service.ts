import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserWalletDto } from '../models/dtos/credit-wallet-dto.model';
import { CreditPackageDto, CreateCreditPackageDto } from '../models/dtos/credit-package-dto.model';
import { CreditTransactionDto } from '../models/dtos/credit-transaction-dto.model';
import { PurchaseCreditsRequestDto, CreditPurchaseResponseDto } from '../models/dtos/credit-purchase-dto.model';
import { ConsumeCreditsRequestDto, CreditConsumeResponseDto, CreditBalanceResponseDto } from '../models/dtos/credit-consume-dto.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CreditService {
  private apiUrl = `${environment.apiUrl}/credit`;

  constructor(private http: HttpClient) {}

  /**
   * GET: api/credit/wallet
   * Returns the current user's wallet information including credit balance.
   */
  getWallet(): Observable<UserWalletDto> {
    return this.http.get<UserWalletDto>(`${this.apiUrl}/wallet`);
  }

  /**
   * GET: api/credit/packages
   * Returns all available credit packages for purchase (anonymous access).
   */
  getAvailablePackages(): Observable<CreditPackageDto[]> {
    return this.http.get<CreditPackageDto[]>(`${this.apiUrl}/packages`);
  }

  /**
   * GET: api/credit/packages/all
   * Returns all credit packages including inactive - Admin only.
   */
  getAllPackages(): Observable<CreditPackageDto[]> {
    return this.http.get<CreditPackageDto[]>(`${this.apiUrl}/packages/all`);
  }

  /**
   * POST: api/credit/packages
   * Creates a new credit package - Admin only.
   */
  createPackage(model: CreateCreditPackageDto): Observable<CreditPackageDto> {
    return this.http.post<CreditPackageDto>(`${this.apiUrl}/packages`, model);
  }

  /**
   * POST: api/credit/purchase
   * Purchases credits for the current user by selecting a credit package.
   */
  purchaseCredits(request: PurchaseCreditsRequestDto): Observable<CreditPurchaseResponseDto> {
    return this.http.post<CreditPurchaseResponseDto>(`${this.apiUrl}/purchase`, request);
  }

  /**
   * POST: api/credit/consume
   * Consumes credits from the current user's wallet for platform access.
   */
  consumeCredits(request: ConsumeCreditsRequestDto): Observable<CreditConsumeResponseDto> {
    return this.http.post<CreditConsumeResponseDto>(`${this.apiUrl}/consume`, request);
  }

  /**
   * POST: api/credit/check
   * Checks if user has sufficient credits for an operation.
   */
  checkCreditBalance(requiredCredits: number): Observable<CreditBalanceResponseDto> {
    return this.http.post<CreditBalanceResponseDto>(`${this.apiUrl}/check`, requiredCredits);
  }

  /**
   * GET: api/credit/transactions
   * Returns the transaction history for the current user.
   */
  getTransactionHistory(page: number = 1, pageSize: number = 50): Observable<CreditTransactionDto[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<CreditTransactionDto[]>(`${this.apiUrl}/transactions`, { params });
  }

  /**
   * GET: api/credit/transactions/{id}
   * Returns a specific transaction by ID.
   */
  getTransactionById(id: number): Observable<CreditTransactionDto> {
    return this.http.get<CreditTransactionDto>(`${this.apiUrl}/transactions/${id}`);
  }

  /**
   * POST: api/credit/adjust?userId={userId}
   * Adjusts credits for a user - Admin only.
   */
  adjustCredits(userId: string, creditAmount: number): Observable<CreditConsumeResponseDto> {
    return this.http.post<CreditConsumeResponseDto>(
      `${this.apiUrl}/adjust?userId=${userId}`,
      creditAmount
    );
  }

  /**
   * POST: api/credit/initialize
   * Initializes a wallet for the current user if it doesn't exist.
   */
  initializeWallet(): Observable<UserWalletDto> {
    return this.http.post<UserWalletDto>(`${this.apiUrl}/initialize`, {});
  }
}