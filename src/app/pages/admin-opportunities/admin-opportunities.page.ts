import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { MeetingService } from 'src/app/services/meeting-service';
import { ContactService } from 'src/app/services/contact-service';
import { ProductService } from 'src/app/services/product-service';
import { MeetingDto } from 'src/app/models/dtos/meeting-dto.model';
import { Contact } from 'src/app/models/entities/contact.model';
import { Product } from 'src/app/models/entities/product.model';
import { OpportunityStatus, OpportunityStatusLabels } from 'src/app/models/entities/meeting.model';

@Component({
  selector: 'app-admin-opportunities',
  templateUrl: './admin-opportunities.page.html',
  styleUrls: ['./admin-opportunities.page.scss'],
  standalone: false
})
export class AdminOpportunitiesPage implements OnInit {
  opportunities: MeetingDto[] = [];
  contacts: Contact[] = [];
  products: Product[] = [];
  loading = false;
  searchTerm = '';
  isFormOpen = false;
  submitting = false;
  editingOpportunity: MeetingDto | null = null;

  opportunityForm: FormGroup;

  OpportunityStatus = OpportunityStatus;
  OpportunityStatusLabels = OpportunityStatusLabels;

  constructor(
    private meetingService: MeetingService,
    private contactService: ContactService,
    private productService: ProductService,
    private fb: FormBuilder,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    this.opportunityForm = this.fb.group({
      contactId: [null, Validators.required],
      productId: [null, Validators.required],
      meetingDate: ['', Validators.required],
      notes: [''],
      budget: [null],
      commission: [null],
      contactName: ['', Validators.required],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactCompany: [''],
      opportunityStatus: [OpportunityStatus.Available]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.productService.getAll().subscribe({ next: products => { this.products = products; }, error: () => {} });
    this.contactService.getAll().subscribe({ next: contacts => { this.contacts = contacts; }, error: () => {} });
    this.meetingService.getAvailableOpportunities().subscribe({
      next: (data) => {
        this.opportunities = data;
        this.loading = false;
      },
      error: () => {
        this.showToast('Could not load opportunities.', 'danger');
        this.loading = false;
      }
    });
  }

  get filteredOpportunities(): MeetingDto[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.opportunities;
    return this.opportunities.filter(o => {
      const haystack = [o.contactName, o.contactCompany, o.product?.name, o.meeting?.notes].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(term);
    });
  }

  openAddModal(): void {
    this.editingOpportunity = null;
    this.opportunityForm.reset({
      contactId: null,
      productId: null,
      meetingDate: '',
      notes: '',
      budget: null,
      commission: null,
      contactName: '',
      contactEmail: '',
      contactCompany: '',
      opportunityStatus: OpportunityStatus.Available
    });
    this.isFormOpen = true;
  }

  openEditModal(opp: MeetingDto): void {
    this.editingOpportunity = opp;
    this.opportunityForm.patchValue({
      contactId: opp.contact?.id,
      productId: opp.product?.id,
      meetingDate: opp.meeting?.meetingDate || '',
      notes: opp.meeting?.notes || '',
      budget: opp.budget ?? null,
      commission: opp.commission ?? null,
      contactName: opp.contactName || '',
      contactEmail: opp.contactEmail || '',
      contactCompany: opp.contactCompany || '',
      opportunityStatus: opp.opportunityStatus ?? OpportunityStatus.Available
    });
    this.isFormOpen = true;
  }

  closeForm(): void {
    this.isFormOpen = false;
    this.editingOpportunity = null;
  }

  saveOpportunity(): void {
    if (this.opportunityForm.invalid) {
      this.opportunityForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const val = this.opportunityForm.getRawValue();
    const contact = this.contacts.find(c => c.id === val.contactId);
    const product = this.products.find(p => p.id === val.productId);
    if (!contact || !product) {
      this.showToast('Select a valid contact and product.', 'warning');
      this.submitting = false;
      return;
    }

    const meetingDto: MeetingDto = {
      userId: this.editingOpportunity?.userId || '',
      contact,
      product,
      meeting: {
        clientId: val.contactId,
        productId: val.productId,
        meetingDate: val.meetingDate,
        notes: val.notes || ''
      },
      budget: val.budget,
      commission: val.commission,
      opportunityStatus: val.opportunityStatus,
      contactName: val.contactName,
      contactEmail: val.contactEmail,
      contactCompany: val.contactCompany
    };

    const isEdit = !!this.editingOpportunity;
    const save$ = isEdit
      ? this.meetingService.updateMeeting(meetingDto.meeting.id!, meetingDto, val.notes)
      : this.meetingService.createMeeting(meetingDto, val.notes);

    save$.subscribe({
      next: () => {
        this.showToast(isEdit ? 'Opportunity updated.' : 'Opportunity created.', 'success');
        this.submitting = false;
        this.closeForm();
        this.loadData();
      },
      error: () => {
        this.showToast('Could not save opportunity.', 'danger');
        this.submitting = false;
      }
    });
  }

  async updateStatus(opp: MeetingDto, status: OpportunityStatus): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Update Status',
      message: `Set status to <strong>${OpportunityStatusLabels[status]}</strong>?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Update',
          handler: () => {
            this.meetingService.updateOpportunityStatus(opp.meeting.id!, status).subscribe({
              next: () => {
                this.showToast('Status updated.', 'success');
                this.loadData();
              },
              error: () => this.showToast('Could not update status.', 'danger')
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async confirmDelete(opp: MeetingDto): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Delete Opportunity',
      message: `Remove opportunity for <strong>${opp.contactName || 'this prospect'}</strong>?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.meetingService.deleteMeeting(opp.meeting.id!).subscribe({
              next: () => {
                this.showToast('Opportunity deleted.', 'success');
                this.loadData();
              },
              error: () => this.showToast('Could not delete opportunity.', 'danger')
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