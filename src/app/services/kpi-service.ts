import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { KPI } from '../models/entities/kpi.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

interface AttemptsDto {
  attempts: number;
}

interface AttendanceDto {
  attended: number;
}

interface DealsDto {
  deals: number;
}

interface RevenueDto {
  revenue: number;
}

interface CloseRateDto {
  dealsClosed: number;
  dealsAttempted: number;
}

interface DoubleDto {
  value: number;
}

interface InitiativesDto {
  initiatives: number;
}

@Injectable({
  providedIn: 'root'
})
export class KpiService {

  private baseUrl = `${environment.apiUrl}/kpi`

  constructor(private http: HttpClient) { }

  private asAttendanceCount(value: boolean | number): number {
    if (typeof value === 'boolean') {
      return value ? 1 : 0;
    }

    if (!Number.isFinite(value)) {
      return 0;
    }

    return Math.max(0, Math.trunc(value));
  }

  updateOutreach(productId: number, attempts: number): Observable<void> {
    const payload: AttemptsDto = { attempts };
    return this.http.post<void>(`${this.baseUrl}/partner/product/${productId}/outreach`, payload);
  }

  incrementCallsBooked(productId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/partner/product/${productId}/calls/booked`, {});
  }

  confirmCallAttendance(productId: number, attended: number): Observable<void> {
    const payload: AttendanceDto = { attended: this.asAttendanceCount(attended) };
    return this.http.post<void>(`${this.baseUrl}/partner/product/${productId}/calls/attendance`, payload);
  }

  incrementDealsInfluenced(productId: number, deals: number): Observable<void> {
    const payload: DealsDto = { deals };
    return this.http.post<void>(`${this.baseUrl}/partner/product/${productId}/deals/influenced`, payload);
  }

  addRevenueGenerated(productId: number, revenue: number): Observable<void> {
    const payload: RevenueDto = { revenue };
    return this.http.post<void>(`${this.baseUrl}/partner/product/${productId}/revenue`, payload);
  }

  updateCloseRate(productId: number, dealsClosed: number, dealsAttempted: number): Observable<void> {
    const payload: CloseRateDto = { dealsClosed, dealsAttempted };
    return this.http.post<void>(`${this.baseUrl}/partner/product/${productId}/close-rate`, payload);
  }

  updateAverageDealSize(productId: number, revenue: number): Observable<void> {
    const payload: RevenueDto = { revenue };
    return this.http.post<void>(`${this.baseUrl}/partner/product/${productId}/average-deal`, payload);
  }

  updateRevenueInfluenced(productId: number, revenue: number): Observable<void> {
    const payload: RevenueDto = { revenue };
    return this.http.post<void>(`${this.baseUrl}/partner/product/${productId}/revenue-influenced`, payload);
  }

  updateBasicClientRetention(productId: number, value: number): Observable<void> {
    const payload: DoubleDto = { value };
    return this.http.post<void>(`${this.baseUrl}/partner/product/${productId}/client-retention`, payload);
  }

  updateActivityConsistency(productId: number, attended: boolean | number): Observable<void> {
    const payload: AttendanceDto = { attended: this.asAttendanceCount(attended) };
    return this.http.post<void>(`${this.baseUrl}/partner/product/${productId}/activity-consistency`, payload);
  }

  updateActiveTeamSize(productId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/partner/product/${productId}/team/active-size`, {});
  }

  updateTeamRevenue(productId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/partner/product/${productId}/team/revenue`, {});
  }

  updateTeamCloseRate(productId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/partner/product/${productId}/team/close-rate`, {});
  }

  updateTeamChurnRate(productId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/partner/product/${productId}/team/churn-rate`, {});
  }

  updateLeaderActivityLevel(productId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/partner/product/${productId}/leader/activity-level`, {});
  }

  updateMonthlyRecurringRevenue(productId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/partner/product/${productId}/mrr`, {});
  }

  updateGrowthRate(productId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/partner/product/${productId}/growth-rate`, {});
  }

  updateTeamPerformanceHealth(productId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/partner/product/${productId}/team-performance-health`, {});
  }

  updateBrandCompliance(productId: number, value: number): Observable<void> {
    const payload: DoubleDto = { value };
    return this.http.post<void>(`${this.baseUrl}/partner/product/${productId}/brand-compliance`, payload);
  }

  updateClientRetentionExternal(productId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/partner/product/${productId}/client-retention/external`, {});
  }

  updateLongTermRevenueGrowth(productId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/partner/product/${productId}/long-term-growth`, {});
  }

  updateStrategicInitiativesDelivered(productId: number, initiatives: number): Observable<void> {
    const payload: InitiativesDto = { initiatives };
    return this.http.post<void>(`${this.baseUrl}/partner/product/${productId}/strategic-initiatives`, payload);
  }

  updateBrandRiskManagement(productId: number, value: number): Observable<void> {
    const payload: DoubleDto = { value };
    return this.http.post<void>(`${this.baseUrl}/partner/product/${productId}/brand-risk`, payload);
  }

  updateInnovationContribution(productId: number, value: number): Observable<void> {
    const payload: DoubleDto = { value };
    return this.http.post<void>(`${this.baseUrl}/partner/product/${productId}/innovation`, payload);
  }

  updateLeadershipStability(productId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/partner/product/${productId}/leadership-stability`, {});
  }

  // ---------- General ----------
  getLatestKpi(productId: number): Observable<KPI> {
    return this.http.get<KPI>(`${this.baseUrl}/partner/product/${productId}/latest`);
  }

  // ---------- Admin ----------
  getLatestKpiForUser(userId: string, productId: number): Observable<KPI> {
    return this.http.get<KPI>(`${this.baseUrl}/admin/partner/${userId}/product/${productId}/latest`);
  }
}
