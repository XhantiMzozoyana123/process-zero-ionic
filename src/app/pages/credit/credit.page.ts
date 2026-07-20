import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { CreditService } from 'src/app/services/credit-service';
import { UserWalletDto } from 'src/app/models/dtos/credit-wallet-dto.model';
import { CreditPackageDto } from 'src/app/models/dtos/credit-package-dto.model';
import { CreditTransactionDto } from 'src/app/models/dtos/credit-transaction-dto.model';

@Component({
  selector: 'app-credit',
  templateUrl: './credit.page.html',
  styleUrls: ['./credit.page.scss'],
  standalone: false
})
export class CreditPage implements OnInit {
  wallet?: UserWalletDto;
  packages: CreditPackageDto[] = [];
  transactions: CreditTransactionDto[] = [];
  
  loadingWallet = false;
  loadingPackages = false;
  loadingTransactions = false;
  
  isPurchaseOpen = false;
  selectedPackage?: CreditPackageDto;
  purchaseLoading = false;

  constructor(
    private creditService: CreditService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadWallet();
    this.loadPackages();
    this.loadTransactions();
  }

  loadWallet(event?: any): void {
    this.loadingWallet = true;
    this.creditService.getWallet().subscribe({
      next: (wallet) => {
        this.wallet = wallet;
        this.loadingWallet = false;
        if (event) event.target.complete();
      },
      error: () => {
        this.loadingWallet = false;
        if (event) event.target.complete();
        this.showToast('Could not load wallet.', 'danger');
      }
    });
  }

  loadPackages(event?: any): void {
    this.loadingPackages = true;
    this.creditService.getAvailablePackages().subscribe({
      next: (packages) => {
        this.packages = packages;
        this.loadingPackages = false;
        if (event) event.target.complete();
      },
      error: () => {
        this.loadingPackages = false;
        if (event) event.target.complete();
        this.showToast('Could not load packages.', 'danger');
      }
    });
  }

  loadTransactions(event?: any): void {
    this.loadingTransactions = true;
    this.creditService.getTransactionHistory().subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.loadingTransactions = false;
        if (event) event.target.complete();
      },
      error: () => {
        this.loadingTransactions = false;
        if (event) event.target.complete();
        this.showToast('Could not load transactions.', 'danger');
      }
    });
  }

  openPurchaseModal(pkg: CreditPackageDto): void {
    this.selectedPackage = pkg;
    this.isPurchaseOpen = true;
  }

  closePurchaseModal(): void {
    this.isPurchaseOpen = false;
    this.selectedPackage = undefined;
  }

  async purchaseCredits(): Promise<void> {
    if (!this.selectedPackage) return;

    this.purchaseLoading = true;
    this.creditService.purchaseCredits({
      creditPackageId: this.selectedPackage.id,
      paymentMethod: 'card'
    }).subscribe({
      next: (result) => {
        this.purchaseLoading = false;
        this.closePurchaseModal();
        if (this.wallet) {
          this.wallet.creditBalance = result.newBalance;
        }
        this.loadTransactions();
        this.showToast(`Successfully purchased ${this.selectedPackage?.creditAmount} credits!`, 'success');
      },
      error: () => {
        this.purchaseLoading = false;
        this.closePurchaseModal();
        this.showToast('Could not purchase credits.', 'danger');
      }
    });
  }

  formatCurrency(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(value);
  }

  getTransactionIcon(type: string): string {
    const icons: Record<string, string> = {
      'Purchase': 'add-circle',
      'Consumption': 'remove-circle',
      'Refund': 'cash',
      'Adjustment': 'create',
      'Bonus': 'gift',
      'Subscription': 'repeat'
    };
    return icons[type] || 'cash';
  }

  getTransactionColor(type: string): string {
    const colors: Record<string, string> = {
      'Purchase': 'success',
      'Consumption': 'danger',
      'Refund': 'tertiary',
      'Adjustment': 'warning',
      'Bonus': 'success',
      'Subscription': 'primary'
    };
    return colors[type] || 'medium';
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 2500,
      position: 'bottom'
    });
    await toast.present();
  }
}