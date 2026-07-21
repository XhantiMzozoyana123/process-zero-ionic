import { Component, OnInit } from '@angular/core';
import { CreditService as CreditApiService } from 'src/app/services/credit.service';
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

  constructor(private creditService: CreditApiService) {}

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

    const request: PurchaseCreditsRequestDto = {
      creditPackageId: this.selectedPackageId
    };

    this.creditService.purchaseCredits(request).subscribe({
      next: (response: CreditPurchaseResponseDto) => {
        if (response.success) {
          this.purchaseSuccess = `Purchase successful! New balance: ${response.newBalance} credits.`;
          this.loadWallet();
          this.closePurchaseModal();
        } else {
          this.error = response.message || 'Purchase failed.';
        }
      },
      error: (err) => {
        this.error = 'Purchase failed.';
        console.error(err);
      }
    });
  }
}