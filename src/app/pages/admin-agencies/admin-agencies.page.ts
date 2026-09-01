import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { AgencyService, AgencyDto, CreateAgencyDto, UpdateAgencyDto } from 'src/app/services/agency-service';
import { AdminUserService } from 'src/app/services/admin-user-service';
import { ApplicationUser } from 'src/app/models/entities/application-user.model';

@Component({
  selector: 'app-admin-agencies',
  templateUrl: './admin-agencies.page.html',
  styleUrls: ['./admin-agencies.page.scss'],
  standalone: false
})
export class AdminAgenciesPage implements OnInit {
  agencies: AgencyDto[] = [];
  users: ApplicationUser[] = [];
  loading = false;
  searchTerm = '';

  isModalOpen = false;
  editingAgency: AgencyDto | null = null;
  form = { name: '', description: '', email: '', password: '', isActive: true };
  selectedManagerIds: string[] = [];

  constructor(
    private agencyService: AgencyService,
    private userService: AdminUserService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.load();
  }

  load(event?: any) {
    this.loading = true;
    this.agencyService.getAll().subscribe({
      next: agencies => {
        this.agencies = agencies;
        this.loading = false;
        event?.target.complete();
      },
      error: () => {
        this.showToast('Could not load agencies.', 'danger');
        this.loading = false;
        event?.target.complete();
      }
    });
  }

  loadUsers() {
    this.userService.getAll().subscribe({
      next: users => this.users = users,
      error: () => this.users = []
    });
  }

  get displayedAgencies(): AgencyDto[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.agencies;
    return this.agencies.filter(a =>
      [a.name, a.description, a.linkedUserName, ...a.managers.map(m => m.userName)]
        .filter(Boolean).join(' ').toLowerCase().includes(term)
    );
  }
  initials(name: string): string {
    const parts = (name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    return parts.slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }

  // ── Create / Edit ──────────────────────────────────
  openCreate() {
    this.editingAgency = null;
    this.form = { name: '', description: '', email: '', password: '', isActive: true };
    this.selectedManagerIds = [];
    this.loadUsers();
    this.isModalOpen = true;
  }

  openEdit(agency: AgencyDto) {
    this.editingAgency = agency;
    this.form = {
      name: agency.name,
      description: agency.description ?? '',
      email: '',
      password: '',
      isActive: agency.isActive
    };
    this.selectedManagerIds = agency.managers.map(m => m.userId);
    this.loadUsers();
    this.isModalOpen = true;
  }

  closeEditor() {
    this.isModalOpen = false;
  }

  toggleManager(userId: string, checked: boolean) {
    if (checked && !this.selectedManagerIds.includes(userId)) {
      this.selectedManagerIds = [...this.selectedManagerIds, userId];
    } else if (!checked) {
      this.selectedManagerIds = this.selectedManagerIds.filter(id => id !== userId);
    }
  }

  isSelected(userId: string): boolean {
    return this.selectedManagerIds.includes(userId);
  }

  save() {
    if (!this.form.name.trim()) {
      this.showToast('Agency name is required.', 'warning');
      return;
    }

    if (this.editingAgency) {
      const dto: UpdateAgencyDto = {
        name: this.form.name.trim(),
        description: this.form.description,
        isActive: this.form.isActive,
        managerUserIds: this.selectedManagerIds
      };
      this.agencyService.update(this.editingAgency.id, dto).subscribe({
        next: () => { this.showToast('Agency updated.', 'success'); this.isModalOpen = false; this.load(); },
        error: err => this.showToast(err.error?.error ?? 'Could not update agency.', 'danger')
      });
    } else {
      if (!this.form.password) {
        this.showToast('Password is required for the new agency account.', 'warning');
        return;
      }
      const dto: CreateAgencyDto = {
        name: this.form.name.trim(),
        description: this.form.description,
        email: this.form.email || undefined,
        password: this.form.password,
        managerUserIds: this.selectedManagerIds
      };
      this.agencyService.create(dto).subscribe({
        next: () => { this.showToast('Agency created.', 'success'); this.isModalOpen = false; this.load(); },
        error: err => this.showToast(err.error?.error ?? 'Could not create agency.', 'danger')
      });
    }
  }

  // ── Detail / actions ───────────────────────────────
  openDetail(agency: AgencyDto) {
    this.editingAgency = agency;
    this.isModalOpen = true;
    this.form = { name: agency.name, description: agency.description ?? '', email: '', password: '', isActive: agency.isActive };
    this.selectedManagerIds = agency.managers.map(m => m.userId);
    this.loadUsers();
  }

  openCrm(agency: AgencyDto) {
    window.location.href = `/agency-crm/${agency.id}`;
  }

  async confirmDelete(agency: AgencyDto) {
    const alert = await this.alertController.create({
      header: 'Delete Agency',
      message: `Delete "${agency.name}"? Its login account and all CRM data will be removed.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete', role: 'destructive', handler: () => {
            this.agencyService.delete(agency.id).subscribe({
              next: () => { this.showToast('Agency deleted.', 'success'); this.load(); },
              error: err => this.showToast(err.error?.error ?? 'Could not delete agency.', 'danger')
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async resetPassword(agency: AgencyDto) {
    const alert = await this.alertController.create({
      header: 'Reset Agency Password',
      message: `Enter a new password for the "${agency.name}" login account.`,
      inputs: [{ name: 'password', type: 'password', placeholder: 'New password' }],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Reset', handler: data => {
            if (!data?.password) { this.showToast('Password is required.', 'warning'); return false; }
            this.agencyService.resetPassword(agency.id, data.password).subscribe({
              next: () => this.showToast('Password reset.', 'success'),
              error: err => this.showToast(err.error?.error ?? 'Could not reset password.', 'danger')
            });
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({ message, color, duration: 2500, position: 'bottom' });
    await toast.present();
  }
}