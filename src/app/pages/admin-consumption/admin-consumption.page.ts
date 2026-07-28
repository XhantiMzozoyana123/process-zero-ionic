import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConsumptionService } from 'src/app/services/consumption.service';
import { ConsumptionConfigDto, ConsumptionStatsDto, UserSessionDto } from 'src/app/models/dtos/consumption-dto.model';

@Component({
  selector: 'app-admin-consumption',
  templateUrl: './admin-consumption.page.html',
  styleUrls: ['./admin-consumption.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule]
})
export class AdminConsumptionPage implements OnInit {
  config: ConsumptionConfigDto | null = null;
  stats: ConsumptionStatsDto | null = null;
  activeSessions: UserSessionDto[] = [];
  loading = false;

  configForm: FormGroup;
  isFormOpen = true;
  submitting = false;

  constructor(
    private consumptionService: ConsumptionService,
    private fb: FormBuilder,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.configForm = this.fb.group({
      creditsPerHour: [0.2, [Validators.required, Validators.min(0.01)]],
      checkIntervalMinutes: [1, [Validators.required, Validators.min(1)]],
      maxSessionMinutes: [480, [Validators.required, Validators.min(0)]],
      isEnabled: [true],
      gracePeriodMinutes: [0, [Validators.required, Validators.min(0)]],
      initialFreeHours: [5, [Validators.required, Validators.min(0)]],
      enforceAccessBlock: [true]
    });
  }

  ngOnInit() {
    this.loadConfig();
    this.loadStats();
    this.loadActiveSessions();
    // Refresh stats every 30 seconds
    setInterval(() => {
      this.loadStats();
      this.loadActiveSessions();
    }, 30000);
  }

  loadConfig(): void {
    this.loading = true;
    this.consumptionService.getConfig().subscribe({
      next: config => {
        console.log('Config loaded:', config);
        this.config = config;
        this.configForm.patchValue({
          creditsPerHour: config.creditsPerHour,
          checkIntervalMinutes: config.checkIntervalMinutes,
          maxSessionMinutes: config.maxSessionMinutes,
          isEnabled: config.isEnabled,
          gracePeriodMinutes: config.gracePeriodMinutes,
          initialFreeHours: config.initialFreeHours,
          enforceAccessBlock: config.enforceAccessBlock
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load config:', err);
        this.showToast('Failed to load config. Using defaults.', 'warning');
        this.config = null;
        this.loading = false;
      }
    });
  }

  loadStats(): void {
    this.consumptionService.getStats().subscribe({
      next: stats => { 
        console.log('Stats loaded:', stats);
        this.stats = stats; 
      },
      error: (err) => {
        console.error('Failed to load stats:', err);
      }
    });
  }

  loadActiveSessions(): void {
    this.consumptionService.getAllActiveSessions().subscribe({
      next: sessions => { 
        console.log('Sessions loaded:', sessions);
        this.activeSessions = sessions; 
      },
      error: (err) => {
        console.error('Failed to load sessions:', err);
      }
    });
  }

  saveConfig(): void {
    if (this.configForm.invalid) {
      this.configForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const val = this.configForm.getRawValue();

    this.consumptionService.updateConfig(val).subscribe({
      next: () => {
        this.showToast('Configuration updated', 'success');
        this.isFormOpen = false;
        this.submitting = false;
        this.loadConfig();
        this.loadStats();
      },
      error: (err) => {
        console.error('Failed to update config:', err);
        const errorMsg = err?.error?.message || err?.message || 'Unknown error';
        this.showToast(`Failed to update config: ${errorMsg}`, 'danger');
        this.submitting = false;
      }
    });
  }

  async resetConfig(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Reset Configuration?',
      message: 'This will reset all timer settings to their default values. Continue?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Reset', role: 'destructive', handler: () => {
            this.consumptionService.deleteConfig().subscribe({
              next: () => {
                this.showToast('Configuration reset to defaults', 'success');
                this.loadConfig();
                this.loadStats();
              },
              error: () => this.showToast('Failed to reset config', 'danger')
            });
          }
        }
      ]
    });
    await alert.present();
  }

  toggleForm(): void {
    this.isFormOpen = !this.isFormOpen;
  }

  async forceEndSession(session: UserSessionDto): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Force End Session?',
      message: `This will end the session for user ${session.userId}. Continue?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'End Session', role: 'destructive', handler: () => {
            this.consumptionService.forceEndSession(session.id).subscribe({
              next: () => {
                this.showToast('Session ended', 'success');
                this.loadActiveSessions();
                this.loadStats();
              },
              error: () => this.showToast('Failed to end session', 'danger')
            });
          }
        }
      ]
    });
    await alert.present();
  }

  refresh(event: any): void {
    this.loadConfig();
    this.loadStats();
    this.loadActiveSessions();
    event.target.complete();
  }

  isInvalid(name: string): boolean {
    const ctrl = this.configForm.get(name);
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastController.create({ message, color, duration: 2500, position: 'bottom' });
    await toast.present();
  }
}