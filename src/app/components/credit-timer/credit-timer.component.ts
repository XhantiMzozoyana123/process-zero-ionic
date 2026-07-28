import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { CreditService } from 'src/app/services/credit.service';
import { ConsumptionService } from 'src/app/services/consumption.service';
import { TopUpModalComponent } from '../top-up-modal/top-up-modal.component';

@Component({
  selector: 'app-credit-timer',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TopUpModalComponent
  ],
  templateUrl: './credit-timer.component.html',
  styleUrls: ['./credit-timer.component.scss'],
})
export class CreditTimerComponent implements OnInit, OnDestroy {
  displayHours = '00';
  displayMinutes = '00';
  displaySeconds = '00';
  isLoading = true;
  isExpired = false;
  lastUpdated = '';

  /** Session state from heartbeat */
  isBlocked = false;
  isConsuming = false;
  sessionId: number | null = null;

  private countdownInterval: any;
  private heartbeatInterval: any;
  private remainingSeconds = 0;
  private readonly HEARTBEAT_MS = 30000; // 30 seconds

  constructor(
    private creditService: CreditService,
    private consumptionService: ConsumptionService,
    private modalController: ModalController
  ) {}

  ngOnInit(): void {
    this.initSessionAndTimer();
    // Listen for credit purchase events from top-up modal
    window.addEventListener('credits-purchased', this.onPurchaseComplete);
  }

  ngOnDestroy(): void {
    this.clearAll();
    window.removeEventListener('credits-purchased', this.onPurchaseComplete);
  }

  // ── Public API ──

  refreshTimer(): void {
    this.fetchRemainingHours();
  }

  async openTopUpPackages(): Promise<void> {
    const modal = await this.modalController.create({
      component: TopUpModalComponent,
      componentProps: {
        message: 'Your active usage time has expired. Please purchase more credits to continue.'
      }
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data?.shouldRefresh) {
      this.refreshTimer();
    }
  }

  /** Called from outside after a successful purchase */
  onPurchaseComplete(): void {
    this.refreshTimer();
  }

  // ── Session & Timer Initialisation ──

  private async initSessionAndTimer() {
    this.isLoading = true;
    this.isExpired = false;
    this.isBlocked = false;
    this.clearCountdown();
    this.clearHeartbeat();

    try {
      // Check for existing active session
      const activeSession = await this.consumptionService.getActiveSession().toPromise();
      if (activeSession && activeSession.hasActiveSession && activeSession.session?.id) {
        this.sessionId = activeSession.session.id;
        this.startHeartbeat();
      } else {
        // Start a new session
        const newSession = await this.consumptionService.startSession().toPromise();
        if (newSession && newSession.id) {
          this.sessionId = newSession.id;
          this.startHeartbeat();
        }
      }
    } catch {
      // Silently continue - will fall back to remaining-hours API
    }

    // Always fetch remaining hours to seed the countdown
    this.fetchRemainingHours();
  }

  private fetchRemainingHours(): void {
    this.creditService.getRemainingHours().subscribe({
      next: (response) => {
        const hours = response.remainingHours;
        this.remainingSeconds = Math.max(0, Math.floor(hours * 3600));
        this.isLoading = false;
        this.isExpired = this.remainingSeconds <= 0;
        this.updateDisplay(this.remainingSeconds);
        this.lastUpdated = new Date().toLocaleTimeString();
        if (this.remainingSeconds <= 0) {
          this.showExpiredState();
        } else {
          this.startCountdown();
        }
      },
      error: () => {
        this.isLoading = false;
        this.isExpired = true;
        this.remainingSeconds = 0;
        this.updateDisplay(0);
        this.showExpiredState();
      }
    });
  }

  // ── Heartbeat (keeps session alive & syncs consumption state) ──

  private startHeartbeat(): void {
    if (!this.sessionId) return;
    this.clearHeartbeat();
    this.sendHeartbeat(); // immediate first beat
    this.heartbeatInterval = setInterval(() => this.sendHeartbeat(), this.HEARTBEAT_MS);
  }

  private async sendHeartbeat() {
    if (!this.sessionId) return;
    try {
      const response = await this.consumptionService.heartbeat(this.sessionId).toPromise();
      if (response) {
        this.isConsuming = response.isConsuming ?? false;
        this.isBlocked = response.isBlocked ?? false;

        if (response.remainingCreditBalance != null) {
          // Server sent us an accurate balance — update our countdown from it
          const creditsToHours = 5; // 1 credit = 5 hours @ 0.2 credits/hr
          const hours = response.remainingCreditBalance * creditsToHours;
          this.remainingSeconds = Math.max(0, Math.floor(hours * 3600));
          this.isExpired = this.remainingSeconds <= 0;
          this.updateDisplay(this.remainingSeconds);
          this.lastUpdated = new Date().toLocaleTimeString();
        }

        if (this.isBlocked) {
          this.isExpired = true;
          this.remainingSeconds = 0;
          this.updateDisplay(0);
          this.clearCountdown();
          this.clearHeartbeat();
          this.showExpiredState();
        }
      }
    } catch {
      // Silently fail — the countdown continues based on last known state
    }
  }

  // ── Countdown Display ──

  private startCountdown(): void {
    this.countdownInterval = setInterval(() => {
      this.remainingSeconds = Math.max(0, this.remainingSeconds - 1);
      if (this.remainingSeconds <= 0) {
        this.isExpired = true;
        this.updateDisplay(0);
        this.clearCountdown();
        this.showExpiredState();
      } else {
        this.updateDisplay(this.remainingSeconds);
      }
    }, 1000);
  }

  private clearCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  private clearHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private clearAll(): void {
    this.clearCountdown();
    this.clearHeartbeat();
  }

  private updateDisplay(totalSeconds: number): void {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    this.displayHours = h.toString().padStart(2, '0');
    this.displayMinutes = m.toString().padStart(2, '0');
    this.displaySeconds = s.toString().padStart(2, '0');
  }

  showExpiredState(): void {
    this.displayHours = '00';
    this.displayMinutes = '00';
    this.displaySeconds = '00';
    void this.openTopUpPackages();
  }
}