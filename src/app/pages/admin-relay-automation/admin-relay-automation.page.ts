import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule, ToastController } from '@ionic/angular';
import { RelayAutomationService } from '../../services/relay-automation-service';
import { LeadlakeService } from '../../services/leadlake-service';
import { LeadLake } from '../../models/entities/leadlake.model';
import {
  CampaignSummaryDto,
  CampaignDetailDto,
  CampaignJobDto,
  ImportJobDto,
  ImportStatusDto,
  CreateSequenceRequest,
  CreateSequenceStepRequest,
  CreateEmailVariantRequest,
} from '../../models/dtos/relay-automation-dto.model';


type SegmentValue = 'campaigns' | 'leads';

@Component({
  selector: 'app-admin-relay-automation',
  templateUrl: './admin-relay-automation.page.html',
  styleUrls: ['./admin-relay-automation.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class AdminRelayAutomationPage implements OnInit, OnDestroy {
  segmentValue: SegmentValue = 'campaigns';

  // ── Create campaign ──
  newCampaignName = '';
  newCampaignDescription = '';
  newCampaignDailyLimit: number | null = null;
  newCampaignStartDate: string | null = null;
  newCampaignEndDate: string | null = null;
  creatingCampaign = false;

  // ── Sequence builder (campaign -> sequences -> steps -> A/B variants) ──
  // Local working copy used to compose the full-campaign create request.
  newSequences: CreateSequenceRequest[] = [];



  // ── Campaign list ──
  campaigns: CampaignSummaryDto[] = [];
  loadingCampaigns = false;

  // ── Selected campaign / detail ──
  selectedCampaignId: number | null = null;
  campaignDetail: CampaignDetailDto | null = null;
  loadingDetail = false;
  campaignActionBusy = false;

  // ── Edit metadata ──
  editName = '';
  editDescription = '';
  editDailyLimit: number | null = null;
  editStartDate: string | null = null;
  editEndDate: string | null = null;


  // ── LeadLake picker (visual lead selection) ──
  leadLakeLeads: LeadLake[] = [];
  leadLakeLoading = false;
  leadLakeError = '';
  leadSearch = '';
  selectedLeadIds = new Set<number>();
  leadBatchMode: 'add' | 'remove' = 'add';
  leadBatchBusy = false;

  // ── CSV import ──
  importFile: File | null = null;
  importBusy = false;
  importJob: ImportJobDto | null = null;
  importStatus: ImportStatusDto | null = null;
  private importPollHandle: ReturnType<typeof setInterval> | null = null;

  // ── Launch (sequence engine) ──
  launchBusy = false;
  lastJob: CampaignJobDto | null = null;

  constructor(
    private relay: RelayAutomationService,
    private leadlake: LeadlakeService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit(): void {
    this.loadCampaigns();
    this.loadLeadLake();
  }

  ngOnDestroy(): void {
    this.stopImportPolling();
  }

  // ───────────── Campaign list ─────────────
  loadCampaigns(): void {
    this.loadingCampaigns = true;
    this.relay.listCampaigns(0, 100).subscribe({
      next: (rows) => {
        this.loadingCampaigns = false;
        this.campaigns = rows || [];
      },
      error: async (err) => {
        this.loadingCampaigns = false;
        await this.showToast(this.errMessage(err, 'Could not load campaigns.'), 'danger');
      },
    });
  }

  // ───────────── Create campaign ─────────────
  createCampaign(): void {
    const name = this.newCampaignName.trim();
    if (!name) {
      void this.showToast('Campaign name is required.', 'warning');
      return;
    }

    // Validate the sequence builder (only if the admin started composing one).
    const sequencesError = this.validateSequences();
    if (sequencesError) {
      void this.showToast(sequencesError, 'warning');
      return;
    }

    const sequences = this.buildSequencesPayload();

    this.creatingCampaign = true;
    this.relay
      .createCampaign({
        name,
        description: this.newCampaignDescription.trim() || undefined,
        dailySendLimit: this.newCampaignDailyLimit ?? undefined,
        startDate: this.toIsoDate(this.newCampaignStartDate),
        endDate: this.toIsoDate(this.newCampaignEndDate),
        sequences: sequences.length ? sequences : undefined,
      })
      .subscribe({
        next: async (campaign) => {
          this.creatingCampaign = false;
          this.newCampaignName = '';
          this.newCampaignDescription = '';
          this.newCampaignDailyLimit = null;
          this.newCampaignStartDate = null;
          this.newCampaignEndDate = null;
          this.newSequences = [];
          await this.showToast('Campaign created.', 'success');

          this.loadCampaigns();
          if (campaign?.id) {
            this.selectCampaign(campaign.id);
          }
        },
        error: async (err) => {
          this.creatingCampaign = false;
          await this.showToast(this.errMessage(err, 'Could not create campaign.'), 'danger');
        },
      });
  }

  // ───────────── Sequence builder (sequences -> steps -> A/B variants) ─────────────
  addSequence(): void {
    this.newSequences.push({
      name: `Sequence ${this.newSequences.length + 1}`,
      messageRotationEnabled: false,
      inboxRotationEnabled: false,
      steps: [],
    });
  }

  removeSequence(seqIndex: number): void {
    this.newSequences.splice(seqIndex, 1);
  }

  addStep(seqIndex: number): void {
    const seq = this.newSequences[seqIndex];
    if (!seq) return;
    seq.steps = seq.steps ?? [];
    const nextOrder = seq.steps.length + 1;
    seq.steps.push({
      name: `Step ${nextOrder}`,
      stepOrder: nextOrder,
      delayDays: nextOrder === 1 ? 0 : 2,
      isActive: true,
      variants: [{ subject: '', htmlBody: '', variantName: 'A', weight: 100 }],
    });
  }

  removeStep(seqIndex: number, stepIndex: number): void {
    const seq = this.newSequences[seqIndex];
    if (!seq?.steps) return;
    seq.steps.splice(stepIndex, 1);
    // Re-number remaining steps so StepOrder stays sequential.
    seq.steps.forEach((s, i) => (s.stepOrder = i + 1));
  }

  addVariant(seqIndex: number, stepIndex: number): void {
    const step = this.newSequences[seqIndex]?.steps?.[stepIndex];
    if (!step) return;
    step.variants = step.variants ?? [];
    const letter = String.fromCharCode(65 + step.variants.length); // A, B, C…
    step.variants.push({ subject: '', htmlBody: '', variantName: letter, weight: 50 });
  }

  removeVariant(seqIndex: number, stepIndex: number, variantIndex: number): void {
    const step = this.newSequences[seqIndex]?.steps?.[stepIndex];
    if (!step?.variants) return;
    step.variants.splice(variantIndex, 1);
    // Re-label remaining variants A, B, C…
    step.variants.forEach((v, i) => (v.variantName = String.fromCharCode(65 + i)));
  }

  trackByIndex(index: number): number {
    return index;
  }

  /** Drop empty optional collections so the request stays clean for the API. */
  private buildSequencesPayload(): CreateSequenceRequest[] {
    return this.newSequences.map((seq) => {
      const steps: CreateSequenceStepRequest[] = (seq.steps ?? []).map((step, i) => {
        const variants: CreateEmailVariantRequest[] = (step.variants ?? []).map((v) => ({
          subject: v.subject.trim(),
          htmlBody: v.htmlBody.trim(),
          variantName: v.variantName?.trim() || 'A',
          weight: v.weight ?? 50,
        }));
        return {
          name: step.name.trim(),
          stepOrder: step.stepOrder || i + 1,
          delayDays: step.delayDays ?? 0,
          isActive: step.isActive ?? true,
          variants: variants.length ? variants : undefined,
        };
      });
      return {
        name: seq.name.trim(),
        messageRotationEnabled: seq.messageRotationEnabled ?? false,
        inboxRotationEnabled: seq.inboxRotationEnabled ?? false,
        steps: steps.length ? steps : undefined,
      };
    });
  }

  /** Returns a user-facing error message, or null if the builder is valid. */
  private validateSequences(): string | null {
    for (const seq of this.newSequences) {
      if (!seq.name?.trim()) return 'Every sequence needs a name.';
      for (const step of seq.steps ?? []) {
        if (!step.name?.trim()) return `Each step in "${seq.name}" needs a name.`;
        for (const v of step.variants ?? []) {
          if (!v.subject?.trim() || !v.htmlBody?.trim()) {
            return `Each message in "${step.name}" needs a subject and body.`;
          }
        }
      }
    }
    return null;
  }


  // ───────────── Select / load detail ─────────────
  selectCampaign(campaignId: number): void {
    this.selectedCampaignId = campaignId;
    this.loadingDetail = true;
    this.campaignDetail = null;
    this.relay.getCampaign(campaignId).subscribe({
      next: (detail) => {
        this.loadingDetail = false;
        this.campaignDetail = detail;
        this.editName = detail?.name ?? '';
        this.editDescription = detail?.description ?? '';
        this.editDailyLimit = detail?.dailySendLimit ?? null;
        this.editStartDate = this.toDateInput(detail?.startDate);
        this.editEndDate = this.toDateInput(detail?.endDate);
      },

      error: async (err) => {
        this.loadingDetail = false;
        await this.showToast(this.errMessage(err, 'Could not load campaign.'), 'danger');
      },
    });
  }

  refreshDetail(): void {
    if (this.selectedCampaignId) {
      this.selectCampaign(this.selectedCampaignId);
    }
  }

  clearSelection(): void {
    this.selectedCampaignId = null;
    this.campaignDetail = null;
  }

  // ───────────── Update / activate / pause / delete ─────────────
  saveCampaign(): void {
    if (!this.selectedCampaignId) return;
    const name = this.editName.trim();
    if (!name) {
      void this.showToast('Campaign name is required.', 'warning');
      return;
    }
    this.campaignActionBusy = true;
    this.relay
      .updateCampaign(this.selectedCampaignId, {
        name,
        description: this.editDescription.trim(),
        dailySendLimit: this.editDailyLimit ?? undefined,
        startDate: this.toIsoDate(this.editStartDate),
        endDate: this.toIsoDate(this.editEndDate),
      })

      .subscribe({
        next: async () => {
          this.campaignActionBusy = false;
          await this.showToast('Campaign updated.', 'success');
          this.refreshDetail();
          this.loadCampaigns();
        },
        error: async (err) => {
          this.campaignActionBusy = false;
          await this.showToast(this.errMessage(err, 'Could not update campaign.'), 'danger');
        },
      });
  }

  activateCampaign(): void {
    if (!this.selectedCampaignId) return;
    this.campaignActionBusy = true;
    this.relay.activateCampaign(this.selectedCampaignId).subscribe({
      next: async (res) => {
        this.campaignActionBusy = false;
        await this.showToast(res?.message || 'Campaign activated.', 'success');
        this.refreshDetail();
        this.loadCampaigns();
      },
      error: async (err) => {
        this.campaignActionBusy = false;
        await this.showToast(this.errMessage(err, 'Could not activate campaign.'), 'danger');
      },
    });
  }

  pauseCampaign(): void {
    if (!this.selectedCampaignId) return;
    this.campaignActionBusy = true;
    this.relay.pauseCampaign(this.selectedCampaignId).subscribe({
      next: async (res) => {
        this.campaignActionBusy = false;
        await this.showToast(res?.message || 'Campaign paused.', 'success');
        this.refreshDetail();
        this.loadCampaigns();
      },
      error: async (err) => {
        this.campaignActionBusy = false;
        await this.showToast(this.errMessage(err, 'Could not pause campaign.'), 'danger');
      },
    });
  }

  async deleteCampaign(): Promise<void> {
    if (!this.selectedCampaignId) return;
    const alert = await this.alertController.create({
      header: 'Delete campaign?',
      message:
        'This removes the campaign and its lead memberships. Leads remain in your LeadLake.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => this.confirmDelete(),
        },
      ],
    });
    await alert.present();
  }

  private confirmDelete(): void {
    if (!this.selectedCampaignId) return;
    this.campaignActionBusy = true;
    this.relay.deleteCampaign(this.selectedCampaignId, true).subscribe({
      next: async (res) => {
        this.campaignActionBusy = false;
        await this.showToast(res?.message || 'Campaign deleted.', 'success');
        this.clearSelection();
        this.loadCampaigns();
      },
      error: async (err) => {
        this.campaignActionBusy = false;
        await this.showToast(this.errMessage(err, 'Could not delete campaign.'), 'danger');
      },
    });
  }

  // ───────────── Launch (start sequence engine) ─────────────
  launchCampaign(): void {
    if (!this.selectedCampaignId) return;
    this.launchBusy = true;
    this.relay.startCampaign(this.selectedCampaignId).subscribe({
      next: async (job) => {
        this.launchBusy = false;
        this.lastJob = job;
        await this.showToast(job?.message || 'Campaign processing started.', 'success');
        this.refreshDetail();
      },
      error: async (err) => {
        this.launchBusy = false;
        await this.showToast(this.errMessage(err, 'Could not start campaign.'), 'danger');
      },
    });
  }

  // ───────────── LeadLake picker ─────────────
  loadLeadLake(): void {
    this.leadLakeLoading = true;
    this.leadLakeError = '';
    this.leadlake.getAll().subscribe({
      next: (leads) => {
        this.leadLakeLoading = false;
        this.leadLakeLeads = (leads || []).filter((l) => l.id != null);
      },
      error: (err) => {
        this.leadLakeLoading = false;
        this.leadLakeError = this.errMessage(err, 'Could not load LeadLake.');
      },
    });
  }

  get filteredLeadLake(): LeadLake[] {
    const term = this.leadSearch.trim().toLowerCase();
    if (!term) {
      return this.leadLakeLeads;
    }
    return this.leadLakeLeads.filter((l) =>
      [l.firstName, l.lastName, l.email, l.company, l.job, l.industry]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }

  get selectedLeadCount(): number {
    return this.selectedLeadIds.size;
  }

  isLeadSelected(id?: number): boolean {
    return id != null && this.selectedLeadIds.has(id);
  }

  toggleLead(id?: number): void {
    if (id == null) return;
    if (this.selectedLeadIds.has(id)) {
      this.selectedLeadIds.delete(id);
    } else {
      this.selectedLeadIds.add(id);
    }
  }

  toggleSelectAllVisible(): void {
    const visible = this.filteredLeadLake;
    const allSelected = visible.length > 0 && visible.every((l) => this.isLeadSelected(l.id));
    if (allSelected) {
      visible.forEach((l) => l.id != null && this.selectedLeadIds.delete(l.id));
    } else {
      visible.forEach((l) => l.id != null && this.selectedLeadIds.add(l.id));
    }
  }

  clearLeadSelection(): void {
    this.selectedLeadIds.clear();
  }

  trackByLeadId(_: number, lead: LeadLake): number | string {
    return lead.id ?? lead.email;
  }

  // ───────────── Leads: batch apply ─────────────
  applyLeadBatch(): void {
    if (!this.selectedCampaignId) {
      void this.showToast('Select a campaign first (Campaigns tab).', 'warning');
      return;
    }
    const ids = Array.from(this.selectedLeadIds);
    if (!ids.length) {
      void this.showToast('Select at least one lead from the table.', 'warning');
      return;
    }

    this.leadBatchBusy = true;

    const request$ =
      this.leadBatchMode === 'add'
        ? this.relay.addLeads(this.selectedCampaignId, ids)
        : this.relay.removeLeads(this.selectedCampaignId, ids);

    request$.subscribe({
      next: async (res) => {
        this.leadBatchBusy = false;
        const added = res?.added ?? 0;
        const removed = res?.removed ?? 0;
        const errors = res?.errors ?? [];

        if (errors.length) {
          // Backend reports per-lead failures in BatchResultDto.Errors.
          await this.showToast(`Batch completed with ${errors.length} issue(s): ${errors[0]}`, 'warning');
        } else {
          const parts: string[] = [];
          if (added) parts.push(`${added} added`);
          if (removed) parts.push(`${removed} removed`);
          await this.showToast(parts.length ? parts.join(', ') + '.' : 'No changes applied.', 'success');
        }

        this.clearLeadSelection();
        this.refreshDetail();
        this.loadCampaigns();
      },

      error: async (err) => {
        this.leadBatchBusy = false;
        await this.showToast(
          this.errMessage(
            err,
            this.leadBatchMode === 'add' ? 'Could not add leads.' : 'Could not remove leads.'
          ),
          'danger'
        );
      },
    });
  }

  // ───────────── CSV import ─────────────
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (file && !file.name.toLowerCase().endsWith('.csv')) {
      void this.showToast('Only .csv files are accepted.', 'warning');
      this.importFile = null;
      input.value = '';
      return;
    }
    if (file && file.size > 10 * 1024 * 1024) {
      void this.showToast('File size cannot exceed 10 MB.', 'warning');
      this.importFile = null;
      input.value = '';
      return;
    }
    this.importFile = file;
  }

  uploadCsv(): void {
    if (!this.selectedCampaignId) {
      void this.showToast('Select a campaign first (Campaigns tab).', 'warning');
      return;
    }
    if (!this.importFile) {
      void this.showToast('Choose a CSV file first.', 'warning');
      return;
    }

    this.importBusy = true;
    this.importStatus = null;
    this.relay.importLeads(this.selectedCampaignId, this.importFile).subscribe({
      next: async (job) => {
        this.importBusy = false;
        this.importJob = job;
        await this.showToast('Import started. Tracking progress…', 'success');
        this.startImportPolling();
      },
      error: async (err) => {
        this.importBusy = false;
        await this.showToast(this.errMessage(err, 'Could not start import.'), 'danger');
      },
    });
  }

  get importProgress(): number {
    const total = this.importStatus?.totalRows ?? 0;
    const processed = this.importStatus?.processedRows ?? 0;
    if (!total) return 0;
    return Math.min(1, processed / total);
  }

  get importIsComplete(): boolean {
    const s = this.importStatus;
    if (!s) return false;
    return s.isComplete === true || s.status === 'Completed' || s.status === 'Failed';
  }

  private startImportPolling(): void {
    this.stopImportPolling();
    if (!this.selectedCampaignId || !this.importJob?.jobId) return;

    const campaignId = this.selectedCampaignId;
    const jobId = this.importJob.jobId;

    this.importPollHandle = setInterval(() => {
      this.relay.getImportStatus(campaignId, jobId).subscribe({
        next: (status) => {
          this.importStatus = status;
          if (this.importIsComplete) {
            this.stopImportPolling();
            const failed = status?.status === 'Failed';
            void this.showToast(
              failed
                ? `Import failed. ${status?.message ?? ''}`.trim()
                : 'Import complete.',
              failed ? 'danger' : 'success'
            );
            this.importFile = null;
            this.refreshDetail();
            this.loadCampaigns();
          }
        },
        error: () => {
          // transient errors are ignored; polling continues until complete
        },
      });
    }, 2000);
  }

  private stopImportPolling(): void {
    if (this.importPollHandle) {
      clearInterval(this.importPollHandle);
      this.importPollHandle = null;
    }
  }

  // ───────────── Helpers ─────────────
  /** Convert an <input type="date"> value (yyyy-MM-dd) to an ISO string for the API. */
  private toIsoDate(value: string | null | undefined): string | undefined {
    if (!value) return undefined;
    const d = new Date(value);
    return isNaN(d.getTime()) ? undefined : d.toISOString();
  }

  /** Convert an API ISO date into the yyyy-MM-dd value an <input type="date"> expects. */
  private toDateInput(value: string | null | undefined): string | null {
    if (!value) return null;
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10);
  }

  private errMessage(err: unknown, fallback: string): string {

    const e = err as {
      status?: number;
      error?: { error?: string; message?: string; detail?: string } | string;
    };

    // Server errors return a developer exception page (full HTML / stack trace).
    // That is meaningless to the user, so always show the clean fallback instead.
    if (typeof e?.status === 'number' && e.status >= 500) {
      return fallback;
    }

    if (typeof e?.error === 'string') {
      const raw = e.error.trim();
      // Ignore raw HTML pages or huge stack-trace dumps – they are not user-friendly.
      const looksLikeDump =
        !raw ||
        raw.length > 200 ||
        raw.startsWith('<') ||
        /System\.|Exception|StackTrace|at Microsoft\./i.test(raw);
      return looksLikeDump ? fallback : raw;
    }

    if (e?.error && typeof e.error === 'object') {
      return e.error.error || e.error.message || e.error.detail || fallback;
    }
    return fallback;
  }


  private async showToast(message: string, color: 'success' | 'danger' | 'warning'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 2400,
      position: 'top',
    });
    await toast.present();
  }
}
