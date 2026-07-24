import { Component, Input } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { CreditService } from 'src/app/services/credit.service';

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

  constructor(
    private modalController: ModalController,
    private creditService: CreditService
  ) {}

  async ngOnInit() {
    this.loadPackages();
  }

  loadPackages() {
    this.creditService.getAvailablePackages().subscribe({
      next: pkgs => { this.packages = pkgs; },
      error: () => console.error('Failed to load packages')
    });
  }

  selectPackage(item: any) {
    this.selectedPackage = item;
  }

  purchase() {
    if (!this.selectedPackage) return;

    this.isProcessing = true;
    this.creditService.purchaseCredits(this.selectedPackage.id).subscribe({
      next: () => {
        this.isProcessing = false;
        this.modalController.dismiss({ shouldRefresh: true });
      },
      error: () => {
        this.isProcessing = false;
        alert('Purchase failed. Please try again.');
      }
    });
  }

  dismiss() {
    this.modalController.dismiss({ shouldRefresh: false });
  }
}