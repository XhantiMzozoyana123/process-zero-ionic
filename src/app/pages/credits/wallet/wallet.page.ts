import { Component, OnInit } from '@angular/core';
import { CreditService as CreditApiService } from 'src/app/services/credit.service';
import { PayPalService } from 'src/app/services/paypal.service';
import { UserWalletDto } from 'src/app/models/dtos/user-wallet-dto.model';
import { CreditPurchaseResponseDto } from 'src/app/models/dtos/credit-purchase-response-dto.model';
import { PurchaseCreditsRequestDto } from 'src/app/models/dtos/purchase-credits-request-dto.model';

declare global {
  interface Window {
    paypal?: any;
  }
}

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
        this.renderPayPalButton(res.orderId);
      },
      error: (err) => {
        this.error = 'Failed to initiate PayPal payment.';
        this.processingPayment = false;
        console.error(err);
      }
    });
  }

  renderPayPalButton(orderId: string) {
    const waitForPayPal = () => {
      return new Promise<void>((resolve, reject) => {
        // If already loaded, resolve immediately
        if (window.paypal) {
          resolve();
          return;
        }

        // Poll for window.paypal to become available
        const checkInterval = setInterval(() => {
          if (window.paypal) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);

        // Timeout after 30 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          reject(new Error('PayPal SDK load timeout'));
        }, 30000);
      });
    };

    waitForPayPal()
      .then(() => {
        this.initPayPalButton(orderId);
      })
      .catch((err) => {
        console.error(err);
        this.error = 'PayPal failed to load. Please check your internet connection and refresh.';
        this.processingPayment = false;
      });
  }

  private initPayPalButton(orderId: string) {
    const container = document.getElementById('paypal-button-container');
    if (!container) return;

    container.innerHTML = '';

    try {
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'black',
          shape: 'rect',
          label: 'pay'
        },
        createOrder: () => orderId,
        onApprove: (data: any) => {
          return this.payPalService.capturePayPalOrder(data.orderID, this.selectedPackageId!).subscribe({
            next: (response) => {
              this.purchaseSuccess = `Purchase successful! New balance: ${response.credits.newBalance} credits.`;
              this.loadWallet();
              this.closePurchaseModal();
              this.processingPayment = false;
            },
            error: (err) => {
              this.error = 'PayPal payment capture failed.';
              this.processingPayment = false;
              console.error(err);
            }
          });
        },
        onError: (err: any) => {
          this.error = 'PayPal payment was cancelled or failed.';
          this.processingPayment = false;
          console.error(err);
        },
        onCancel: () => {
          this.processingPayment = false;
        }
      }).render(container)
        .then(() => {
          // Button rendered successfully, hide processing spinner
          this.processingPayment = false;
        })
        .catch((err: any) => {
          console.error('PayPal button render failed:', err);
          this.error = 'Failed to render PayPal button. Please refresh.';
          this.processingPayment = false;
        });
    } catch (err) {
      console.error('PayPal initialization error:', err);
      this.error = 'PayPal initialization failed. Please refresh.';
      this.processingPayment = false;
    }
  }
}
