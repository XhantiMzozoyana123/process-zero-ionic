import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AlertController, ToastController } from '@ionic/angular';

import { LeadLake, LeadLakeIndustry, LeadIntent } from 'src/app/models/entities/leadlake.model';
import { LeadlakeService } from 'src/app/services/leadlake-service';
import { IntroService } from 'src/app/services/intro-service';


@Component({
  selector: 'app-admin-leadlake',
  templateUrl: './admin-leadlake.page.html',
  styleUrls: ['./admin-leadlake.page.scss'],
  standalone: false
})
export class AdminLeadlakePage implements OnInit {

  leads: LeadLake[] = [];
  filteredLeads: LeadLake[] = [];
  loading = false;
  uploading = false;

  searchTerm = '';
  selectedIndustry?: LeadLakeIndustry;
  currentPage = 1;
  pageSize = 25;
  readonly pageSizeOptions = [10, 25, 50, 100];

  // CSV upload state
  isUploadModalOpen = false;
  csvFile: File | null = null;
  csvFileName = '';
  parsedLeads: LeadLake[] = [];
  parseError = '';

  // Create / edit form state
  isFormModalOpen = false;
  saving = false;
  editingId: number | null = null;
  formError = '';
  formLead: LeadLake = this.emptyLead();

  private readonly industryValues = Object.values(LeadLakeIndustry) as LeadLakeIndustry[];

  industries: Array<{ label: string; value: LeadLakeIndustry }> = this.industryValues
    .map(v => ({ label: v, value: v }));

  readonly intentValues = Object.values(LeadIntent) as LeadIntent[];

        constructor(
    private leadService: LeadlakeService,
    private introService: IntroService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}


  ngOnInit() {
    this.loadLeads();
  }

  startTour(): void {
    this.introService.startLeadLakeTour();
  }

  // ── Data loading ──────────────────────────────────────
  loadLeads() {
    this.loading = true;
    this.leadService.getAll().subscribe({
      next: (data) => {
        this.leads = (data || []).map(l => ({
          ...l,
          industry: this.normalizeIndustry((l as any).industry)
        }));
        this.filterLeads();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load leads', err);
        this.loading = false;
      }
    });
  }

  refresh(event: any) {
    this.leadService.getAll().subscribe({
      next: (data) => {
        this.leads = (data || []).map(l => ({
          ...l,
          industry: this.normalizeIndustry((l as any).industry)
        }));
        this.filterLeads();
        event.target.complete();
      },
      error: () => event.target.complete()
    });
  }

  // ── Filtering & pagination ────────────────────────────
  filterLeads() {
    this.currentPage = 1;
    const term = this.searchTerm?.toLowerCase() || '';

    this.filteredLeads = this.leads.filter(l => {
      const matchesSearch = !term ||
        l.firstName?.toLowerCase().includes(term) ||
        l.lastName?.toLowerCase().includes(term) ||
        l.email?.toLowerCase().includes(term) ||
        l.company?.toLowerCase().includes(term) ||
        l.location?.toLowerCase().includes(term) ||
        this.getIndustryLabel(l.industry).toLowerCase().includes(term);

      const matchesIndustry = this.selectedIndustry === undefined ||
        this.normalizeIndustry(l.industry) === this.selectedIndustry;

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

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredLeads.length / this.pageSize));
  }

  get pagedLeads(): LeadLake[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredLeads.slice(start, start + this.pageSize);
  }

