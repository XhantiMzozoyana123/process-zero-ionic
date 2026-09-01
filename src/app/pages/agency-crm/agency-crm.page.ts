import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import {
  AgencyService,
  AgencyDto,
  AgencyContact,
  AgencyDeal,
  AgencyActivity
} from 'src/app/services/agency-service';

export const AGENCY_STAGES = ['New', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];

@Component({
  selector: 'app-agency-crm',
  templateUrl: './agency-crm.page.html',
  styleUrls: ['./agency-crm.page.scss'],
  standalone: false
})
export class AgencyCrmPage implements OnInit {
  agencyId = 0;
  agency: AgencyDto | null = null;
  canWrite = false;
  loading = true;
  activeTab = 'dashboard';

  contacts: AgencyContact[] = [];
  deals: AgencyDeal[] = [];
  activities: AgencyActivity[] = [];

  readonly stages = AGENCY_STAGES;

  // Modal state
  contactModalOpen = false;
  editingContact: AgencyContact | null = null;
  contactForm: AgencyContact = { name: '' };

  dealModalOpen = false;
  editingDeal: AgencyDeal | null = null;
  dealForm: AgencyDeal = { title: '', contactId: 0, amount: 0, stage: 'New', probability: 50 };

  activityModalOpen = false;
  activityForm: AgencyActivity = { type: 'Note', subject: '' };

