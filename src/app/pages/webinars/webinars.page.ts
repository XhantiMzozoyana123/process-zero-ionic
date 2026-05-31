import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IonicModule, ToastController } from '@ionic/angular';
import { Webinar } from 'src/app/models/entities/webinar.model';
import { WebinarService } from 'src/app/services/webinar-service';

@Component({
  selector: 'app-webinars',
  templateUrl: './webinars.page.html',
  styleUrls: ['./webinars.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class WebinarsPage implements OnInit {
  webinars: Webinar[] = [];
  selectedWebinar: Webinar | null = null;
  loading = false;
  errorMessage = '';
  searchTerm = '';

  constructor(
    private webinarService: WebinarService,
    private toastCtrl: ToastController,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadWebinars();
  }

  get filteredWebinars(): Webinar[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.webinars;
    }

    return this.webinars.filter((webinar) => {
      const haystack = [webinar.title, webinar.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }

  get embedUrl(): SafeResourceUrl | null {
    if (!this.selectedWebinar?.youtubeUrl) {
      return null;
    }

    const videoId = this.extractYoutubeId(this.selectedWebinar.youtubeUrl);
    if (!videoId) {
      return null;
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${videoId}`
    );
  }

  private extractYoutubeId(url: string): string | null {
    if (!url) return null;
    
    // Handle full URLs
    const embedMatch = url.match(/embed\/([A-Za-z0-9_-]{11})/);
    if (embedMatch?.[1]) {
      return embedMatch[1];
    }

    // Handle youtu.be short URLs
    const shortMatch = url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
    if (shortMatch?.[1]) {
      return shortMatch[1];
    }

    // Handle standard watch URLs
    const watchMatch = url.match(/[?&]v=([A-Za-z0-9_-]{11})/);
    if (watchMatch?.[1]) {
      return watchMatch[1];
    }

    // If it's just an 11-character ID, return as-is
    const idMatch = url.match(/^([A-Za-z0-9_-]{11})$/);
    return idMatch?.[1] ?? null;
  }

  loadWebinars(event?: any): void {
    this.loading = true;
    this.errorMessage = '';

    this.webinarService.getAll().subscribe({
      next: (webinars) => {
        this.webinars = webinars;
        this.loading = false;
        if (event) {
          event.target.complete();
        }
      },
      error: async () => {
        this.errorMessage = 'Could not load webinars.';
        this.loading = false;
        if (event) {
          event.target.complete();
        }
        await this.showToast('Unable to load webinars', 'danger');
      },
    });
  }

  refresh(event: any): void {
    this.loadWebinars(event);
  }

  selectWebinar(webinar: Webinar): void {
    this.selectedWebinar = webinar;
  }

  onSearchChange(): void {
    // Search is handled by the filteredWebinars getter
  }

  clearSelection(): void {
    this.selectedWebinar = null;
  }

  thumbnailUrl(webinar: Webinar): string {
    return webinar.thumbnailBase64;
  }

  private async showToast(message: string, color: 'success' | 'danger'): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'top',
    });
    await toast.present();
  }
}