  get pageRangeLabel(): string {
    if (!this.filteredLeads.length) return '0–0';
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.filteredLeads.length);
    return `${start}–${end}`;
  }

  changePageSize() {
    this.currentPage = 1;
    this.ensureValidPage();
  }

  previousPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  getIndustryLabel(industry: unknown): string {
    return this.normalizeIndustry(industry);
  }

  trackByLeadId(_: number, lead: LeadLake): number | string {
    return lead.id ?? lead.email;
  }

  // ── CSV Upload ────────────────────────────────────────
  downloadTemplate() {
    const header = 'email,firstName,lastName,phone,company,job,location,industry';
    const example = 'jane@example.com,Jane,Doe,+27821234567,Acme Corp,Sales Manager,Cape Town,Technology';
    const csv = header + '\n' + example + '\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  openUploadModal() {
    this.csvFile = null;
    this.csvFileName = '';
    this.parsedLeads = [];
    this.parseError = '';
    this.isUploadModalOpen = true;
  }

  closeUploadModal() {
    this.isUploadModalOpen = false;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.parseError = 'Please select a .csv file.';
      this.csvFile = null;
      this.csvFileName = '';
      this.parsedLeads = [];
      return;
    }

    this.csvFile = file;
    this.csvFileName = file.name;
    this.parseError = '';
    this.parsedLeads = [];

    const reader = new FileReader();
    reader.onload = () => {
      try {
        this.parsedLeads = this.parseCsv(reader.result as string);
        if (this.parsedLeads.length === 0) {
          this.parseError = 'No valid leads found in the CSV file.';
        }
      } catch (e: any) {
        this.parseError = e.message || 'Failed to parse CSV file.';
        this.parsedLeads = [];
      }
    };
    reader.readAsText(file);
  }

  uploadLeads() {
    if (!this.parsedLeads.length || this.uploading) return;

    this.uploading = true;
    this.leadService.addBatch(this.parsedLeads).subscribe({
      next: async (res) => {
        this.uploading = false;
        this.closeUploadModal();
        await this.showToast(`Successfully uploaded ${res.added} leads.`, 'success');
        this.loadLeads();
      },
      error: async (err) => {
        this.uploading = false;
        console.error('Upload failed', err);
        const msg = err?.error?.error || err?.error?.title || 'Failed to upload leads.';
        await this.showToast(msg, 'danger');
      }
    });
  }

  // ── Create / Edit / Delete ────────────────────────────
  openCreateModal() {
    this.editingId = null;
    this.formError = '';
    this.formLead = this.emptyLead();
    this.isFormModalOpen = true;
  }

  openEditModal(lead: LeadLake) {
    this.editingId = lead.id ?? null;
    this.formError = '';
    this.formLead = {
      ...lead,
      industry: this.normalizeIndustry(lead.industry)
    };
    this.isFormModalOpen = true;
  }

  closeFormModal() {
    this.isFormModalOpen = false;
  }

  saveLead() {
    if (this.saving) return;

    const email = (this.formLead.email || '').trim();
    if (!email) {
      this.formError = 'Email is required.';
      return;
    }

    this.formError = '';
    this.saving = true;

    const payload: LeadLake = { ...this.formLead, email };

    const request$: Observable<unknown> = this.editingId != null
      ? this.leadService.update(this.editingId, payload)
      : this.leadService.create(payload);


    request$.subscribe({
      next: async () => {
        this.saving = false;
        const wasEditing = this.editingId != null;
        this.closeFormModal();
        await this.showToast(wasEditing ? 'Lead updated.' : 'Lead created.', 'success');
        this.loadLeads();
      },
      error: async (err: any) => {
        this.saving = false;
        console.error('Save failed', err);

        const msg = err?.error?.error || err?.error?.title || 'Failed to save lead.';
        this.formError = msg;
        await this.showToast(msg, 'danger');
      }
    });
  }

  async confirmDelete(lead: LeadLake) {
    if (lead.id == null) return;

    const alert = await this.alertCtrl.create({
      header: 'Delete lead',
      message: `Delete ${lead.firstName || ''} ${lead.lastName || ''} (${lead.email})? This cannot be undone.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => this.deleteLead(lead.id as number)
        }
      ]
    });
    await alert.present();
  }

  private deleteLead(id: number) {
    this.leadService.delete(id).subscribe({
      next: async () => {
        this.leads = this.leads.filter(l => l.id !== id);
        this.filterLeads();
        await this.showToast('Lead deleted.', 'success');
      },
      error: async (err) => {
        console.error('Delete failed', err);
        const msg = err?.error?.error || err?.error?.title || 'Failed to delete lead.';
        await this.showToast(msg, 'danger');
      }
    });
  }

  private emptyLead(): LeadLake {
    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      job: '',
      location: '',
      industry: LeadLakeIndustry.Other,
      intent: LeadIntent.Low
    };
  }

  // ── CSV parser ────────────────────────────────────────
  private parseCsv(raw: string): LeadLake[] {

    const lines = raw.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row.');

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z]/g, ''));

    const colMap: Record<string, number> = {};
    const expectedCols = ['firstname', 'lastname', 'email', 'phone', 'company', 'job', 'location', 'industry'];
    for (const col of expectedCols) {
      const idx = headers.findIndex(h => h === col);
      if (idx >= 0) colMap[col] = idx;
    }

    if (colMap['email'] === undefined) {
      throw new Error('CSV must include an "email" column.');
    }

    const leads: LeadLake[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = this.splitCsvLine(lines[i]);
      const get = (key: string) => (colMap[key] !== undefined ? (cols[colMap[key]] || '').trim() : '');

      const email = get('email');
      if (!email) continue;

      leads.push({
        firstName: get('firstname'),
        lastName: get('lastname'),
        email,
        phone: get('phone'),
        company: get('company'),
        job: get('job'),
        location: get('location'),
        industry: this.normalizeIndustry(get('industry') || 'Other'),
      });
    }

    return leads;
  }

  private splitCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }

    result.push(current);
    return result;
  }

  // ── Helpers ───────────────────────────────────────────
  private normalizeIndustry(value: unknown): LeadLakeIndustry {
    if (typeof value === 'number') {
      return this.industryValues[value] || LeadLakeIndustry.Other;
    }
    if (typeof value === 'string') {
      const normalized = value.replace(/[^a-zA-Z]/g, '').toLowerCase();
      const match = this.industryValues.find(v =>
        v.replace(/[^a-zA-Z]/g, '').toLowerCase() === normalized
      );
      return match || LeadLakeIndustry.Other;
    }
    return LeadLakeIndustry.Other;
  }

  private ensureValidPage() {
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    if (this.currentPage < 1) this.currentPage = 1;
  }

  private async showToast(message: string, color: 'success' | 'danger'): Promise<void> {
    const toast = await this.toastCtrl.create({ message, duration: 2500, color, position: 'top' });
    await toast.present();
  }
}
