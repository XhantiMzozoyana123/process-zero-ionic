import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { AdminUserService } from 'src/app/services/admin-user-service';
import { ApplicationUser } from 'src/app/models/entities/application-user.model';
import { KpiService } from 'src/app/services/kpi-service';
import { ProductService } from 'src/app/services/product-service';
import { KPI } from 'src/app/models/entities/kpi.model';
import { Product } from 'src/app/models/entities/product.model';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.page.html',
  styleUrls: ['./admin-users.page.scss'],
  standalone: false
})
export class AdminUsersPage implements OnInit {
  users: ApplicationUser[] = [];
  loading = false;
  searchTerm = '';

  isDetailModalOpen = false;
  detailUser: ApplicationUser | null = null;

  // KPI state
  products: Product[] = [];
  selectedProductId: number | null = null;
  kpiData: KPI | null = null;
  kpiLoading = false;
  kpiError = '';

  constructor(
    private userService: AdminUserService,
    private alertController: AlertController,
    private toastController: ToastController,
    private kpiService: KpiService,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadProducts();
  }

  get displayedUsers(): ApplicationUser[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.users;
    return this.users.filter(u => {
      const haystack = [u.userName, u.email, u.id, u.phoneNumber]
        .filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(term);
    });
  }

  loadUsers(event?: any): void {
    this.loading = true;
    this.userService.getAll().subscribe({
      next: users => {
        this.users = users;
        this.loading = false;
        if (event) event.target.complete();
      },
      error: () => {
        this.showToast('Could not load users.', 'danger');
        this.loading = false;
        if (event) event.target.complete();
      }
    });
  }

  refresh(event: any): void {
    this.loadUsers(event);
  }

  getInitials(u: ApplicationUser): string {
    const name = u.userName ?? u.email ?? '';
    const parts = name.split(/[\s@._-]+/).filter(Boolean);
    return (parts[0]?.charAt(0) ?? '').toUpperCase() + (parts[1]?.charAt(0) ?? '').toUpperCase() || '?';
  }

  openDetailModal(user: ApplicationUser): void {
    this.detailUser = user;
    this.kpiData = null;
    this.selectedProductId = null;
    this.kpiError = '';
    this.isDetailModalOpen = true;
  }

  closeDetailModal(): void {
    this.isDetailModalOpen = false;
    this.detailUser = null;
    this.kpiData = null;
    this.selectedProductId = null;
    this.kpiError = '';
  }

  async banUser(user: ApplicationUser): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Ban User',
      message: `Ban ${user.userName}? They will lose API access.`,
      inputs: [
        { name: 'reason', type: 'text', placeholder: 'Reason (optional)' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Ban', role: 'destructive', handler: (data) => {
            this.userService.banUser(user.id, data.reason).subscribe({
              next: () => {
                user.isBanned = true;
                user.bannedAt = new Date().toISOString();
                user.banReason = data.reason || undefined;
                this.showToast('User banned.', 'success');
              },
              error: () => this.showToast('Could not ban user.', 'danger')
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async unbanUser(user: ApplicationUser): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Unban User',
      message: `Restore access for ${user.userName}?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Unban', handler: () => {
            this.userService.unbanUser(user.id).subscribe({
              next: () => {
                user.isBanned = false;
                user.bannedAt = undefined;
                user.banReason = undefined;
                this.showToast('User unbanned.', 'success');
              },
              error: () => this.showToast('Could not unban user.', 'danger')
            });
          }
        }
      ]
    });
    await alert.present();
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastController.create({ message, color, duration: 2500, position: 'bottom' });
    await toast.present();
  }

  // ── KPI ──────────────────────────────────
  loadProducts(): void {
    this.productService.getAll().subscribe({
      next: products => this.products = products,
      error: () => this.products = []
    });
  }

  onProductChange(productId: number): void {
    this.selectedProductId = productId;
    this.kpiData = null;
    this.kpiError = '';
    if (!this.detailUser || !productId) return;
    this.loadUserKpi(this.detailUser.id, productId);
  }

  loadUserKpi(userId: string, productId: number): void {
    this.kpiLoading = true;
    this.kpiError = '';
    this.kpiService.getLatestKpiForUser(userId, productId).subscribe({
      next: kpi => {
        this.kpiData = kpi;
        this.kpiLoading = false;
      },
      error: (err) => {
        this.kpiData = null;
        this.kpiLoading = false;
        this.kpiError = err.status === 404 ? 'No KPI data found for this product.' : 'Could not load KPI data.';
      }
    });
  }

  get coreActivityMetrics() {
    const k = this.kpiData;
    if (!k) return [];
    return [
      { label: 'Call Outreach', value: k.callOutreach },
      { label: 'Email Outreach', value: k.emailOutreach },
      { label: 'Calls Made', value: k.callsMade },
      { label: 'Meetings Booked', value: k.meetingsBooked },
    ];
  }

  get revenueMetrics() {
    const k = this.kpiData;
    if (!k) return [];
    return [
      { label: 'Deal Size Closed', value: this.formatCurrency(k.dealSizeClosed) },
      { label: 'Active Clients', value: k.activeClients },
      { label: 'MRR', value: this.formatCurrency(k.monthlyRecurringRevenue) },
    ];
  }

  private formatCurrency(val: number): string {
    return 'R ' + (val ?? 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}


