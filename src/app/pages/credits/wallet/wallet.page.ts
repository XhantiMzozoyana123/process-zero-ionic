import { Component, OnInit } from '@angular/core';
import { CreditService as CreditApiService } from 'src/app/services/credit.service';
import { PayPalService } from 'src/app/services/paypal.service';
import { UserWalletDto } from 'src/app/models/dtos/user-wallet-dto.model';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
  standalone: false
})
export class WalletPage implements OnInit {
  wallet: UserWalletDto | null = null;
  loading = false;
  error: string | null = null;
  purchaseSuccess: string | null = null;

  packages: any[] = [];
  selectedPackageId: number | null = null;
  showPurchaseModal = false;
  processingPayment = false;

  constructor(
    private creditService: CreditApiService,
    private payPalService: PayPalService
  ) {}

  ngOnInit() {
    this.loadWallet();
    this.loadPackages();
    this.checkPayPalReturn();
  }

  private checkPayPalReturn() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('paypal') === 'success') {
      const orderId = sessionStorage.getItem('paypal_order_id');
      const packageId = sessionStorage.getItem('paypal_package_id');

      if (orderId && packageId) {
        this.processingPayment = true;
        this.error = null;

        this.payPalService.capturePayPalOrder(orderId, parseInt(packageId)).subscribe({
          next: (response) => {
            this.purchaseSuccess = `Purchase successful! New balance: ${response.credits?.newBalance ?? 'updated'}`;
            this.loadWallet();
            this.processingPayment = false;
            sessionStorage.removeItem('paypal_order_id');
            sessionStorage.removeItem('paypal_package_id');
          },
          error: (err) => {
            this.error = 'Payment capture failed. Please check your PayPal transaction status.';
            this.processingPayment = false;
            console.error('PayPal capture error:', err);
            sessionStorage.removeItem('paypal_order_id');
            sessionStorage.removeItem('paypal_package_id');
          }
        });
      }
    }
  }

  loadWallet() {
    this.loading = true;
    this.error = null;
    this.creditService.getWallet().subscribe({
      next: (data) => {
        this.wallet = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load wallet.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadPackages() {
    console.log('Loading packages...');
    this.creditService.getAvailablePackages().subscribe({
      next: (data) => {
        console.log('Packages loaded:', data);
        this.packages = data;
      },
      error: (err) => {
        console.error('Failed to load packages', err);
        this.error = 'Failed to load credit packages.';
      }
    });
  }

  openPurchaseModal() {
    console.log('Opening purchase modal, packages:', this.packages.length);
    console.log('Wallet state:', this.wallet);
    
    if (!this.wallet) {
      console.warn('Wallet not loaded yet');
      this.error = 'Please wait for wallet to load.';
      return;
    }
    
    this.error = null;
    this.showPurchaseModal = true;
  }

  closePurchaseModal() {
    this.showPurchaseModal = false;
    this.selectedPackageId = null;
  }

  confirmPurchase() {
    if (!this.selectedPackageId) return;

    this.processingPayment = true;
    this.error = null;

    this.payPalService.createPayPalOrder(this.selectedPackageId).subscribe({
      next: (res) => {
        // Store order details before redirecting
        sessionStorage.setItem('paypal_order_id', res.orderId);
        sessionStorage.setItem('paypal_package_id', res.packageId.toString());
        // Redirect to PayPal approval
        window.location.href = res.approvalUrl;
      },
      error: (err) => {
        this.error = 'Failed to initiate PayPal payment. Please try again.';
        this.processingPayment = false;
        console.error(err);
      }
    });
  }
}
