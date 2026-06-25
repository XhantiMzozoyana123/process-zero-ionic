import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AlertController, IonModal, ToastController } from '@ionic/angular';
import { switchMap } from 'rxjs/operators';
import { MeetingService } from 'src/app/services/meeting-service';
import { ProductService } from 'src/app/services/product-service';
import { AdminClientService } from 'src/app/services/admin-client-service';
import { CalService } from 'src/app/services/cal-service';
import { MeetingDto } from 'src/app/models/dtos/meeting-dto.model';
import { Contact } from 'src/app/models/entities/contact.model';
import { Product } from 'src/app/models/entities/product.model';
import { CreateCalBookingRequest } from 'src/app/models/dtos/cal-booking.model';

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
  pageSize = 10;
  viewMode: 'table' | 'cards' = 'table';

  detailMeeting: MeetingDto | null = null;
  editingMeeting: MeetingDto | null = null;
  meetingForm: FormGroup;
  submitting = false;
  selectedProductCalEventTypeId: number | null = null;

  calDate = new Date();
  calSlots: string[] = [];
  calLoading = false;

  constructor(
    private meetingService: MeetingService,
    private clientService: AdminClientService,
    private productService: ProductService,
    private calService: CalService,
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

  ngOnInit(): void {
    this.loadData();
  }

  loadData(event?: any): void {
    this.loading = true;
    this.productService.getAll().subscribe({ next: products => { this.products = products; }, error: () => {} });
    this.clientService.getAll(1, 500).subscribe({ next: res => { this.contacts = res.items; }, error: () => {} });
    this.meetingService.getAllMeetings(this.currentPage, this.pageSize).subscribe({
      next: res => { this.meetings = res.items; this.totalCount = res.totalCount; this.loading = false; if (event) event.target.complete(); },
      error: () => { this.showToast('Could not load meetings.', 'danger'); this.loading = false; if (event) event.target.complete(); }
    });
  }

  refresh(event: any): void { this.loadData(event); }

  onSearchChange(): void { this.currentPage = 1; this.loadData(); }
  onProductChange(event: any): void {
    const productId = event?.detail?.value;
    const product = this.products.find(p => p.id === productId);
    const prev = this.selectedProductCalEventTypeId;
    this.selectedProductCalEventTypeId = product?.calEventTypeId ?? null;
    if (this.selectedProductCalEventTypeId && this.selectedProductCalEventTypeId !== prev) {
      this.calSlots = [];
      this.loadCalSlots();
    }
  }

  // Cal inline picker
  get calDateLabel(): string { return this.calDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }); }
  calPrev(): void { this.calDate = new Date(this.calDate); this.calDate.setDate(this.calDate.getDate() - 1); this.calSlots = []; this.loadCalSlots(); }
  calNext(): void { this.calDate = new Date(this.calDate); this.calDate.setDate(this.calDate.getDate() + 1); this.calSlots = []; this.loadCalSlots(); }

  loadCalSlots(): void {
    if (!this.selectedProductCalEventTypeId) { this.calSlots = []; return; }
    const yyyy = this.calDate.getFullYear();
    const mm = String(this.calDate.getMonth() + 1).padStart(2, '0');
    const dd = String(this.calDate.getDate()).padStart(2, '0');
    const dateOnly = `${yyyy}-${mm}-${dd}`;
    this.calLoading = true;
    this.calSlots = [];
    this.calService.getAvailableSlots({
      eventTypeId: this.selectedProductCalEventTypeId,
      startDate: dateOnly,
      endDate: dateOnly,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }).subscribe({
      next: (data: any) => {
        const times: string[] = [];
        const raw = data?.slots?.[dateOnly] || [];
        for (const item of raw) {
          if (typeof item === 'string') times.push(item);
          else if (item?.time && typeof item.time === 'string') times.push(item.time);
        }
        this.calSlots = times.sort((a, b) => a.localeCompare(b));
        this.calLoading = false;
      },
      error: () => { this.calSlots = []; this.calLoading = false; },
    });
  }

  private makeIso(time24: string): string {
    const d = this.calDate;
    const pad = (n: number) => String(n).padStart(2, '0');
    const t = time24.length >= 8 ? time24.substring(0, 8) : `${time24}:00`.substring(0, 8);
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${t}Z`;
  }

  selectCalSlot(slotTime: string): void { const iso = this.makeIso(slotTime); this.meetingForm.patchValue({ meetingDate: iso }); }
  isSlotSelected(slotTime: string): boolean {
    const current = (this.meetingForm.get('meetingDate')?.value as string | null) || '';
    const currentTime = current.substring(11, 19);
    const candidate = this.makeIso(slotTime).substring(11, 19);
    return currentTime === candidate;
  }

  getContactName(m: MeetingDto): string {
    if (m.contact?.firstName || m.contact?.lastName) return [m.contact.firstName, m.contact.lastName].filter(Boolean).join(' ');
    return `Client #${m.meeting?.clientId ?? '?'}`;
  }
  getContactInitials(m: MeetingDto): string {
    const f = m.contact?.firstName?.charAt(0) ?? '';
    const l = m.contact?.lastName?.charAt(0) ?? '';
    return (f + l) || '?';
  }
  getProductName(m: MeetingDto): string {
    return m.product?.name || 'Unknown product';
  }
  isFuture(dateStr?: string): boolean { if (!dateStr) return false; return new Date(dateStr) > new Date(); }
  isInvalid(name: string): boolean { const ctrl = this.meetingForm.get(name); return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched); }

  get filteredMeetings(): MeetingDto[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.meetings;
    return this.meetings.filter(m => {
      const haystack = [this.getContactName(m), this.getProductName(m), m.meeting?.notes, m.userId, m.meeting?.meetingDate].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(term);
    });
  }

  get totalPages(): number { return Math.ceil(this.totalCount / this.pageSize) || 1; }
  get displayedMeetings(): MeetingDto[] { return this.filteredMeetings; }
  get pageNumbers(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  goToPage(page: number): void { if (page >= 1 && page <= this.totalPages && page !== this.currentPage) { this.currentPage = page; this.loadData(); } }

  openDetailModal(meeting: MeetingDto): void { this.detailMeeting = meeting; this.detailModal.present(); }
  closeDetailModal(): void { this.detailModal.dismiss(); }
  onDetailDismiss(): void { this.detailMeeting = null; }

  openAddModal(): void { this.editingMeeting = null; this.meetingForm.reset(); this.formModal.present(); }
  openEditModal(dto: MeetingDto): void {
    this.editingMeeting = dto;
    this.meetingForm.patchValue({ userId: dto.userId ?? '', contactId: dto.meeting?.clientId, productId: dto.meeting?.productId, meetingDate: dto.meeting?.meetingDate ?? '', notes: dto.meeting?.notes ?? '' });
    this.formModal.present();
  }
  closeFormModal(): void { this.formModal.dismiss(); }
  onFormDismiss(): void { this.editingMeeting = null; }

  saveMeeting(): void {
    if (this.meetingForm.invalid) { this.meetingForm.markAllAsTouched(); return; }
    this.submitting = true;
    const val = this.meetingForm.getRawValue();
    const contact = this.contacts.find(c => c.id === val.contactId);
    const product = this.products.find(p => p.id === val.productId);
    if (!contact || !product) { this.showToast('Select a valid client and product.', 'warning'); this.submitting = false; return; }

    const meetingDto: MeetingDto = {
      userId: val.userId || undefined,
      contact,
      product,
      meeting: { ...(this.editingMeeting?.meeting ?? {}), clientId: val.contactId, productId: val.productId, meetingDate: val.meetingDate, notes: val.notes ?? '' }
    };

    const notes = val.notes ?? '';
    const isEdit = !!this.editingMeeting;
    const meetingSave$ = isEdit
      ? this.meetingService.updateMeeting(meetingDto.meeting.id!, meetingDto, notes)
      : this.meetingService.createMeeting(meetingDto, notes);

    meetingSave$.pipe(switchMap(async () => {
      if (!isEdit && product.calEventTypeId && contact.email) {
        try {
          const startDate = new Date(val.meetingDate);
          const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
          const toCalIso = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}T${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}:${String(d.getUTCSeconds()).padStart(2, '0')}Z`;
          const calRequest: CreateCalBookingRequest = { eventTypeId: product.calEventTypeId, attendee: { name: `${contact.firstName} ${contact.lastName}`.trim(), email: contact.email, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }, start: toCalIso(startDate), end: toCalIso(endDate), location: notes || undefined };
          return await this.calService.createBooking(calRequest).toPromise();
        } catch (calErr) { console.warn('[AdminMeetings] cal.com booking failed (non-fatal):', calErr); return null; }
      }
      return null;
    })).subscribe({
      next: () => { this.showToast(isEdit ? 'Meeting updated.' : 'Meeting created.', 'success'); this.submitting = false; this.closeFormModal(); this.loadData(); },
      error: () => { this.showToast('Could not save meeting.', 'danger'); this.submitting = false; }
    });
  }

  async deleteMeeting(dto: MeetingDto): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete meeting?',
      message: `Remove the meeting with ${this.getContactName(dto)}? This cannot be undone.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Delete', role: 'destructive', handler: () => { this.meetingService.deleteMeeting(dto.meeting.id!).subscribe({ next: () => { this.showToast('Meeting deleted.', 'success'); this.closeDetailModal(); this.loadData(); }, error: () => { this.showToast('Could not delete meeting.', 'danger'); } }); } }
      ]
    });
    await alert.present();
  }

  startTour(): void {}

  static noWeekendValidator(control: AbstractControl): ValidationErrors | null { if (!control.value) return null; const day = new Date(control.value).getDay(); return day === 0 || day === 6 ? { weekend: true } : null; }

  private async showToast(message: string, color: string): Promise<void> { const toast = await this.toastController.create({ message, color, duration: 2500, position: 'bottom' }); await toast.present(); }
}