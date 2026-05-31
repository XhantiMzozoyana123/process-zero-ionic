import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { LeadIntent, LeadLake, LeadLakeIndustry } from 'src/app/models/entities/leadlake.model';
import { ExtractHealthResponse, ExtractScrapeResponse, ExtractService } from 'src/app/services/extract-service';

@Component({
  selector: 'app-admin-extract',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './admin-extract.page.html',
  styleUrls: ['./admin-extract.page.scss'],
})
export class AdminExtractPage implements OnInit {
  keyword = '';
  location = '';
  pages = 1;

  loading = false;
  healthChecking = false;
  health: ExtractHealthResponse | null = null;
  scrapeResult: ExtractScrapeResponse | null = null;
  scrapedLeads: LeadLake[] = [];

  readonly pageOptions = [1, 2, 3, 4, 5];

  constructor(
    private extractService: ExtractService,
    private toastController: ToastController
  ) {}

  ngOnInit(): void {
    this.checkHealth();
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
        await this.showToast(err?.error?.error || 'Could not reach extract service.', 'danger');
      },
    });
  }

  scrape(): void {
    const keyword = this.keyword.trim();
    const location = this.location.trim();
    if (!keyword || !location) {
      void this.showToast('Keyword and location are required.', 'warning');
      return;
    }

    this.loading = true;
    this.extractService.scrapeLeads(keyword, location, this.pages).subscribe({
      next: async (result) => {
        this.scrapeResult = result;
        this.scrapedLeads = result?.leads || [];
        this.loading = false;
        await this.showToast(result?.message || 'Lead extraction completed.', 'success');
      },
      error: async (err) => {
        this.loading = false;
        this.scrapeResult = null;
        this.scrapedLeads = [];
        await this.showToast(err?.error || err?.error?.message || 'Lead extraction failed.', 'danger');
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

  private async showToast(message: string, color: 'success' | 'danger' | 'warning'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 2200,
      position: 'top',
    });
    await toast.present();
  }
}
