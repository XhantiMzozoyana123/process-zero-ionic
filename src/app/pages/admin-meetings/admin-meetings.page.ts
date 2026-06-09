import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AlertController, IonModal, ToastController } from '@ionic/angular';
import { MeetingService } from 'src/app/services/meeting-service';
import { ProductService } from 'src/app/services/product-service';
import { AdminClientService } from 'src/app/services/admin-client-service';
import { MeetingDto } from 'src/app/models/dtos/meeting-dto.model';
import { Contact } from 'src/app/models/entities/contact.model';
import { Product } from 'src/app/models/entities/product.model';

@Component({
  selector: 'app-admin-meetings',
  templateUrl: './admin-meetings.page.html',
  styleUrls: ['./admin-meetings.page.scss'],
  standalone: false
})
export class AdminMeetingsPage implements OnInit {
  @ViewChild('detailModal') detailModal!: IonModal;
  @ViewChild('formModal') formModal!: IonModal;

  meetings: MeetingDto[] = [];
  contacts: Contact[] = [];
  products: Product[] = [];
  loading = false;
  searchTerm = '';
  totalCount = 0;

  currentPage = 1;
  pageSize = 3;
  viewMode: 'table' | 'cards' = 'table';

  detailMeeting: MeetingDto | null = null;

  editingMeeting: MeetingDto | null = null;
  meetingForm: FormGroup;
  submitting = false;

  constructor(
    private meetingService: MeetingService,
    private clientService: AdminClientService,
    private productService: ProductService,
    private fb: FormBuilder,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.meetingForm = this.fb.group({
      userId: [''],
      contactId: [null, Validators.required],
      productId: [null, Validators.required],
      meetingDate: ['', [Validators.required, AdminMeetingsPage.noWeekendValidator]],
      notes: ['']
    });
  }

  ngOnInit() {
    this.loadData();
  }

  get filteredMeetings(): MeetingDto[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.meetings;
    return this.meetings.filter(m => {
      const haystack = [
        m.contact?.firstName, m.contact?.lastName,
        m.contact?.email, m.product?.name,
        m.meeting?.notes, m.userId,
        m.meeting?.meetingDate
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(term);
    });
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize) || 1;
  }

  get displayedMeetings(): MeetingDto[] {
    return this.filteredMeetings;
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadData();
    }
  }

  onSearchChange(): void {
  }

  loadData(event?: any): void {
    this.loading = true;

    this.productService.getAll().subscribe({
      next: products => { this.products = products; },
      error: () => {}
    });

    this.clientService.getAll(1, 500).subscribe({
      next: res => { this.contacts = res.items; },
      error: () => {}
    });

    this.meetingService.getAllMeetings(this.currentPage, this.pageSize).subscribe({
      next: res => { this.meetings = res.items; this.totalCount = res.totalCount; this.loading = false; if (event) event.target.complete(); },
      error: () => { this.showToast('Could not load meetings.', 'danger'); this.loading = false; if (event) event.target.complete(); }
    });
  }

  refresh(event: any): void {
    this.loadData(event);
  }

  getContactName(m: MeetingDto): string {
    if (m.contact?.firstName || m.contact?.lastName) {
      return [m.contact.firstName, m.contact.lastName].filter(Boolean).join(' ');
    }
    return `Client #${m.meeting?.clientId ?? '?'}`;
  }

  getContactInitials(m: MeetingDto): string {
    const f = m.contact?.firstName?.charAt(0) ?? '';
    const l = m.contact?.lastName?.charAt(0) ?? '';
    return (f + l) || '?';
  }

  isFuture(dateStr?: string): boolean {
    if (!dateStr) return false;
    return new Date(dateStr) > new Date();
  }

  // ── Detail modal ────────────────────────────
  openDetailModal(meeting: MeetingDto): void {
    this.detailMeeting = meeting;
    this.detailModal?.present();
  }

  closeDetailModal(): void {
    this.detailModal?.dismiss();
  }

  onDetailDismiss(): void {
    this.detailMeeting = null;
  }

  // ── Form modal ──────────────────────────────
  openAddModal(): void {
    this.editingMeeting = null;
    this.meetingForm.reset();
    this.formModal?.present();
  }

  openEditModal(dto: MeetingDto): void {
    this.editingMeeting = dto;
    this.meetingForm.patchValue({
      userId: dto.userId ?? '',
      contactId: dto.meeting?.clientId,
      productId: dto.meeting?.productId,
      meetingDate: dto.meeting?.meetingDate ?? '',
      notes: dto.meeting?.notes ?? ''
    });
    this.formModal?.present();
  }

  closeFormModal(): void {
    this.formModal?.dismiss();
  }

  onFormDismiss(): void {
    this.editingMeeting = null;
  }

  saveMeeting(): void {
    if (this.meetingForm.invalid) {
      this.meetingForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const val = this.meetingForm.getRawValue();
    const contact = this.contacts.find(c => c.id === val.contactId);
    const product = this.products.find(p => p.id === val.productId);

    if (!contact || !product) {
      this.showToast('Select a valid client and product.', 'warning');
      this.submitting = false;
      return;
    }

    const meetingDto: MeetingDto = {
      userId: val.userId || undefined,
      contact,
      product,
      meeting: {
        ...(this.editingMeeting?.meeting ?? {}),
        clientId: val.contactId,
        productId: val.productId,
        meetingDate: val.meetingDate,
        notes: val.notes ?? ''
      }
    };

    const notes = val.notes ?? '';

    if (this.editingMeeting) {
      this.meetingService.updateMeeting(meetingDto.meeting.id!, meetingDto, notes).subscribe({
        next: () => { this.showToast('Meeting updated.', 'success'); this.submitting = false; this.closeFormModal(); this.loadData(); },
        error: () => { this.showToast('Could not update meeting.', 'danger'); this.submitting = false; }
      });
    } else {
      this.meetingService.createMeeting(meetingDto, notes).subscribe({
        next: () => { this.showToast('Meeting created.', 'success'); this.submitting = false; this.closeFormModal(); this.loadData(); },
        error: () => { this.showToast('Could not create meeting.', 'danger'); this.submitting = false; }
      });
    }
  }

  async deleteMeeting(dto: MeetingDto): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete meeting?',
      message: `Remove the meeting with ${this.getContactName(dto)}? This cannot be undone.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete', role: 'destructive', handler: () => {
            this.meetingService.deleteMeeting(dto.meeting.id!).subscribe({
              next: () => { this.showToast('Meeting deleted.', 'success'); this.closeDetailModal(); this.loadData(); },
              error: () => { this.showToast('Could not delete meeting.', 'danger'); }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  isInvalid(name: string): boolean {
    const ctrl = this.meetingForm.get(name);
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  static noWeekendValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const day = new Date(control.value).getDay();
    return day === 0 || day === 6 ? { weekend: true } : null;
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastController.create({ message, color, duration: 2500, position: 'bottom' });
    await toast.present();
  }
}
