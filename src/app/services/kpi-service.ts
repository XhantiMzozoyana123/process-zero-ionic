import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { KPI } from '../models/entities/kpi.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/** Count of activity records to add, e.g. { count: 5 }. */
interface CountDto {
  count: number;
}

/** Deal amount closed, e.g. { amount: 15000.50 }. */
interface AmountDto {
  amount: number;
}

/**
 * Maps 1:1 to the backend KpiController ([Route("api/[controller]")]).
 *
 * A KPI is a daily snapshot of a sales rep's performance for a product. The
 * activity endpoints are additive (they add `count` to the running daily total).
 * MeetingsBooked has no endpoint — it is incremented automatically by the backend
 * MeetingService when a meeting is created. MRR is recalculated automatically from
 * active client contacts + closed invoices on every update.
 */
@Injectable({
  providedIn: 'root'
})
export class KpiService {

  private baseUrl = `${environment.apiUrl}/kpi`;

  constructor(private http: HttpClient) { }

  /** Coerce to a positive whole number (backend requires Range(1, int.MaxValue)). */
  private normalizeCount(count: number): number {
    const num = Number(count);
    if (!Number.isFinite(num)) {
      return 1;
    }
    return Math.max(1, Math.trunc(num));
  }

  /** Coerce to a non-negative amount (backend requires Range(0, double.MaxValue)). */
  private normalizeAmount(amount: number): number {
    const num = Number(amount);
    if (!Number.isFinite(num)) {
      return 0;
    }
    return Math.max(0, num);
  }

  // ── Daily activity updates ─────────────────────────────────

  /** POST api/kpi/product/{productId}/call-outreach */
  addCallOutreach(productId: number, count = 1): Observable<void> {
    const payload: CountDto = { count: this.normalizeCount(count) };
    return this.http.post<void>(`${this.baseUrl}/product/${productId}/call-outreach`, payload);
  }

  /** POST api/kpi/product/{productId}/email-outreach */
  addEmailOutreach(productId: number, count = 1): Observable<void> {
    const payload: CountDto = { count: this.normalizeCount(count) };
    return this.http.post<void>(`${this.baseUrl}/product/${productId}/email-outreach`, payload);
  }

  /** POST api/kpi/product/{productId}/calls-made */
  addCallsMade(productId: number, count = 1): Observable<void> {
    const payload: CountDto = { count: this.normalizeCount(count) };
    return this.http.post<void>(`${this.baseUrl}/product/${productId}/calls-made`, payload);
  }

  /** POST api/kpi/product/{productId}/deal-closed */
  addDealClosed(productId: number, amount: number): Observable<void> {
    const payload: AmountDto = { amount: this.normalizeAmount(amount) };
    return this.http.post<void>(`${this.baseUrl}/product/${productId}/deal-closed`, payload);
  }

  /** POST api/kpi/product/{productId}/recalculate-mrr */
  recalculateMrr(productId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/product/${productId}/recalculate-mrr`, {});
  }

  // ── Reads ──────────────────────────────────────────────────

  /** GET api/kpi/product/{productId}/latest */
  getLatestKpi(productId: number): Observable<KPI> {
    return this.http.get<KPI>(`${this.baseUrl}/product/${productId}/latest`);
  }

  // ── Admin ───────────────────────────────────────────────────

  /** GET api/kpi/admin/partner/{userId}/product/{productId}/latest */
  getLatestKpiForUser(userId: string, productId: number): Observable<KPI> {
    return this.http.get<KPI>(`${this.baseUrl}/admin/partner/${userId}/product/${productId}/latest`);
  }
}
