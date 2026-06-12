import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { LeadIntent, LeadLake, LeadLakeIndustry } from 'src/app/models/entities/leadlake.model';
import {
  ExtractHealthResponse,
  ExtractService,
  SearchDto,
} from 'src/app/services/extract-service';
import { LeadlakeService } from 'src/app/services/leadlake-service';

@Component({
  selector: 'app-admin-extract',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './admin-extract.page.html',
  styleUrls: ['./admin-extract.page.scss'],
})
export class AdminExtractPage implements OnInit {
  // Single-run form (maps directly to the backend SearchDto)
  keywords = '';
  pageViewLimit = 1;
  containerUrl = '';

  // Batch queue of SearchDto rows
  batchRows: SearchDto[] = [];

  loading = false;
  batchLoading = false;
  healthChecking = false;
  leadsLoading = false;

  health: ExtractHealthResponse | null = null;
  lastMessage = '';
  scrapedLeads: LeadLake[] = [];

  readonly pageOptions = [1, 2, 3, 4, 5, 10];

  constructor(
    private extractService: ExtractService,
    private leadlakeService: LeadlakeService,
    private toastController: ToastController
  ) {}

  ngOnInit(): void {
    this.checkHealth();
    this.loadLeads();
  }

  get healthLabel(): string {
    if (this.healthChecking) {
      return 'Checking service...';
    }
    return this.health ? 'Extract service healthy' : 'Service unavailable';
  }

  checkHealth(): void {
    this.healthChecking = true;
    this.extractService.health().subscribe({
      next: (health) => {
        this.health = health;
        this.healthChecking = false;
      },
      error: async (err) => {
        this.healthChecking = false;
        this.health = null;
        await this.showToast(
          err?.error?.error || 'Could not reach extract service.',
          'danger'
        );
      },
    });
  }

  /**
   * POST /api/extract/run with a single SearchDto.
   */
  run(): void {
    const dto = this.buildSingleDto();
    if (!dto) {
      return;
    }

    this.loading = true;
    this.extractService.run(dto).subscribe({
      next: async (result) => {
        this.loading = false;
        this.lastMessage = result?.message || 'Extraction completed.';
        await this.showToast(this.lastMessage, 'success');
        this.loadLeads();
      },
      error: async (err) => {
        this.loading = false;
        await this.showToast(
          err?.error || err?.error?.message || 'Lead extraction failed.',
          'danger'
        );
      },
    });
  }

  /**
   * Add the current single-run form values to the batch queue.
   */
  addToBatch(): void {
    const dto = this.buildSingleDto();
    if (!dto) {
      return;
    }
    this.batchRows = [...this.batchRows, dto];
    void this.showToast('Added to batch queue.', 'success');
  }

  removeBatchRow(index: number): void {
    this.batchRows = this.batchRows.filter((_, i) => i !== index);
  }

  clearBatch(): void {
    this.batchRows = [];
  }

  /**
   * POST /api/extract/batch with the queued SearchDto rows.
   */
  runBatch(): void {
    if (!this.batchRows.length) {
      void this.showToast('Add at least one search to the batch.', 'warning');
      return;
    }

    this.batchLoading = true;
    this.extractService.batch(this.batchRows).subscribe({
      next: async (result) => {
        this.batchLoading = false;
        this.lastMessage =
          result?.message ||
          `Batch extraction started for ${result?.count ?? this.batchRows.length} searches.`;
        await this.showToast(this.lastMessage, 'success');
        this.loadLeads();
      },
      error: async (err) => {
        this.batchLoading = false;
        await this.showToast(
          err?.error || err?.error?.message || 'Batch extraction failed.',
          'danger'
        );
      },
    });
  }

  /**
   * Refresh saved leads from LeadLake (the extract API persists, it does not
   * return the scraped records directly).
   */
  loadLeads(): void {
    this.leadsLoading = true;
    this.leadlakeService.getAll().subscribe({
      next: (leads) => {
        this.scrapedLeads = leads || [];
        this.leadsLoading = false;
      },
      error: async (err) => {
        this.leadsLoading = false;
        await this.showToast(
          err?.error?.message || 'Could not load saved leads.',
          'danger'
        );
      },
    });
  }

  getIndustryLabel(industry: LeadLakeIndustry | string | undefined): string {
    return industry || 'Other';
  }

  getIntentLabel(intent: LeadIntent | string | undefined): string {
    return intent || 'Unspecified';
  }

  trackByLead(index: number, lead: LeadLake): string | number {
    return lead.id ?? lead.email ?? index;
  }

  trackByBatch(index: number): number {
    return index;
  }

  private buildSingleDto(): SearchDto | null {
    const keywords = this.keywords.trim();
    const containerUrl = this.containerUrl.trim();

    if (!keywords) {
      void this.showToast('Keywords are required.', 'warning');
      return null;
    }

    const pageViewLimit = Number(this.pageViewLimit) || 1;

    return {
      keywords,
      pageViewLimit,
      containerUrl,
    };
  }

  private async showToast(
    message: string,
    color: 'success' | 'danger' | 'warning'
  ): Promise<void> {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 2200,
      position: 'top',
    });
    await toast.present();
  }
}
