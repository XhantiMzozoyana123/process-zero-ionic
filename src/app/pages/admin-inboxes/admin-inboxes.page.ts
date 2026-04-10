import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { AdminInboxService } from 'src/app/services/admin-inbox-service';
import { Inbox } from 'src/app/models/entities/inbox.model';

@Component({
  selector: 'app-admin-inboxes',
  templateUrl: './admin-inboxes.page.html',
  styleUrls: ['./admin-inboxes.page.scss'],
  standalone: false
})
export class AdminInboxesPage implements OnInit {
  inboxes: Inbox[] = [];
  loading = false;
  searchTerm = '';

  viewMode: 'table' | 'cards' = 'table';

  isDetailModalOpen = false;
  detailInbox: Inbox | null = null;

  isFormModalOpen = false;
  editingInboxId?: number;
  inboxForm: FormGroup;
  submitting = false;
  showPassword = false;

  constructor(
    private inboxService: AdminInboxService,
    private fb: FormBuilder,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.inboxForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      smtpHost: ['', Validators.required],
      smtpPort: [587, [Validators.required, Validators.min(1), Validators.max(65535)]],
      smtpUseSsl: [true],
      imapHost: ['', Validators.required],
      imapPort: [993, [Validators.required, Validators.min(1), Validators.max(65535)]],
      imapUseSsl: [true],
      isPrimary: [false]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  get filteredInboxes(): Inbox[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.inboxes;
    return this.inboxes.filter(inbox => {
      const haystack = [
        inbox.username,
        inbox.smtpHost,
        inbox.imapHost,
        inbox.isPrimary ? 'primary' : ''
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(term);
    });
  }

  loadData(): void {
    this.loading = true;
    this.inboxService.getAll().subscribe({
      next: res => {
        this.inboxes = res;
        this.loading = false;
      },
      error: () => {
        this.showToast('Could not load inboxes.', 'danger');
        this.loading = false;
      }
    });
  }

  refresh(event: any): void {
    this.inboxService.getAll().subscribe({
      next: res => {
        this.inboxes = res;
        event.target.complete();
      },
      error: () => {
        this.showToast('Could not refresh data.', 'danger');
        event.target.complete();
      }
    });
  }

  // ── Detail modal ────────────────────────────
  openDetailModal(inbox: Inbox): void {
    this.detailInbox = inbox;
    this.isDetailModalOpen = true;
  }

  closeDetailModal(): void {
    this.isDetailModalOpen = false;
    this.detailInbox = null;
  }

  // ── Form modal ──────────────────────────────
  openAddModal(): void {
    this.editingInboxId = undefined;
    this.inboxForm.reset({
      smtpPort: 587,
      smtpUseSsl: true,
      imapPort: 993,
      imapUseSsl: true,
      isPrimary: false
    });
    this.showPassword = false;
    this.isFormModalOpen = true;
  }

  openEditModal(inbox: Inbox): void {
    this.editingInboxId = inbox.id;
    this.inboxForm.patchValue({
      username: inbox.username,
      password: inbox.password,
      smtpHost: inbox.smtpHost,
      smtpPort: inbox.smtpPort,
      smtpUseSsl: inbox.smtpUseSsl,
      imapHost: inbox.imapHost,
      imapPort: inbox.imapPort,
      imapUseSsl: inbox.imapUseSsl,
      isPrimary: inbox.isPrimary
    });
    this.showPassword = false;
    this.isFormModalOpen = true;
  }

  closeFormModal(): void {
    this.isFormModalOpen = false;
    this.editingInboxId = undefined;
  }

  saveInbox(): void {
    if (this.inboxForm.invalid) {
      this.inboxForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const val = this.inboxForm.getRawValue();
    const payload: Inbox = {
      username: val.username.trim(),
      password: val.password,
      smtpHost: val.smtpHost.trim(),
      smtpPort: +val.smtpPort,
      smtpUseSsl: !!val.smtpUseSsl,
      imapHost: val.imapHost.trim(),
      imapPort: +val.imapPort,
      imapUseSsl: !!val.imapUseSsl,
      isPrimary: !!val.isPrimary
    };

    if (this.editingInboxId) {
      const existing = this.inboxes.find(i => i.id === this.editingInboxId);
      payload.id = this.editingInboxId;
      payload.userId = existing?.userId;
      payload.createdAt = existing?.createdAt;
      payload.updatedAt = existing?.updatedAt;
      this.inboxService.update(this.editingInboxId, payload).subscribe({
        next: () => { this.showToast('Inbox updated.', 'success'); this.submitting = false; this.closeFormModal(); this.loadData(); },
        error: () => { this.showToast('Could not update inbox.', 'danger'); this.submitting = false; }
      });
    } else {
      this.inboxService.create(payload).subscribe({
        next: () => { this.showToast('Inbox created.', 'success'); this.submitting = false; this.closeFormModal(); this.loadData(); },
        error: () => { this.showToast('Could not create inbox.', 'danger'); this.submitting = false; }
      });
    }
  }

  async deleteInbox(inbox: Inbox): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete inbox?',
      message: `Remove inbox "${inbox.username}"? This cannot be undone.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete', role: 'destructive', handler: () => {
            this.inboxService.delete(inbox.id!).subscribe({
              next: () => {
                this.showToast('Inbox deleted.', 'success');
                this.closeDetailModal();
                this.loadData();
              },
              error: () => { this.showToast('Could not delete inbox.', 'danger'); }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  isInvalid(name: string): boolean {
    const ctrl = this.inboxForm.get(name);
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastController.create({ message, color, duration: 2500, position: 'bottom' });
    await toast.present();
  }
}
