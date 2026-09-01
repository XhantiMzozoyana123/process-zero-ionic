import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AgencyManagerDto {
  userId: string;
  userName?: string;
  email?: string;
}

export interface AgencyDto {
  id: number;
  name: string;
  description?: string;
  linkedUserId: string;
  linkedUserName?: string;
  isActive: boolean;
  managers: AgencyManagerDto[];
}

export interface CreateAgencyDto {
  name: string;
  description?: string;
  email?: string;
  password: string;
  managerUserIds: string[];
}

export interface UpdateAgencyDto {
  name: string;
  description?: string;
  isActive: boolean;
  managerUserIds: string[];
}

export interface AgencyAccess {
  canView: boolean;
  canWrite: boolean;
}

export interface AgencyContact {
  id?: number;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  position?: string;
  notes?: string;
  isCompany?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AgencyDeal {
  id?: number;
  contactId: number;
  contactName?: string;
  title: string;
  amount: number;
  stage: string;
  probability?: number;
  expectedCloseDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AgencyActivity {
  id?: number;
  type: string;
  subject: string;
  description?: string;
  contactId?: number;
  contactName?: string;
  dealId?: number;
  dealTitle?: string;
  dueDate?: string;
  isCompleted?: boolean;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class AgencyService {
  private apiUrl = `${environment.apiUrl}/agency`;

  constructor(private http: HttpClient) {}

  // ── Profile management (Admin) ─────────────────────
  getAll(): Observable<AgencyDto[]> {
    return this.http.get<AgencyDto[]>(this.apiUrl);
  }

  getById(id: number): Observable<AgencyDto> {
    return this.http.get<AgencyDto>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateAgencyDto): Observable<AgencyDto> {
    return this.http.post<AgencyDto>(this.apiUrl, dto);
  }

  update(id: number, dto: UpdateAgencyDto): Observable<AgencyDto> {
    return this.http.put<AgencyDto>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  resetPassword(id: number, password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/reset-password`, { password });
  }

  // ── Access ─────────────────────────────────────────
  myAgencies(): Observable<AgencyDto[]> {
    return this.http.get<AgencyDto[]>(`${this.apiUrl}/my`);
  }

  getAccess(id: number): Observable<AgencyAccess> {
    return this.http.get<AgencyAccess>(`${this.apiUrl}/${id}/access`);
  }

  // ── CRM: Contacts ──────────────────────────────────
  getContacts(agencyId: number): Observable<AgencyContact[]> {
    return this.http.get<AgencyContact[]>(`${this.apiUrl}/${agencyId}/contacts`);
  }

  createContact(agencyId: number, contact: AgencyContact): Observable<AgencyContact> {
    return this.http.post<AgencyContact>(`${this.apiUrl}/${agencyId}/contacts`, contact);
  }

  updateContact(agencyId: number, contactId: number, contact: AgencyContact): Observable<AgencyContact> {
    return this.http.put<AgencyContact>(`${this.apiUrl}/${agencyId}/contacts/${contactId}`, contact);
  }

  deleteContact(agencyId: number, contactId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${agencyId}/contacts/${contactId}`);
  }

  // ── CRM: Deals ─────────────────────────────────────
  getDeals(agencyId: number): Observable<AgencyDeal[]> {
    return this.http.get<AgencyDeal[]>(`${this.apiUrl}/${agencyId}/deals`);
  }

  createDeal(agencyId: number, deal: AgencyDeal): Observable<AgencyDeal> {
    return this.http.post<AgencyDeal>(`${this.apiUrl}/${agencyId}/deals`, deal);
  }

  updateDeal(agencyId: number, dealId: number, deal: AgencyDeal): Observable<AgencyDeal> {
    return this.http.put<AgencyDeal>(`${this.apiUrl}/${agencyId}/deals/${dealId}`, deal);
  }

  deleteDeal(agencyId: number, dealId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${agencyId}/deals/${dealId}`);
  }

  // ── CRM: Activities ────────────────────────────────
  getActivities(agencyId: number): Observable<AgencyActivity[]> {
    return this.http.get<AgencyActivity[]>(`${this.apiUrl}/${agencyId}/activities`);
  }

  createActivity(agencyId: number, activity: AgencyActivity): Observable<AgencyActivity> {
    return this.http.post<AgencyActivity>(`${this.apiUrl}/${agencyId}/activities`, activity);
  }

  updateActivity(agencyId: number, activityId: number, activity: AgencyActivity): Observable<AgencyActivity> {
    return this.http.put<AgencyActivity>(`${this.apiUrl}/${agencyId}/activities/${activityId}`, activity);
  }

  deleteActivity(agencyId: number, activityId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${agencyId}/activities/${activityId}`);
  }
}