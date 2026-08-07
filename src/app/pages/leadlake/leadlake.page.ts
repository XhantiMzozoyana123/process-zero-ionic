import { Component, OnInit } from '@angular/core';
import { LeadLake, LeadLakeIndustry, LeadIntent } from 'src/app/models/entities/leadlake.model';
import { LeadlakeService } from 'src/app/services/leadlake-service';
import { ContactService } from 'src/app/services/contact-service';
import { ToastController } from '@ionic/angular';
import { IntroService } from 'src/app/services/intro-service';

@Component({
  selector: 'app-leadlake',
  standalone: false,
  templateUrl: './leadlake.page.html',
  styleUrls: ['./leadlake.page.scss'],
})
export class LeadlakePage implements OnInit {

  leadLakeIndustry = LeadLakeIndustry;
  leadIntent = LeadIntent;

  leads: LeadLake[] = [];
  filteredLeads: LeadLake[] = [];

  searchTerm: string = '';
  selectedIndustry?: LeadLakeIndustry;
  currentPage = 1;
  pageSize = 25;
  readonly pageSizeOptions = [10, 25, 50, 100];
  private readonly industryValues = Object.values(LeadLakeIndustry) as LeadLakeIndustry[];

  // Keep explicit label/value pairs so template comparisons stay type-safe.
  industries: Array<{ label: string; value: LeadLakeIndustry }> = Object.values(LeadLakeIndustry)
    .map((value) => ({
      label: value,
      value
    }));

  constructor(
    private leadService: LeadlakeService,
    private contactService: ContactService,
    private toastCtrl: ToastController,
    private introService: IntroService
  ) {}

  ngOnInit() {
    this.loadLeads();
  }

  startTour(): void {
    this.introService.startLeadLakeTour();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredLeads.length / this.pageSize));
  }

  get pagedLeads(): LeadLake[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredLeads.slice(start, start + this.pageSize);
  }

  get pageRangeLabel(): string {
    if (!this.filteredLeads.length) {
      return '0-0';
    }

    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.filteredLeads.length);
    return `${start}-${end}`;
  }

  loadLeads() {
    this.leadService.getAll().subscribe({
      next: (data) => {
        this.leads = (data || []).map((lead) => ({
          ...lead,
          industry: this.normalizeIndustryValue((lead as any).industry)
        }));
        this.filterLeads(); // ✅ always apply filters after load
      },
      error: (err) => {
        console.error('Failed to load leads', err);
      }
    });
  }

  filterLeads() {
    this.currentPage = 1;
    const term = this.searchTerm?.toLowerCase() || '';

    this.filteredLeads = this.leads.filter(l => {
      const industryLabel = this.getIndustryLabel(l.industry).toLowerCase();

      const matchesSearch =
        !term ||
        (l.firstName?.toLowerCase().includes(term)) ||
        (l.lastName?.toLowerCase().includes(term)) ||
        (l.company?.toLowerCase().includes(term)) ||
        (l.email?.toLowerCase().includes(term)) ||
        (l.location?.toLowerCase().includes(term)) ||
        industryLabel.includes(term);

      const matchesIndustry =
        this.selectedIndustry !== undefined
          ? this.normalizeIndustryValue(l.industry) === this.selectedIndustry
          : true;

      return matchesSearch && matchesIndustry;
    });

    this.ensureValidPage();
  }

  selectIndustry(industry: LeadLakeIndustry) {
    this.selectedIndustry = industry;
    this.filterLeads();
  }

  clearIndustryFilter() {
    this.selectedIndustry = undefined;
    this.filterLeads();
  }

  getIndustryLabel(industry: unknown): string {
    return this.normalizeIndustryValue(industry);
  }

  changePageSize() {
    this.currentPage = 1;
    this.ensureValidPage();
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  trackByLeadId(_: number, lead: LeadLake): number | string {
    return lead.id ?? lead.email;
  }

  getIntentEmoji(intent: LeadIntent | undefined | null): string {
    switch (intent) {
      case LeadIntent.High:
        return '🔥';
      case LeadIntent.Medium:
        return '⚡';
      case LeadIntent.Low:
        return '🧊';
      default:
        return '—';
    }
  }

  getIntentLabel(intent: LeadIntent | undefined | null): string {
    return intent ?? '—';
  }

  promoteToClient(lead: LeadLake) {
    const payload = {
      firstName: (lead.firstName || '').trim(),
      lastName: (lead.lastName || '').trim(),
      email: (lead.email || '').trim(),
      phone: (lead.phone || '').trim(),
      company: (lead.company || '').trim(),
      job: (lead.job || '').trim(),
      location: (lead.location || '').trim(),
      industry: this.toIndustryApiValue(lead.industry),
    };

    if (!payload.firstName || !payload.lastName || !payload.email) {
      this.showToast('Lead is missing required fields (first name, last name, or email).', 'warning');
      return;
    }

    this.contactService.create(payload).subscribe({
      next: async () => {
        await this.showToast(`${payload.firstName} ${payload.lastName} added to Contacts.`, 'success');
        setTimeout(() => window.location.reload(), 600);
      },
      error: async (err) => {
        console.error('Error promoting lead', err);
        const backendMessage = this.extractBackendMessage(err);
        await this.showToast(backendMessage || 'Failed to add to Contacts.', 'danger');
      }
    });
  }

  private normalizeIndustryValue(value: unknown): LeadLakeIndustry {
    if (typeof value === 'number') {
      return this.industryValues[value] || LeadLakeIndustry.Other;
    }

    if (typeof value === 'string') {
      const normalized = value.replace(/[^a-zA-Z]/g, '').toLowerCase();
      const match = this.industryValues.find((industry) =>
        industry.replace(/[^a-zA-Z]/g, '').toLowerCase() === normalized
      );

      return match || LeadLakeIndustry.Other;
    }

    return LeadLakeIndustry.Other;
  }

  private toIndustryApiValue(industry: unknown): number {
    const normalized = this.normalizeIndustryValue(industry);
    const index = this.industryValues.findIndex((value) => value === normalized);
    return index >= 0 ? index : 0;
  }

  private ensureValidPage() {
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    if (this.currentPage < 1) {
      this.currentPage = 1;
    }
  }

  private extractBackendMessage(err: any): string {
    const errors = err?.error?.errors;
    const modelStateMessage = errors
      ? Object.values(errors)
          .reduce((acc: string[], value) => {
            if (Array.isArray(value)) {
              return acc.concat(value as string[]);
            }

            if (typeof value === 'string') {
              acc.push(value);
            }

            return acc;
          }, [])
          .join(' ')
      : '';

    return err?.error?.error || err?.error?.title || modelStateMessage || '';
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger'): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2200,
      color,
      position: 'top'
    });

    await toast.present();
  }
}