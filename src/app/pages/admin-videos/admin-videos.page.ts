import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AlertController, IonicModule, ToastController } from '@ionic/angular';
import { CommonModule, DatePipe, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebinarService } from 'src/app/services/webinar-service';
import { Webinar } from 'src/app/models/entities/webinar.model';

@Component({
  selector: 'app-admin-webinars',
  templateUrl: './admin-webinars.page.html',
  styleUrls: ['./admin-webinars.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, DatePipe, SlicePipe]
})
export class AdminWebinarsPage implements OnInit {
  webinars: Webinar[] = [];
  loading = false;
  searchTerm = '';

  isDetailModalOpen = false;
  detailWebinar: Webinar | null = null;

  isFormModalOpen = false;
  editingWebinarId?: number;
  webinarForm: FormGroup;
  submitting = false;

  constructor(
    private webinarService: WebinarService,
    private fb: FormBuilder,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.webinarForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      youtubeUrl: ['', [Validators.required, this.youtubeUrlValidator.bind(this)]],
      thumbnailBase64: ['']
    });
  }

  ngOnInit() {
    this.loadWebinars();
  }

  loadWebinars(): void {
    this.loading = true;
    this.webinarService.getAll().subscribe({
      next: res => { this.webinars = res; this.loading = false; },
      error: () => { this.showToast('Could not load webinars.', 'danger'); this.loading = false; }
    });
  }

  refresh(event: any): void {
    this.webinarService.getAll().subscribe({
      next: res => { this.webinars = res; event.target.complete(); },
      error: () => { this.showToast('Could not refresh webinars.', 'danger'); event.target.complete(); }
    });
  }

  // ── Detail modal ────────────────────────────
  openDetailModal(webinar: Webinar): void {
    this.detailWebinar = webinar;
    this.isDetailModalOpen = true;
  }

  closeDetailModal(): void {
    this.isDetailModalOpen = false;
    this.detailWebinar = null;
  }

  // ── Form modal ──────────────────────────────
  openAddModal(): void {
    this.editingWebinarId = undefined;
    this.webinarForm.reset();
    this.isFormModalOpen = true;
  }

  openEditModal(webinar: Webinar): void {
    this.editingWebinarId = webinar.id;
    this.webinarForm.patchValue({
      title: webinar.title ?? '',
      description: webinar.description ?? '',
      youtubeUrl: webinar.youtubeUrl ?? '',
      thumbnailBase64: webinar.thumbnailBase64 ?? ''
    });
    this.isFormModalOpen = true;
  }

  closeFormModal(): void {
    this.isFormModalOpen = false;
    this.editingWebinarId = undefined;
  }

  saveWebinar(): void {
    if (this.webinarForm.invalid) {
      this.webinarForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const val = this.webinarForm.getRawValue();
    const payload: Webinar = {
      title: val.title.trim(),
      description: val.description?.trim() || undefined,
      youtubeUrl: val.youtubeUrl?.trim() || undefined,
      thumbnailBase64: val.thumbnailBase64?.trim() || undefined
    };

    if (this.editingWebinarId) {
      const existing = this.webinars.find(w => w.id === this.editingWebinarId);
      payload.id = this.editingWebinarId;
      payload.createdAt = existing?.createdAt;
      this.webinarService.update(this.editingWebinarId, payload).subscribe({
        next: () => { this.showToast('Webinar updated.', 'success'); this.submitting = false; this.closeFormModal(); this.loadWebinars(); },
        error: () => { this.showToast('Could not update webinar.', 'danger'); this.submitting = false; }
      });
    } else {
      this.webinarService.create(payload).subscribe({
        next: () => { this.showToast('Webinar created.', 'success'); this.submitting = false; this.closeFormModal(); this.loadWebinars(); },
        error: () => { this.showToast('Could not create webinar.', 'danger'); this.submitting = false; }
      });
    }
  }

  async deleteWebinar(webinar: Webinar): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete webinar?',
      message: `Remove "${webinar.title}"? This cannot be undone.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete', role: 'destructive', handler: () => {
            this.webinarService.delete(webinar.id!).subscribe({
              next: () => { this.webinars = this.webinars.filter(w => w.id !== webinar.id); this.showToast('Webinar deleted.', 'success'); this.closeDetailModal(); },
              error: () => { this.showToast('Could not delete webinar.', 'danger'); }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  isInvalid(name: string): boolean {
    const ctrl = this.webinarForm.get(name);
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  private youtubeUrlValidator(control: any): { [key: string]: boolean } | null {
    if (!control.value) return { required: true };
    const url = control.value.trim();
    // Check for various YouTube URL formats
    const patterns = [
      /youtube\.com\/watch\?v=[A-Za-z0-9_-]{11}/,
      /youtu\.be\/[A-Za-z0-9_-]{11}/,
      /youtube\.com\/embed\/[A-Za-z0-9_-]{11}/,
      /^[A-Za-z0-9_-]{11}$/
    ];
    const valid = patterns.some(pattern => pattern.test(url));
    return valid ? null : { invalidYoutubeUrl: true };
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastController.create({ message, color, duration: 2500, position: 'bottom' });
    await toast.present();
  }
}