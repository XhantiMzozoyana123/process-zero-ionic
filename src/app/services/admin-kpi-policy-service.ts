import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { KpiPolicy } from '../models/entities/kpi-policy.model';

@Injectable({
  providedIn: 'root',
})
export class AdminKpiPolicyService {
  // Assuming the base URL for the API is configured globally or here, 
  // and it matches the KpiPolicyController's route prefix (/api/KpiPolicy).
  private apiUrl = 'api/KpiPolicy';

  constructor(private http: HttpClient) {}

  /**
   * Retrieves all KPI policies.
   */
  getAllPolicies(): Observable<KpiPolicy[]> {
    return this.http.get<KpiPolicy[]>(this.apiUrl).pipe(
      tap((policies) => console.log('Successfully fetched all Kpi Policies.')),
      catchError(error => {
        console.error('Error fetching policies:', error);
        return throwError(() => new Error('Failed to retrieve KPI policies.'));
      })
    );
  }

  /**
   * Retrieves a single KPI policy by ID.
   * @param id The ID of the policy.
   */
  getPolicyById(id: number): Observable<KpiPolicy> {
    return this.http.get<KpiPolicy>(`${this.apiUrl}/${id}`).pipe(
      tap((policy) => console.log(`Successfully fetched policy ${id}.`)),
      catchError(error => {
        // Handle 404 Not Found specifically if the backend returns it via HttpClient status error
        if (error.status === 404) {
          throw new Error('Policy not found.');
        }
        console.error(`Error fetching policy ${id}:`, error);
        return throwError(() => new Error('Failed to retrieve KPI policy details.'));
      })
    );
  }

  /**
   * Creates a new KPI policy.
   * @param policy The KpiPolicy object to create.
   */
  createPolicy(policy: KpiPolicy): Observable<KpiPolicy> {
    // NOTE: Assuming the backend assigns the ID on creation, we send the payload directly.
    return this.http.post<KpiPolicy>(this.apiUrl, policy).pipe(
      tap((createdPolicy) => console.log(`Successfully created policy with ID ${createdPolicy.id}.`))
    );
  }

  /**
   * Updates an existing KPI policy by ID.
   * @param id The ID of the policy to update.
   * @param updatedPolicy The KpiPolicy object containing updated data.
   */
  updatePolicy(id: number, updatedPolicy: KpiPolicy): Observable<void> {
    // NOTE: Ensure the client passes both ID and the full body for PUT request semantics.
    return this.http.put<void>(`${this.apiUrl}/${id}`, updatedPolicy).pipe(
      tap(() => console.log(`Successfully updated policy ${id}.`))
    );
  }

  /**
   * Deletes a KPI policy by ID.
   * @param id The ID of the policy to delete.
   */
  deletePolicy(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => console.log(`Successfully deleted policy ${id}.`))
    );
  }

  getAll(): Observable<KpiPolicy[]> {
    return this.getAllPolicies();
  }

  create(policy: KpiPolicy): Observable<KpiPolicy> {
    return this.createPolicy(policy);
  }

  update(id: number, policy: KpiPolicy): Observable<void> {
    return this.updatePolicy(id, policy);
  }

  delete(id: number): Observable<void> {
    return this.deletePolicy(id);
  }
}