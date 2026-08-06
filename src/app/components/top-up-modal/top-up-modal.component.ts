import { Component, Input } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { CreditService } from 'src/app/services/credit.service';
import { PayPalService } from 'src/app/services/paypal.service';

@Component({
  selector: 'app-top-up-modal',
  templateUrl: './top-up-modal.component.html',
  styleUrls: ['./top-up-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class TopUpModalComponent {
  @Input() message: string = 'Your free hours have been exhausted. Please top up to continue.';
  
  packages: any[] = [];
  selectedPackage: any = null;
  isProcessing = false;
  loadError = false;
  isLoadingPackages = true;

  constructor(
    private modalController: ModalController,
    private creditService: CreditService,
    private payPalService: PayPalService
  ) {}

  async ngOnInit() {
    this.loadPackages();
  }

  loadPackages() {
    this.isLoadingPackages = true;
    this.loadError = false;
    this.creditService.getAvailablePackages().subscribe({
      next: pkgs => {
        this.packages = pkgs;
        this.isLoadingPackages = false;
        if (pkgs.length === 0) {
          this.loadError = true;
        }
      },
      error: () => {
        this.isLoadingPackages = false;
        this.loadError = true;
        console.error('Failed to load packages');
      }
    });
  }

  buyWithPayPal(pkg: any) {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.payPalService.createPayPalOrder(pkg.id).subscribe({
      next: (res) => {
        // Store order details before redirecting to PayPal
        sessionStorage.setItem('paypal_order_id', res.orderId);
        sessionStorage.setItem('paypal_package_id', res.packageId.toString());
        // Redirect to PayPal approval URL
        window.location.href = res.approvalUrl;
      },
      error: () => {
        this.isProcessing = false;
        alert('Failed to create PayPal order. Please try again.');
      }
    });
  }

  dismiss() {
    this.modalController.dismiss({ shouldRefresh: false });
  }
}