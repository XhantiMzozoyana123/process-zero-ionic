import { Component, OnInit } from '@angular/core';
import { CreditService } from 'src/app/services/credit.service';
import { CreditTransactionDto } from 'src/app/models/dtos/credit-transaction-dto.model';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
  standalone: false
})
export class TransactionsPage implements OnInit {
  transactions: CreditTransactionDto[] = [];
  loading = false;
  error: string | null = null;
  currentPage = 1;
  pageSize = 50;

  constructor(private creditService: CreditService) {}

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.loading = true;
    this.error = null;
    this.creditService.getTransactionHistory(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        this.transactions = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load transaction history.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  getTransactionIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'purchase':
        return 'arrow-down-circle-outline';
      case 'consumption':
        return 'arrow-up-circle-outline';
      case 'refund':
        return 'return-down-back-outline';
      case 'adjustment':
        return 'create-outline';
      case 'bonus':
        return 'gift-outline';
      case 'subscription':
        return 'repeat-outline';
      default:
        return 'cash-outline';
    }
  }

  getTransactionColor(type: string): string {
    switch (type.toLowerCase()) {
      case 'purchase':
        return 'success';
      case 'consumption':
        return 'danger';
      case 'refund':
      case 'bonus':
        return 'tertiary';
      default:
        return 'medium';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  formatAmount(amount: number): string {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}${amount.toFixed(2)}`;
  }
}