  constructor(
    private route: ActivatedRoute,
    private agencyService: AgencyService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.agencyId = id;
      this.refresh();
    }
  }

  refresh() {
    this.loading = true;
    this.agencyService.getById(this.agencyId).subscribe({
      next: agency => {
        this.agency = agency;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showToast('Could not load agency.', 'danger');
      }
    });
    this.loadAccess();
    this.loadData();
  }

  loadAccess() {
    this.agencyService.getAccess(this.agencyId).subscribe({
      next: access => this.canWrite = access.canWrite,
      error: () => this.canWrite = false
    });
  }

  loadData() {
    this.agencyService.getContacts(this.agencyId).subscribe({ next: c => this.contacts = c, error: () => {} });
    this.agencyService.getDeals(this.agencyId).subscribe({ next: d => this.deals = d, error: () => {} });
    this.agencyService.getActivities(this.agencyId).subscribe({ next: a => this.activities = a, error: () => {} });
  }

  // ── Dashboard ──────────────────────────────────────
  get totalPipelineValue(): number {
    return this.deals
      .filter(d => d.stage !== 'Lost')
      .reduce((sum, d) => sum + (d.amount || 0), 0);
  }

  get wonValue(): number {
    return this.deals.filter(d => d.stage === 'Won').reduce((sum, d) => sum + (d.amount || 0), 0);
  }

  get openDealsCount(): number {
    return this.deals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost').length;
  }

  stageTotal(stage: string): number {
    return this.dealsByStage(stage).reduce((s, d) => s + (d.amount || 0), 0);
  }

  dealsByStage(stage: string): AgencyDeal[] {
    return this.deals.filter(d => d.stage === stage);
  }

  // ── Contacts CRUD ──────────────────────────────────
  openNewContact() {
    this.editingContact = null;
    this.contactForm = { name: '', isCompany: false };
    this.contactModalOpen = true;
  }

  openEditContact(contact: AgencyContact) {
    this.editingContact = contact;
    this.contactForm = { ...contact };
    this.contactModalOpen = true;
  }

  saveContact() {
    if (!this.contactForm.name.trim()) {
      this.showToast('Contact name is required.', 'warning');
      return;
    }
    const payload: AgencyContact = {
      name: this.contactForm.name.trim(),
      company: this.contactForm.company,
      email: this.contactForm.email,
      phone: this.contactForm.phone,
      position: this.contactForm.position,
      notes: this.contactForm.notes,
      isCompany: (this.contactForm.isCompany) === true
    };
    if (this.editingContact?.id) {
      this.agencyService.updateContact(this.agencyId, this.editingContact.id, payload).subscribe({
        next: () => { this.contactModalOpen = false; this.loadData(); this.showToast('Contact updated.', 'success'); },
        error: err => this.showToast(err.error?.error ?? 'Could not update contact.', 'danger')
      });
    } else {
      this.agencyService.createContact(this.agencyId, payload).subscribe({
        next: () => { this.contactModalOpen = false; this.loadData(); this.showToast('Contact created.', 'success'); },
        error: err => this.showToast(err.error?.error ?? 'Could not create contact.', 'danger')
      });
    }
  }

  async confirmDeleteContact(contact: AgencyContact) {
    if (!contact.id) return;
    const alert = await this.alertController.create({
      header: 'Delete Contact',
      message: `Delete "${contact.name}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete', role: 'destructive', handler: () => {
            this.agencyService.deleteContact(this.agencyId, contact.id!).subscribe({
              next: () => { this.loadData(); this.showToast('Contact deleted.', 'success'); },
              error: err => this.showToast(err.error?.error ?? 'Could not delete contact.', 'danger')
            });
          }
        }
      ]
    });
    await alert.present();
  }

  // ── Deals CRUD ─────────────────────────────────────
  openNewDeal() {
    this.editingDeal = null;
    const firstContact = this.contacts[0];
    this.dealForm = { title: '', contactId: firstContact?.id ?? 0, amount: 0, stage: 'New', probability: 50 };
    this.dealModalOpen = true;
  }

  openEditDeal(deal: AgencyDeal) {
    this.editingDeal = deal;
    this.dealForm = {
      title: deal.title,
      contactId: deal.contactId,
      amount: deal.amount,
      stage: deal.stage,
      probability: deal.probability ?? 50,
      notes: deal.notes
    };
    this.dealModalOpen = true;
  }

  saveDeal() {
    if (!this.dealForm.title.trim()) {
      this.showToast('Deal title is required.', 'warning');
      return;
    }
    const contactId = Number(this.dealForm.contactId);
    if (!contactId) {
      this.showToast('Please select a contact for this deal.', 'warning');
      return;
    }
    // Ionic ion-input/ion-range can hand back strings — coerce to real numbers
    // so the JSON payload matches the backend decimal/int models (else it 400s with
    // "The JSON value could not be converted to ..."). Send only the writable fields.
    const payload = {
      title: this.dealForm.title.trim(),
      contactId,
      amount: Number(this.dealForm.amount) || 0,
      stage: this.dealForm.stage || 'New',
      probability: Number(this.dealForm.probability) ?? 50,
      notes: this.dealForm.notes ?? undefined,
      expectedCloseDate: this.dealForm.expectedCloseDate ?? undefined
    };
    if (this.editingDeal?.id) {
      this.agencyService.updateDeal(this.agencyId, this.editingDeal.id, payload).subscribe({
        next: () => { this.dealModalOpen = false; this.loadData(); this.showToast('Deal updated.', 'success'); },
        error: err => this.showToast(err.error?.error ?? 'Could not update deal.', 'danger')
      });
    } else {
      this.agencyService.createDeal(this.agencyId, payload).subscribe({
        next: () => { this.dealModalOpen = false; this.loadData(); this.showToast('Deal created.', 'success'); },
        error: err => this.showToast(err.error?.error ?? 'Could not create deal.', 'danger')
      });
    }
  }

  moveStage(deal: AgencyDeal, stage: string) {
    if (!this.canWrite || !deal.id) return;
    const payload = {
      title: deal.title,
      contactId: Number(deal.contactId) || 0,
      amount: Number(deal.amount) || 0,
      stage,
      probability: Number(deal.probability) ?? 50,
      notes: deal.notes ?? undefined,
      expectedCloseDate: deal.expectedCloseDate ?? undefined
    };
    this.agencyService.updateDeal(this.agencyId, deal.id, payload).subscribe({
      next: () => { this.loadData(); this.showToast(`Moved to ${stage}.`, 'success'); },
      error: err => this.showToast(err.error?.error ?? 'Could not move deal.', 'danger')
    });
  }

  async confirmDeleteDeal(deal: AgencyDeal) {
    if (!deal.id) return;
    const alert = await this.alertController.create({
      header: 'Delete Deal',
      message: `Delete "${deal.title}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete', role: 'destructive', handler: () => {
            this.agencyService.deleteDeal(this.agencyId, deal.id!).subscribe({
              next: () => { this.loadData(); this.showToast('Deal deleted.', 'success'); },
              error: err => this.showToast(err.error?.error ?? 'Could not delete deal.', 'danger')
            });
          }
        }
      ]
    });
    await alert.present();
  }

  // ── Activities ─────────────────────────────────────
  openNewActivity() {
    this.activityForm = { type: 'Note', subject: '' };
    this.activityModalOpen = true;
  }

  saveActivity() {
    if (!this.activityForm.subject.trim()) {
      this.showToast('Activity subject is required.', 'warning');
      return;
    }
    const payload: AgencyActivity = {
      type: this.activityForm.type || 'Note',
      subject: this.activityForm.subject.trim(),
      description: this.activityForm.description ?? undefined,
      dueDate: this.activityForm.dueDate ?? undefined,
      isCompleted: (this.activityForm.isCompleted) === true
    };
    this.agencyService.createActivity(this.agencyId, payload).subscribe({
      next: () => { this.activityModalOpen = false; this.loadData(); this.showToast('Activity logged.', 'success'); },
      error: err => this.showToast(err.error?.error ?? 'Could not log activity.', 'danger')
    });
  }

  toggleComplete(activity: AgencyActivity) {
    if (!activity.id) return;
    this.agencyService.updateActivity(this.agencyId, activity.id, {
      type: activity.type,
      subject: activity.subject,
      description: activity.description,
      isCompleted: !activity.isCompleted
    }).subscribe({
      next: () => this.loadData(),
      error: () => {}
    });
  }

  async confirmDeleteActivity(activity: AgencyActivity) {
    if (!activity.id) return;
    const alert = await this.alertController.create({
      header: 'Delete Activity',
      message: `Delete "${activity.subject}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete', role: 'destructive', handler: () => {
            this.agencyService.deleteActivity(this.agencyId, activity.id!).subscribe({
              next: () => { this.loadData(); this.showToast('Activity deleted.', 'success'); },
              error: err => this.showToast(err.error?.error ?? 'Could not delete activity.', 'danger')
            });
          }
        }
      ]
    });
    await alert.present();
  }

  // ── Helpers ────────────────────────────────────────
  contactById(id?: number): AgencyContact | undefined {
    return this.contacts.find(c => c.id === id);
  }

  stageIcon(stage: string): string {
    switch (stage) {
      case 'Won': return 'checkmark-circle-outline';
      case 'Lost': return 'close-circle-outline';
      case 'Negotiation': return 'hand-left-outline';
      case 'Proposal': return 'document-attach-outline';
      case 'Qualified': return 'filter-outline';
      default: return 'add-circle-outline';
    }
  }

  stageColor(stage: string): string {
    switch (stage) {
      case 'Won': return 'success';
      case 'Lost': return 'medium';
      case 'Negotiation': return 'warning';
      case 'Proposal': return 'primary';
      case 'Qualified': return 'tertiary';
      default: return 'medium';
    }
  }

  activityIcon(type: string): string {
    switch (type) {
      case 'Call': return 'call-outline';
      case 'Meeting': return 'people-outline';
      case 'Task': return 'checkbox-outline';
      case 'Email': return 'mail-outline';
      default: return 'create-outline';
    }
  }

  formatCurrency(val: number): string {
    return 'R ' + (val || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatDate(val?: string): string {
    if (!val) return '';
    const d = new Date(val);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-ZA');
  }

  goBack() {
    window.location.href = '/admin/agencies';
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({ message, color, duration: 2500, position: 'bottom' });
    await toast.present();
  }
}