import { Component, OnInit } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CreditService as CreditApiService } from 'src/app/services/credit.service';
import { PayShapService } from 'src/app/services/payshap.service';
import { UserWalletDto } from 'src/app/models/dtos/user-wallet-dto.model';
import { CreditPurchaseResponseDto } from 'src/app/models/dtos/credit-purchase-response-dto.model';
import { PurchaseCreditsRequestDto } from 'src/app/models/dtos/purchase-credits-request-dto.model';
import { CreatePayShapOrderResponse } from 'src/app/models/dtos/pay-shap-dtos.model';
import { PayShapPaymentModalComponent } from 'src/app/components/payshap-payment-modal/payshap-payment-modal.component';

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
    private payShapService: PayShapService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.loadWallet();
    this.loadPackages();
    this.checkPayShapReturn();
  }

  private checkPayPalReturn() {
    // PayPal removed - using PayShap only
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
    // PayPal removed - redirect to PayShap instead
    this.payWithPayShap();
  }

  /**
   * Initiates PayShap payment flow by opening the payment modal
   */
  payWithPayShap() {
    console.log('payWithPayShap called, selectedPackageId:', this.selectedPackageId);
    
    if (!this.selectedPackageId) {
      console.warn('No package selected');
      this.error = 'Please select a package first.';
      return;
    }
    
    console.log('Creating PayShap order for package:', this.selectedPackageId);
    this.error = null;
    
    this.payShapService.createPayShapOrder(this.selectedPackageId).subscribe({
      next: (res) => {
        console.log('PayShap order created successfully:', res);
        this.openPayShapModal(res);
      },
      error: (err) => {
        console.error('PayShap order creation failed:', err);
        this.error = 'Failed to initiate PayShap payment. Please try again.';
      }
    });
  }

  /**
   * Opens the PayShap payment modal with instructions and screenshot upload
   */
  private async openPayShapModal(payShapOrder: CreatePayShapOrderResponse) {
    try {
      console.log('Opening PayShap modal with order:', payShapOrder);
      
      const modal = await this.modalController.create({
        component: PayShapPaymentModalComponent,
        componentProps: {
          payShapOrder: payShapOrder,
          packageId: this.selectedPackageId
        },
        backdropDismiss: false
      });

      await modal.present();
      console.log('PayShap modal presented');

      const { data } = await modal.onDidDismiss();
      console.log('PayShap modal dismissed with data:', data);
      
      if (data?.shouldRefresh) {
        // Refresh wallet and packages after successful payment proof submission
        this.loadWallet();
        this.loadPackages();
        
        if (data?.success) {
          this.purchaseSuccess = data.message || 'Payment proof submitted successfully! Your payment is pending verification.';
        }
      }
    } catch (error) {
      console.error('Error opening PayShap modal:', error);
      this.error = 'Failed to open payment modal. Please try again.';
    }
  }

  /**
   * Checks for PayShap return from modal (if opened from top-up modal)
   */
  private checkPayShapReturn() {
    // This can be extended if needed for URL-based returns
    // Currently using modal dismissal events instead
  }
}
