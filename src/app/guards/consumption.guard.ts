import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ConsumptionService } from 'src/app/services/consumption.service';
import { AlertController, ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { TopUpModalComponent } from 'src/app/components/top-up-modal/top-up-modal.component';
import { catchError, firstValueFrom, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConsumptionGuard implements CanActivate {
  private currentSessionId: number | null = null;
  private heartbeatInterval: any;

  constructor(
    private consumptionService: ConsumptionService,
    private router: Router,
    private modalController: ModalController,
    private alertController: AlertController
  ) {}

  canActivate(): boolean {
    this.initializeSession();
    return true;
  }

  private async initializeSession() {
    try {
      const activeSession = await firstValueFrom(this.consumptionService.getActiveSession().pipe(
        catchError(() => of({ session: null as any }))
      ));
      
      if (activeSession && activeSession.session) {
        this.currentSessionId = activeSession.session.id;
        this.startHeartbeat();
      } else {
        const newSession = await firstValueFrom(this.consumptionService.startSession().pipe(
          catchError(() => of({ id: null as any }))
        ));
        if (newSession && newSession.id) {
          this.currentSessionId = newSession.id;
          this.startHeartbeat();
        }
      }
    } catch (error) {
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
      const response = await firstValueFrom(this.consumptionService.heartbeat(this.currentSessionId).pipe(
        catchError(() => of({ isBlocked: false as boolean, message: '' as string }))
      ));
      
      if (response && response.isBlocked) {
        if (this.heartbeatInterval) {
          clearInterval(this.heartbeatInterval);
          this.heartbeatInterval = null;
        }
        await this.showTopUpModal(response.message || 'Please top up credits to continue.');
      }
    } catch (error) {
      console.error('Heartbeat failed:', error);
    }
  }

  private async showTopUpModal(message: string) {
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
  }

  ngOnDestroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }
}
