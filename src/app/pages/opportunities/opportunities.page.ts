import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { MeetingService } from 'src/app/services/meeting-service';
import { IntroService } from 'src/app/services/intro-service';
import { MeetingDto } from 'src/app/models/dtos/meeting-dto.model';
import { OpportunityStatus, OpportunityStatusLabels } from 'src/app/models/entities/meeting.model';

@Component({
  selector: 'app-opportunities',
  templateUrl: './opportunities.page.html',
  styleUrls: ['./opportunities.page.scss'],
  standalone: false
})
export class OpportunitiesPage implements OnInit {
  availableOpportunities: MeetingDto[] = [];
  myOpportunities: MeetingDto[] = [];
  loading = false;
  searchTerm = '';
  currentTab: 'available' | 'my' = 'available';

  OpportunityStatus = OpportunityStatus;
  OpportunityStatusLabels = OpportunityStatusLabels;

  constructor(
    private meetingService: MeetingService,
    private introService: IntroService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  startTour(): void {
    this.introService.startOpportunitiesTour();
  }

  loadData(): void {
    this.loading = true;
    this.loadAvailable();
    this.loadMy();
  }

  loadAvailable(): void {
    this.meetingService.getAvailableOpportunities().subscribe({
      next: (data) => {
        this.availableOpportunities = data;
        this.loading = false;
      },
      error: () => {
        this.showToast('Could not load available opportunities.', 'danger');
        this.loading = false;
      }
    });
  }

  loadMy(): void {
    this.meetingService.getMyOpportunities().subscribe({
      next: (data) => {
        this.myOpportunities = data;
      },
      error: () => {
        this.showToast('Could not load your opportunities.', 'danger');
      }
    });
  }

  get filteredAvailable(): MeetingDto[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.availableOpportunities;
    return this.availableOpportunities.filter(o => {
      const name = [o.contactName, o.contactCompany, o.product.name, o.meeting.notes].filter(Boolean).join(' ').toLowerCase();
      return name.includes(term);
    });
  }

  get filteredMy(): MeetingDto[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.myOpportunities;
    return this.myOpportunities.filter(o => {
      const name = [o.contactName, o.contactCompany, o.product.name, o.meeting.notes].filter(Boolean).join(' ').toLowerCase();
      return name.includes(term);
    });
  }

  get displayList(): MeetingDto[] {
    return this.currentTab === 'available' ? this.filteredAvailable : this.filteredMy;
  }

  switchTab(tab: 'available' | 'my'): void {
    this.currentTab = tab;
  }

  async claimOpportunity(opportunity: MeetingDto): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Claim Opportunity',
      message: `Claim this opportunity for <strong>${opportunity.contactName || 'this prospect'}</strong>?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Claim',
          handler: () => {
            this.meetingService.claimOpportunity(opportunity.meeting.id!).subscribe({
              next: () => {
                this.showToast('Opportunity claimed successfully!', 'success');
                this.loadData();
              },
              error: (err) => {
                this.showToast(err.error?.message || 'Could not claim opportunity.', 'danger');
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  getStatusColor(status?: OpportunityStatus): string {
    switch (status) {
      case OpportunityStatus.Available: return 'primary';
      case OpportunityStatus.Claimed: return 'warning';
      case OpportunityStatus.InProgress: return 'tertiary';
      case OpportunityStatus.Closed: return 'success';
      case OpportunityStatus.Cancelled: return 'danger';
      default: return 'medium';
    }
  }

  formatCurrency(value?: number): string {
    if (value == null) return '—';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  initials(name?: string): string {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    const first = parts[0]?.charAt(0) || '';
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return (first + last || first || '?').toUpperCase();
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastCtrl.create({ message, color, duration: 2500, position: 'bottom' });
    await toast.present();
  }
}