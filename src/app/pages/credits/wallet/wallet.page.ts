import { Component, OnInit } from '@angular/core';
import { CreditService as CreditApiService } from 'src/app/services/credit.service';
import { PayPalService } from 'src/app/services/paypal.service';
import { UserWalletDto } from 'src/app/models/dtos/user-wallet-dto.model';
import { CreditPurchaseResponseDto } from 'src/app/models/dtos/credit-purchase-response-dto.model';
import { PurchaseCreditsRequestDto } from 'src/app/models/dtos/purchase-credits-request-dto.model';

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

  constructor(private creditService: CreditApiService, private payPalService: PayPalService) {}

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
            this.purchaseSuccess = `Purchase successful! New balance: ${response.credits.newBalance} credits.`;
            this.loadWallet();
            sessionStorage.removeItem('paypal_order_id');
            sessionStorage.removeItem('paypal_package_id');
          },
          error: (err) => {
            this.error = 'PayPal payment capture failed.';
            this.processingPayment = false;
            console.error(err);
          }
        });
      }
    } else if (urlParams.get('paypal') === 'cancelled') {
      sessionStorage.removeItem('paypal_order_id');
      sessionStorage.removeItem('paypal_package_id');
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
    this.creditService.getAvailablePackages().subscribe({
      next: (data) => {
        this.packages = data;
      },
      error: (err) => {
        console.error('Failed to load packages', err);
      }
    });
  }

  openPurchaseModal() {
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
        // Redirect to PayPal approval URL
        window.location.href = res.approvalUrl;
      },
      error: (err) => {
        this.error = 'Failed to initiate PayPal payment.';
        this.processingPayment = false;
        console.error(err);
      }
    });
  }
}
