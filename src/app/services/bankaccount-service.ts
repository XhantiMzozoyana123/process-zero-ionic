// src/app/services/bank-account.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BankAccount } from '../models/entities/bank-account.model';
import { environment } from 'src/environments/environment.prod';

export interface CreateBankAccountResponse {
  Id?: number;
  id?: number;
}

@Injectable({
  providedIn: 'root'
})
export class BankAccountService {
  private apiUrl = `${environment.apiUrl}/bankaccount`; // adjust to your API

  constructor(private http: HttpClient) {}

  getMyAccount(): Observable<BankAccount> {
    return this.http.get<BankAccount>(this.apiUrl);
  }

  create(account: BankAccount): Observable<CreateBankAccountResponse> {
    return this.http.post<CreateBankAccountResponse>(this.apiUrl, account);
  }

  update(account: BankAccount): Observable<void> {
    return this.http.put<void>(this.apiUrl, account);
  }
}