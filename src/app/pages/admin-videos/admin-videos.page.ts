import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AlertController, IonicModule, ToastController } from '@ionic/angular';
import { CommonModule, DatePipe, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VideoService } from 'src/app/services/video-service';
import { Video } from 'src/app/models/entities/video.model';

@Component({
  selector: 'app-admin-videos',
  templateUrl: './admin-videos.page.html',
  styleUrls: ['./admin-videos.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, DatePipe, SlicePipe]
})
export class AdminVideosPage implements OnInit {
  videos: Video[] = [];
  loading = false;
  searchTerm = '';

  isDetailModalOpen = false;
  detailVideo: Video | null = null;

  isFormModalOpen = false;
  editingVideoId?: number;
  videoForm: FormGroup;
  submitting = false;

  constructor(
    private videoService: VideoService,
    private fb: FormBuilder,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.videoForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      youtubeUrl: ['', [Validators.required, this.youtubeUrlValidator.bind(this)]],
      thumbnailBase64: ['']
    });
  }

  ngOnInit() {
    this.loadVideos();
  }

  loadVideos(): void {
    this.loading = true;
    this.videoService.getAll().subscribe({
      next: res => { this.videos = res; this.loading = false; },
      error: () => { this.showToast('Could not load videos.', 'danger'); this.loading = false; }
    });
  }

  refresh(event: any): void {
    this.videoService.getAll().subscribe({
      next: res => { this.videos = res; event.target.complete(); },
      error: () => { this.showToast('Could not refresh videos.', 'danger'); event.target.complete(); }
    });
  }

  // ── Detail modal ────────────────────────────
  openDetailModal(video: Video): void {
    this.detailVideo = video;
    this.isDetailModalOpen = true;
  }

  closeDetailModal(): void {
    this.isDetailModalOpen = false;
    this.detailVideo = null;
  }

  // ── Form modal ──────────────────────────────
  openAddModal(): void {
    this.editingVideoId = undefined;
    this.videoForm.reset();
    this.isFormModalOpen = true;
  }

  openEditModal(video: Video): void {
    this.editingVideoId = video.id;
    this.videoForm.patchValue({
      title: video.title ?? '',
      description: video.description ?? '',
      youtubeUrl: video.youtubeUrl ?? '',
      thumbnailBase64: video.thumbnailBase64 ?? ''
    });
    this.isFormModalOpen = true;
  }

  closeFormModal(): void {
    this.isFormModalOpen = false;
    this.editingVideoId = undefined;
  }

  saveVideo(): void {
    if (this.videoForm.invalid) {
      this.videoForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const val = this.videoForm.getRawValue();
    const payload: Video = {
      title: val.title.trim(),
      description: val.description?.trim() || undefined,
      youtubeUrl: val.youtubeUrl?.trim() || undefined,
      thumbnailBase64: val.thumbnailBase64?.trim() || undefined
    };

    if (this.editingVideoId) {
      const existing = this.videos.find(w => w.id === this.editingVideoId);
      payload.id = this.editingVideoId;
      payload.createdAt = existing?.createdAt;
      this.videoService.update(this.editingVideoId, payload).subscribe({
        next: () => { this.showToast('Video updated.', 'success'); this.submitting = false; this.closeFormModal(); this.loadVideos(); },
        error: () => { this.showToast('Could not update video.', 'danger'); this.submitting = false; }
      });
    } else {
      this.videoService.create(payload).subscribe({
        next: () => { this.showToast('Video created.', 'success'); this.submitting = false; this.closeFormModal(); this.loadVideos(); },
        error: () => { this.showToast('Could not create video.', 'danger'); this.submitting = false; }
      });
    }
  }

  async deleteVideo(video: Video): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete video?',
      message: `Remove "${video.title}"? This cannot be undone.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete', role: 'destructive', handler: () => {
            this.videoService.delete(video.id!).subscribe({
              next: () => { this.videos = this.videos.filter(w => w.id !== video.id); this.showToast('Video deleted.', 'success'); this.closeDetailModal(); },
              error: () => { this.showToast('Could not delete video.', 'danger'); }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  isInvalid(name: string): boolean {
    const ctrl = this.videoForm.get(name);
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