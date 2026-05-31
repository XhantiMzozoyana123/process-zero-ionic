import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { AdminClientService, PagedResult } from 'src/app/services/admin-client-service';
import { Contact, ContactStatus, ContactStatusLabels } from 'src/app/models/entities/contact.model';

@Component({
  selector: 'app-admin-clients',
  templateUrl: './admin-clients.page.html',
  styleUrls: ['./admin-clients.page.scss'],
  standalone: false
})
export class AdminClientsPage implements OnInit {
  clients: Contact[] = [];
  loading = false;
  searchTerm = '';
  totalCount = 0;
  viewMode: 'table' | 'cards' = 'table';
  currentPage = 1;
  pageSize = 3;

  isDetailModalOpen = false;
  detailClient: Contact | null = null;

  isFormModalOpen = false;
  editingClientId?: number;
  clientForm: FormGroup;
  submitting = false;

  statusOptions = [
    ContactStatus.Reached,
    ContactStatus.FollowUp,
    ContactStatus.Converted,
    ContactStatus.Active,
    ContactStatus.Deactivated,
  ];
  statusLabels = ContactStatusLabels;

  constructor(
    private clientService: AdminClientService,
    private fb: FormBuilder,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.clientForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      company: [''],
      job: [''],
      location: [''],
      closedAmount: [null],
      status: [ContactStatus.Active]
    });
  }

  ngOnInit() {
    this.loadClients();
  }

  get filteredClients(): Contact[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.clients;
    return this.clients.filter(c => {
      const haystack = [
        c.firstName, c.lastName, c.email,
        c.phone, c.company, c.job,
        c.location, c.status
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(term);
    });
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize) || 1;
  }

  get displayedClients(): Contact[] {
    return this.filteredClients;
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadClients();
    }
  }

  onSearchChange(): void {
  }

  loadClients(): void {
    this.loading = true;
    this.clientService.getAll(this.currentPage, this.pageSize).subscribe({
      next: res => { this.clients = res.items; this.totalCount = res.totalCount; this.loading = false; },
      error: () => { this.showToast('Could not load clients.', 'danger'); this.loading = false; }
    });
  }

  refresh(event: any): void {
    this.clientService.getAll(this.currentPage, this.pageSize).subscribe({
      next: res => { this.clients = res.items; this.totalCount = res.totalCount; event.target.complete(); },
      error: () => { this.showToast('Could not refresh clients.', 'danger'); event.target.complete(); }
    });
  }

  // ── Detail modal ────────────────────────────
  openDetailModal(client: Contact): void {
    this.detailClient = client;
    this.isDetailModalOpen = true;
  }

  closeDetailModal(): void {
    this.isDetailModalOpen = false;
    this.detailClient = null;
  }

  // ── Form modal ──────────────────────────────
  openAddModal(): void {
    this.editingClientId = undefined;
    this.clientForm.reset({ status: ContactStatus.Active });
    this.isFormModalOpen = true;
  }

  openEditModal(client: Contact): void {
    this.editingClientId = client.id;
    this.clientForm.patchValue({
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone ?? '',
      company: client.company ?? '',
      job: client.job ?? '',
      location: client.location ?? '',
      closedAmount: client.closedAmount ?? null,
      status: client.status ?? ContactStatus.Active
    });
    this.isFormModalOpen = true;
  }

  closeFormModal(): void {
    this.isFormModalOpen = false;
    this.editingClientId = undefined;
  }

  saveClient(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const val = this.clientForm.getRawValue();
    const payload: Contact = {
      firstName: val.firstName.trim(),
      lastName: val.lastName.trim(),
      email: val.email.trim(),
      phone: val.phone?.trim() || undefined,
      company: val.company?.trim() || undefined,
      job: val.job?.trim() || undefined,
      location: val.location?.trim() || undefined,
      closedAmount: val.closedAmount != null ? +val.closedAmount : undefined,
      status: val.status
    };

    if (this.editingClientId) {
      const existing = this.clients.find(c => c.id === this.editingClientId);
      payload.id = this.editingClientId;
      payload.userId = existing?.userId;
      payload.createdAt = existing?.createdAt;
      payload.updatedAt = existing?.updatedAt;
      this.clientService.update(this.editingClientId, payload).subscribe({
        next: () => { this.showToast('Client updated.', 'success'); this.submitting = false; this.closeFormModal(); this.loadClients(); },
        error: () => { this.showToast('Could not update client.', 'danger'); this.submitting = false; }
      });
    } else {
      this.clientService.create(payload).subscribe({
        next: () => { this.showToast('Client created.', 'success'); this.submitting = false; this.closeFormModal(); this.loadClients(); },
        error: () => { this.showToast('Could not create client.', 'danger'); this.submitting = false; }
      });
    }
  }

  async deleteClient(client: Contact): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete client?',
      message: `Remove ${client.firstName} ${client.lastName}? This cannot be undone.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete', role: 'destructive', handler: () => {
            this.clientService.delete(client.id!).subscribe({
              next: () => { this.showToast('Client deleted.', 'success'); this.closeDetailModal(); this.loadClients(); },
              error: () => { this.showToast('Could not delete client.', 'danger'); }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  isInvalid(name: string): boolean {
    const ctrl = this.clientForm.get(name);
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  getStatusLabel(status?: ContactStatus): string {
    if (status == null) return 'Unknown';
    return ContactStatusLabels[status] ?? 'Unknown';
  }

  getStatusColor(status?: ContactStatus): string {
    if (status == null) return 'medium';
    if (status === ContactStatus.Active) return 'success';
    if (status === ContactStatus.Converted) return 'primary';
    if (status === ContactStatus.FollowUp) return 'warning';
    if (status === ContactStatus.Reached) return 'tertiary';
    if (status === ContactStatus.Deactivated) return 'danger';
    return 'medium';
  }

  formatCurrency(value?: number): string {
    if (value == null) return '—';
    return 'R ' + value.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastController.create({ message, color, duration: 2500, position: 'bottom' });
    await toast.present();
  }
}
