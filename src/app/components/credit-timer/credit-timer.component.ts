import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CreditService } from 'src/app/services/credit.service';

@Component({
  selector: 'app-credit-timer',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule
  ],
  templateUrl: './credit-timer.component.html',
  styleUrls: ['./credit-timer.component.scss'],
})
export class CreditTimerComponent implements OnInit {
  displayHours = '00';
  displayMinutes = '00';
  displaySeconds = '00';
  isLoading = true;
  isExpired = false;
  showPurchaseModal = false;
  lastUpdated = '';

  constructor(
    private creditService: CreditService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.refreshTimer();
  }

  refreshTimer(): void {
    this.isLoading = true;
    this.showPurchaseModal = false;
    this.isExpired = false;

    this.creditService.getRemainingHours().subscribe({
      next: (response) => {
        const hours = response.remainingHours;
        const remainingSeconds = Math.max(0, Math.floor(hours * 3600));
        this.isLoading = false;
        this.isExpired = remainingSeconds <= 0;
        this.updateDisplay(remainingSeconds);
        this.lastUpdated = new Date().toLocaleTimeString();
        if (remainingSeconds <= 0) {
          this.showExpiredState();
        }
      },
      error: () => {
        this.isLoading = false;
        this.isExpired = true;
        this.updateDisplay(0);
        this.showExpiredState();
      }
    });
  }

  private updateDisplay(totalSeconds: number): void {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    this.displayHours = h.toString().padStart(2, '0');
    this.displayMinutes = m.toString().padStart(2, '0');
    this.displaySeconds = s.toString().padStart(2, '0');
  }

  private showExpiredState(): void {
    this.displayHours = '00';
    this.displayMinutes = '00';
    this.displaySeconds = '00';
    this.showPurchaseModal = true;
  }

  openPurchaseModal(): void {
    this.showPurchaseModal = true;
  }

  closePurchaseModal(): void {
    this.showPurchaseModal = false;
  }

  goToCredits(): void {
    this.showPurchaseModal = false;
    void this.router.navigate(['/account/credits/wallet']);
  }
}