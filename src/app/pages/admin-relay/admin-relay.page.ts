import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastController, ModalController, AlertController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { RelayService } from './../../services/relay-service';
import { 
  RelayCampaign, 
  RelaySequence, 
  RelayEmailVariant, 
  RelayLead, 
  RelayCampaignLead, 
  RelayEmailAccount, 
  OverallStatisticsDto, 
  AccountStatisticsDto, 
  LeadStatisticsDto, 
  RelayEmail, 
  VariantStatisticsDto,
  CampaignStatisticsDto
} from './../../models/dtos/relay-dto.model';

@Component({
  selector: 'app-admin-relay',
  templateUrl: './admin-relay.page.html',
  styleUrls: ['./admin-relay.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class AdminRelayPage implements OnInit {
  loading = false;
  submitting = false;
  segmentValue = 'campaigns';

  // Campaigns
  campaigns: RelayCampaign[] = [];
  campaignStats: Record<number, CampaignStatisticsDto | undefined> = {};
  overallStats: OverallStatisticsDto | null = null;
  selectedCampaignId: number | null = null;

  // Sequences
  sequences: RelaySequence[] = [];
  selectedSequenceId: number | null = null;

  // Variants
  variants: RelayEmailVariant[] = [];

  // Leads
  campaignLeads: RelayLead[] = [];

  // Forms
  campaignForm: RelayCampaign = {
    name: '',
    dailySendLimit: 50,
    timeZone: 'America/New_York',
    sendingWindowStart: 9,
    sendingWindowEnd: 17,
    sendingDays: 'Mon,Tue,Wed,Thu,Fri',
    minutesBetweenEmails: 5,
    status: 'Draft',
  };

  sequenceForm: RelaySequence = {
    campaignId: 0,
    stepNumber: 1,
    delayDays: 0,
    stepType: 'Initial',
    isActive: true,
  };

  variantForm: RelayEmailVariant = {
    sequenceId: 0,
    variantName: '',
    subject: '',
    body: '',
    trafficPercentage: 50,
    isActive: true,
  };

  leadForm: RelayLead = {
    email: '',
    firstName: '',
    lastName: '',
    companyName: '',
    jobTitle: '',
  };

  actionBusy: Record<number, boolean> = {};

  constructor(
    private relayService: RelayService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(event?: any): void {
    this.loading = true;

    let pending = 1;
    const done = (): void => {
      pending -= 1;
      if (pending === 0) {
        this.loading = false;
        if (event) event.target.complete();
      }
    };

    this.relayService.getCampaigns().subscribe({
      next: (campaigns) => {
        this.campaigns = campaigns || [];
        if (!this.selectedCampaignId && this.campaigns[0]?.id) {
          this.selectedCampaignId = this.campaigns[0].id;
        }
        done();
      },
      error: async () => {
        await this.showToast('Could not load campaigns.', 'danger');
        done();
      }
    });

    this.loadOverallStatistics();
  }

  loadOverallStatistics(): void {
    this.relayService.getOverallStatistics().subscribe({
      next: (stats) => {
        this.overallStats = stats;
      },
      error: () => {
        // Error handled silently
      }
    });
  }

  // CAMPAIGN MANAGEMENT
  createCampaign(): void {
    if (!this.campaignForm.name.trim()) {
      void this.showToast('Campaign name is required.', 'warning');
      return;
    }

    this.submitting = true;
    this.relayService.createCampaign(this.campaignForm).subscribe({
      next: async () => {
        this.submitting = false;
        this.campaignForm = {
          name: '',
          dailySendLimit: 50,
          timeZone: 'America/New_York',
          sendingWindowStart: 9,
          sendingWindowEnd: 17,
          sendingDays: 'Mon,Tue,Wed,Thu,Fri',
          minutesBetweenEmails: 5,
          status: 'Draft',
        };
        await this.showToast('Campaign created successfully.', 'success');
        this.loadData();
      },
      error: async (err) => {
        this.submitting = false;
        await this.showToast(err?.error?.error || 'Could not create campaign.', 'danger');
      }
    });
  }

  startCampaign(campaign: RelayCampaign): void {
    if (!campaign.id) return;

    this.actionBusy[campaign.id] = true;
    this.relayService.startCampaign(campaign.id).subscribe({
      next: async () => {
        this.actionBusy[campaign.id!] = false;
        await this.showToast('Campaign started successfully.', 'success');
        this.loadData();
      },
      error: async (err) => {
        this.actionBusy[campaign.id!] = false;
        await this.showToast(err?.error?.error || 'Could not start campaign.', 'danger');
      }
    });
  }

  pauseCampaign(campaign: RelayCampaign): void {
    if (!campaign.id) return;

    this.actionBusy[campaign.id] = true;
    this.relayService.pauseCampaign(campaign.id).subscribe({
      next: async () => {
        this.actionBusy[campaign.id!] = false;
        await this.showToast('Campaign paused successfully.', 'success');
        this.loadData();
      },
      error: async (err) => {
        this.actionBusy[campaign.id!] = false;
        await this.showToast(err?.error?.error || 'Could not pause campaign.', 'danger');
      }
    });
  }

  completeCampaign(campaign: RelayCampaign): void {
    if (!campaign.id) return;

    this.actionBusy[campaign.id] = true;
    this.relayService.completeCampaign(campaign.id).subscribe({
      next: async () => {
        this.actionBusy[campaign.id!] = false;
        await this.showToast('Campaign completed successfully.', 'success');
        this.loadData();
      },
      error: async (err) => {
        this.actionBusy[campaign.id!] = false;
        await this.showToast(err?.error?.error || 'Could not complete campaign.', 'danger');
      }
    });
  }

  deleteCampaign(campaign: RelayCampaign): void {
    if (!campaign.id) return;

    this.actionBusy[campaign.id] = true;
    this.relayService.deleteCampaign(campaign.id).subscribe({
      next: async () => {
        this.actionBusy[campaign.id!] = false;
        delete this.campaignStats[campaign.id!];
        await this.showToast('Campaign deleted successfully.', 'success');
        this.loadData();
      },
      error: async (err) => {
        this.actionBusy[campaign.id!] = false;
        await this.showToast(err?.error?.error || 'Could not delete campaign.', 'danger');
      }
    });
  }

  loadCampaignStatistics(campaign: RelayCampaign): void {
    if (!campaign.id) return;

    this.actionBusy[campaign.id] = true;
    this.relayService.getCampaignStatistics(campaign.id).subscribe({
      next: async (stats) => {
        this.campaignStats[campaign.id!] = stats;
        this.actionBusy[campaign.id!] = false;
        await this.showToast('Statistics loaded.', 'success');
      },
      error: async (err) => {
        this.actionBusy[campaign.id!] = false;
        await this.showToast(err?.error?.error || 'Could not load statistics.', 'danger');
      }
    });
  }

  exportCampaignData(campaign: RelayCampaign): void {
    if (!campaign.id) return;

    this.actionBusy[campaign.id] = true;
    this.relayService.exportCampaignData(campaign.id).subscribe({
      next: async (blob) => {
        this.actionBusy[campaign.id!] = false;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `campaign-${campaign.id}-export-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
        await this.showToast('Campaign exported successfully.', 'success');
      },
      error: async (err) => {
        this.actionBusy[campaign.id!] = false;
        await this.showToast(err?.error?.error || 'Could not export campaign.', 'danger');
      }
    });
  }

  onCampaignSelect(): void {
    if (this.selectedCampaignId) {
      this.sequenceForm.campaignId = this.selectedCampaignId;
      this.loadCampaignSequences();
    }
  }

  // SEQUENCE MANAGEMENT
  loadCampaignSequences(): void {
    if (!this.selectedCampaignId) return;

    this.relayService.getCampaignSequences(this.selectedCampaignId).subscribe({
      next: (sequences) => {
        this.sequences = sequences || [];
      },
      error: () => {
        this.sequences = [];
      }
    });
  }

  createSequence(): void {
    if (!this.sequenceForm.campaignId) {
      void this.showToast('Select a campaign first.', 'warning');
      return;
    }

    this.submitting = true;
    this.relayService.createSequence(this.sequenceForm).subscribe({
      next: async () => {
        this.submitting = false;
        this.sequenceForm = {
          campaignId: this.selectedCampaignId || 0,
          stepNumber: 1,
          delayDays: 0,
          stepType: 'Initial',
          isActive: true,
        };
        await this.showToast('Sequence created successfully.', 'success');
        this.loadCampaignSequences();
      },
      error: async (err) => {
        this.submitting = false;
        await this.showToast(err?.error?.error || 'Could not create sequence.', 'danger');
      }
    });
  }

  onSequenceSelect(): void {
    if (this.selectedSequenceId) {
      this.variantForm.sequenceId = this.selectedSequenceId;
      this.loadVariants();
    }
  }

  // VARIANT MANAGEMENT
  loadVariants(): void {
    if (!this.selectedSequenceId) return;

    this.relayService.getSequenceVariants(this.selectedSequenceId).subscribe({
      next: (variants) => {
        this.variants = variants || [];
      },
      error: () => {
        this.variants = [];
      }
    });
  }

  createVariant(): void {
    if (!this.variantForm.sequenceId) {
      void this.showToast('Select a sequence first.', 'warning');
      return;
    }

    if (!this.variantForm.variantName.trim() || !this.variantForm.subject.trim() || !this.variantForm.body.trim()) {
      void this.showToast('All variant fields are required.', 'warning');
      return;
    }

    this.submitting = true;
    this.relayService.createEmailVariant(this.variantForm).subscribe({
      next: async () => {
        this.submitting = false;
        this.variantForm = {
          sequenceId: this.selectedSequenceId || 0,
          variantName: '',
          subject: '',
          body: '',
          trafficPercentage: 50,
          isActive: true,
        };
        await this.showToast('Email variant created successfully.', 'success');
        this.loadVariants();
      },
      error: async (err) => {
        this.submitting = false;
        await this.showToast(err?.error?.error || 'Could not create variant.', 'danger');
      }
    });
  }

  // LEAD MANAGEMENT
  createLead(): void {
    if (!this.leadForm.email.trim()) {
      void this.showToast('Email address is required.', 'warning');
      return;
    }

    this.submitting = true;
    this.relayService.createLead(this.leadForm).subscribe({
      next: async () => {
        this.submitting = false;
        this.leadForm = {
          email: '',
          firstName: '',
          lastName: '',
          companyName: '',
          jobTitle: '',
        };
        await this.showToast('Lead created successfully.', 'success');
      },
      error: async (err) => {
        this.submitting = false;
        await this.showToast(err?.error?.error || 'Could not create lead.', 'danger');
      }
    });
  }

  importLeadsFromCSV(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n');
      const leads: RelayLead[] = [];

      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const [email, firstName, lastName, company, jobTitle] = lines[i].split(',').map(s => s.trim());
        if (email) {
          leads.push({ email, firstName, lastName, companyName: company, jobTitle });
        }
      }

      if (leads.length === 0) {
        await this.showToast('No leads found in CSV.', 'warning');
        return;
      }

      this.submitting = true;
      this.relayService.importLeads(leads).subscribe({
        next: async (result) => {
          this.submitting = false;
          await this.showToast(`${result.importedCount} leads imported successfully.`, 'success');
        },
        error: async (err) => {
          this.submitting = false;
          await this.showToast(err?.error?.error || 'Could not import leads.', 'danger');
        }
      });
    };
    reader.readAsText(file);
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
