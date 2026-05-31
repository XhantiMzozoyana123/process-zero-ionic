import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { RelayService } from './../../services/relay-service';
import { 
  RelayAccountResponseDto,
  RelayAccountStatisticsSummaryDto
} from './../../models/dtos/relay-dto.model';

@Component({
  selector: 'app-relay-user',
  templateUrl: './relay-user.page.html',
  styleUrls: ['./relay-user.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class RelayUserPage implements OnInit {
  private readonly googleOauthStateKey = 'relay.google.oauth.state';

  loading = false;
  oauthConnecting = false;
  segmentValue: 'accounts' | 'overview' = 'accounts';
  healthCheckingAccountId: number | null = null;
  accountActionLoading: Record<number, boolean> = {};
  removeAccountLoading: Record<number, boolean> = {};

  // Read-only stats data
  emailAccounts: RelayAccountResponseDto[] = [];
  overallStats: RelayAccountStatisticsSummaryDto | null = null;
  selectedAccountId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private relayService: RelayService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit(): void {
    this.handleOAuthRedirectResult();
    this.loadData();
  }

  private handleOAuthRedirectResult(): void {
    this.route.queryParamMap.subscribe((params) => {
      const oauthResult = params.get('oauth');
      if (!oauthResult) {
        return;
      }

      const email = params.get('email');
      const message = params.get('message');

      if (oauthResult === 'success') {
        void this.showToast(
          email ? `Google account connected: ${email}` : 'Google account connected successfully.',
          'success'
        );
      } else {
        void this.showToast(message || 'Could not connect Google account.', 'danger');
      }

      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          oauth: null,
          email: null,
          message: null,
        },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });
  }

  loadData(event?: any): void {
    this.loading = true;

    let pending = 2;
    const done = (): void => {
      pending -= 1;
      if (pending === 0) {
        this.loading = false;
        if (event) event.target.complete();
      }
    };

    this.relayService.getRelayAccounts().subscribe({
      next: (accounts) => {
        this.emailAccounts = accounts || [];
        if (!this.selectedAccountId && this.emailAccounts[0]?.id) {
          this.selectedAccountId = this.emailAccounts[0].id;
        }
        done();
      },
      error: async () => {
        await this.showToast('Could not load email accounts.', 'danger');
        done();
      }
    });

    this.relayService.getRelayAccountStatisticsSummary().subscribe({
      next: (stats) => {
        this.overallStats = stats;
        done();
      },
      error: async () => {
        await this.showToast('Could not load overall statistics.', 'danger');
        done();
      }
    });
  }

  connectWithGoogle(): void {
    this.oauthConnecting = true;
    this.relayService.getGoogleAuthUrl().subscribe({
      next: ({ authUrl, state }) => {
        sessionStorage.setItem(this.googleOauthStateKey, state);
        window.location.assign(authUrl);
      },
      error: async (err) => {
        this.oauthConnecting = false;
        await this.showToast(err?.error?.error || 'Failed to start Google OAuth.', 'danger');
      },
    });

    window.addEventListener(
      'pagehide',
      () => {
        this.oauthConnecting = false;
      },
      { once: true }
    );
  }

  onAccountSelect(): void {
    if (!this.selectedAccountId) {
      return;
    }
  }

  runHealthCheck(accountId: number): void {
    this.healthCheckingAccountId = accountId;
    this.relayService.checkAccountHealth(accountId).subscribe({
      next: async (updatedAccount) => {
        this.upsertAccount(updatedAccount);
        this.loadSummary();
        this.healthCheckingAccountId = null;
        await this.showToast('Health check completed.', 'success');
      },
      error: async (err) => {
        this.healthCheckingAccountId = null;
        await this.showToast(err?.error?.error || 'Health check failed.', 'danger');
      },
    });
  }

  deactivateAccount(accountId: number, event?: Event): void {
    event?.stopPropagation();
    this.accountActionLoading[accountId] = true;

    this.relayService.deactivateRelayAccount(accountId, 'Deactivated by user').subscribe({
      next: async ({ account }) => {
        this.upsertAccount(account);
        this.loadSummary();
        this.accountActionLoading[accountId] = false;
        await this.showToast('Account deactivated.', 'warning');
      },
      error: async (err) => {
        this.accountActionLoading[accountId] = false;
        await this.showToast(err?.error?.error || 'Failed to deactivate account.', 'danger');
      },
    });
  }

  async removeAccount(accountId: number, event?: Event): Promise<void> {
    event?.stopPropagation();

    const account = this.emailAccounts.find((a) => a.id === accountId);
    const alert = await this.alertController.create({
      header: 'Remove Account',
      message: `Remove <strong>${account?.emailAddress ?? 'this account'}</strong>? This cannot be undone.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Remove',
          role: 'destructive',
          cssClass: 'alert-button-danger',
          handler: () => {
            this.removeAccountLoading[accountId] = true;
            this.relayService.deleteRelayAccount(accountId).subscribe({
              next: async () => {
                this.emailAccounts = this.emailAccounts.filter((a) => a.id !== accountId);
                if (this.selectedAccountId === accountId) {
                  this.selectedAccountId = this.emailAccounts[0]?.id ?? null;
                }
                this.loadSummary();
                this.removeAccountLoading[accountId] = false;
                await this.showToast('Account removed.', 'success');
              },
              error: async (err) => {
                this.removeAccountLoading[accountId] = false;
                await this.showToast(err?.error?.error || 'Failed to remove account.', 'danger');
              },
            });
          },
        },
      ],
    });
    await alert.present();
  }

  reactivateAccount(accountId: number, event?: Event): void {
    event?.stopPropagation();
    this.accountActionLoading[accountId] = true;

    this.relayService.reactivateRelayAccount(accountId).subscribe({
      next: async ({ account }) => {
        this.upsertAccount(account);
        this.loadSummary();
        this.accountActionLoading[accountId] = false;
        await this.showToast('Account reactivated.', 'success');
      },
      error: async (err) => {
        this.accountActionLoading[accountId] = false;
        await this.showToast(err?.error?.error || 'Failed to reactivate account.', 'danger');
      },
    });
  }

  get selectedAccount(): RelayAccountResponseDto | null {
    if (!this.selectedAccountId) {
      return null;
    }

    return this.emailAccounts.find((account) => account.id === this.selectedAccountId) || null;
  }

  getHealthLabel(healthStatus: number | string | undefined): string {
    const value = Number(healthStatus);
    if (Number.isNaN(value)) {
      return 'Unknown';
    }

    switch (value) {
      case 0:
        return 'Healthy';
      case 1:
        return 'Warning';
      case 2:
        return 'Critical';
      default:
        return `Status ${value}`;
    }
  }

  getRemainingCapacity(account: RelayAccountResponseDto): number {
    return Math.max(0, account.dailySendLimit - account.sentToday);
  }

  getCapacityUsage(account: RelayAccountResponseDto): number {
    if (account.dailySendLimit <= 0) {
      return 0;
    }
    return Math.round((account.sentToday / account.dailySendLimit) * 100);
  }

  private loadSummary(): void {
    this.relayService.getRelayAccountStatisticsSummary().subscribe({
      next: (stats) => {
        this.overallStats = stats;
      },
      error: () => {
        // Ignore summary refresh failure after account actions.
      },
    });
  }

  private upsertAccount(updatedAccount: RelayAccountResponseDto): void {
    this.emailAccounts = this.emailAccounts.map((account) =>
      account.id === updatedAccount.id ? updatedAccount : account
    );
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 2000,
      position: 'top',
    });
    await toast.present();
  }
}
