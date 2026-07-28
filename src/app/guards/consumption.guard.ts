import { Injectable, OnDestroy } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ConsumptionService } from 'src/app/services/consumption.service';
import { AlertController, ModalController } from '@ionic/angular';
import { catchError, firstValueFrom, of, timeout } from 'rxjs';
import { TopUpModalComponent } from 'src/app/components/top-up-modal/top-up-modal.component';

@Injectable({
  providedIn: 'root'
})
export class ConsumptionGuard implements CanActivate, OnDestroy {
  private currentSessionId: number | null = null;
  private heartbeatInterval: any;
  private isDestroyed = false;
  private blocked = false;

  constructor(
    private consumptionService: ConsumptionService,
    private router: Router,
    private modalController: ModalController,
    private alertController: AlertController
  ) {}

  async canActivate(): Promise<boolean> {
    if (this.blocked) {
      await this.showTopUpModal('Please top up credits to continue.');
      return false;
    }

    await this.initializeSession();

    if (this.blocked) {
      await this.showTopUpModal('Please top up credits to continue.');
      return false;
    }

    return true;
  }

  private async initializeSession() {
    try {
      // Check for active session with timeout
      const activeResponse = await firstValueFrom(
        this.consumptionService.getActiveSession().pipe(
          timeout(5000),
          catchError(() => of({ hasActiveSession: false, session: null }))
        )
      );

      if (activeResponse && activeResponse.hasActiveSession && activeResponse.session?.id) {
        this.currentSessionId = activeResponse.session.id;
        this.startHeartbeat();
      } else {
        // Start a new session with timeout
        const newSession = await firstValueFrom(
          this.consumptionService.startSession().pipe(
            timeout(5000),
            catchError(() => of({ id: null as any }))
          )
        );
        if (newSession && newSession.id) {
          this.currentSessionId = newSession.id;
          this.startHeartbeat();
        }
      }
    } catch (error) {
      // Silently fail - don't block user access
      console.error('Failed to initialize consumption session:', error);
    }
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = setInterval(() => this.checkHeartbeat(), 30000);
    this.checkHeartbeat();
  }

  private async checkHeartbeat() {
    if (!this.currentSessionId) return;

    try {
      const response = await firstValueFrom(
        this.consumptionService.heartbeat(this.currentSessionId).pipe(
          timeout(5000),
          catchError(() => of({ success: false, isBlocked: false, isConsuming: false, message: '' }))
        )
      );

      if (response && response.isBlocked) {
        if (this.heartbeatInterval) {
          clearInterval(this.heartbeatInterval);
          this.heartbeatInterval = null;
        }
        this.blocked = true;
        await this.showTopUpModal(response.message || 'Please top up credits to continue.');
      }
    } catch (error) {
      // Silently fail - don't block user access
      console.error('Heartbeat failed:', error);
    }
  }

  private async showTopUpModal(message: string) {
    try {
      const modal = await this.modalController.create({
        component: TopUpModalComponent,
        componentProps: { message },
        backdropDismiss: false,
        cssClass: 'top-up-modal'
      });

      await modal.present();
      const { data } = await modal.onWillDismiss();

      if (data && data.shouldRefresh) {
        await this.initializeSession();
      }
    } catch (error) {
      console.error('Failed to show top-up modal:', error);
    }
  }

  /** End the session when the guard is destroyed (user navigates away) */
  async endSession() {
    if (this.currentSessionId) {
      try {
        await firstValueFrom(
          this.consumptionService.endSession(this.currentSessionId).pipe(
            timeout(5000),
            catchError(() => of(null))
          )
        );
      } catch {
        // Silently fail
      }
      this.currentSessionId = null;
    }
  }

  ngOnDestroy() {
    this.isDestroyed = true;
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    // End the session when the guard is destroyed
    this.endSession();
  }
}