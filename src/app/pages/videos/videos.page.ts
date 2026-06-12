import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IonicModule, ToastController } from '@ionic/angular';
import { Video } from 'src/app/models/entities/video.model';
import { VideoService } from 'src/app/services/video-service';
import { IntroService } from 'src/app/services/intro-service';


@Component({
  selector: 'app-videos',
  templateUrl: './videos.page.html',
  styleUrls: ['./videos.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class VideosPage implements OnInit {
  videos: Video[] = [];
  selectedVideo: Video | null = null;
  loading = false;
  errorMessage = '';
  searchTerm = '';

  viewMode: 'table' | 'cards' = 'cards';
  currentPage = 1;
  pageSize = 6;

  constructor(
    private videoService: VideoService,
    private toastCtrl: ToastController,
    private sanitizer: DomSanitizer,
    private introService: IntroService
  ) {}


  ngOnInit(): void {
    this.loadVideos();
  }

  startTour(): void {
    this.introService.startVideosTour();
  }

  get filteredVideos(): Video[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.videos;
    }

    return this.videos.filter((video) => {
      const haystack = [video.title, video.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }

  get displayedVideos(): Video[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredVideos.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredVideos.length / this.pageSize) || 1;
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }


  get embedUrl(): SafeResourceUrl | null {
    if (!this.selectedVideo?.youtubeUrl) {
      return null;
    }

    const videoId = this.extractYoutubeId(this.selectedVideo.youtubeUrl);
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

  loadVideos(event?: any): void {
    this.loading = true;
    this.errorMessage = '';

    this.videoService.getAll().subscribe({
      next: (videos) => {
        this.videos = videos;
        this.loading = false;
        if (event) {
          event.target.complete();
        }
      },
      error: async () => {
        this.errorMessage = 'Could not load videos.';
        this.loading = false;
        if (event) {
          event.target.complete();
        }
        await this.showToast('Unable to load videos', 'danger');
      },
    });
  }

  refresh(event: any): void {
    this.loadVideos(event);
  }

  selectVideo(video: Video): void {
    this.selectedVideo = video;
  }

  onSearchChange(): void {
    // Reset to first page; filtering is handled by the filteredVideos getter
    this.currentPage = 1;
  }


  clearSelection(): void {
    this.selectedVideo = null;
  }

  thumbnailUrl(video: Video): string {
    return video.thumbnailBase64;
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
