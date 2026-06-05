import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MeetingService } from 'src/app/services/meeting-service';
import { ProductService } from 'src/app/services/product-service';
import { ContactService } from 'src/app/services/contact-service';
import { AssessmentService } from 'src/app/services/assessment-service';
import { MeetingDto } from 'src/app/models/dtos/meeting-dto.model';
import { Contact } from 'src/app/models/entities/contact.model';
import { Product } from 'src/app/models/entities/product.model';
import { IntroService } from 'src/app/services/intro-service';

@Component({
  selector: 'app-meetings',
  standalone: false,
  templateUrl: './meetings.page.html',
  styleUrls: ['./meetings.page.scss'],
})
export class MeetingsPage implements OnInit {
  meetings: MeetingDto[] = [];
  contacts: Contact[] = [];
  products: Product[] = [];
  qualifiedProducts: Product[] = [];
  searchTerm = '';
  isFormModalOpen = false;
  submitting = false;
  editingMeeting: MeetingDto | null = null;

  currentPage = 1;
  pageSize = 3;
  viewMode: 'table' | 'cards' = 'table';

  meetingForm: FormGroup;

  constructor(
    private meetingService: MeetingService,
    private contactService: ContactService,
    private productService: ProductService,
    private assessmentService: AssessmentService,
    private fb: FormBuilder,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private introService: IntroService
  ) {
    this.meetingForm = this.fb.group({
      contactId: ['', Validators.required],
      productId: ['', Validators.required],
      meetingDate: ['', [Validators.required, MeetingsPage.noWeekendValidator]],
      notes: [''],
    });
  }

  ngOnInit() {
    this.loadAll();
  }

  startTour(): void {
    this.introService.startMeetingsTour();
  }

  get filteredMeetings(): MeetingDto[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.meetings;

    return this.meetings.filter((m) => {
      const haystack = [
        m.contact.firstName,
        m.contact.lastName,
        m.product.name,
        m.meeting.notes,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }

  get totalPages(): number {
    return Math.ceil(this.filteredMeetings.length / this.pageSize) || 1;
  }

  get displayedMeetings(): MeetingDto[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredMeetings.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  loadAll() {
    this.loadMeetings();
    this.loadContacts();
    this.loadProducts();
  }

  loadMeetings() {
    this.meetingService.getUserMeetings().subscribe({
      next: (data) => (this.meetings = data),
      error: (err) => console.error(err),
    });
  }

  loadContacts() {
    this.contactService.getMine().subscribe({
      next: (data) => (this.contacts = data),
      error: (err) => console.error(err),
    });
  }

  loadProducts() {
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = data;
        this.filterQualifiedProducts();
      },
      error: (err) => console.error(err),
    });
  }

  private filterQualifiedProducts(): void {
    // A sales rep is qualified to sell a product ONLY if they passed THAT
    // product's assessment. The global assessment is just for app access and
    // does NOT grant product qualification.
    this.assessmentService
      .getAllMyResults()
      .pipe(catchError(() => of([] as any[])))
      .subscribe((bulk) => {
        console.log('[Meetings] bulk /my-results raw response:', bulk);

        const passedProductIds = this.extractPassedProductIds(bulk);
        console.log('[Meetings] passed productIds (bulk):', Array.from(passedProductIds));
        console.log('[Meetings] product ids available:', this.products.map((p) => p.id));

        const qualified = this.products.filter(
          (p) => p.id != null && passedProductIds.has(Number(p.id))
        );

        if (qualified.length > 0) {
          this.qualifiedProducts = qualified;
          console.log('[Meetings] qualified via bulk:', qualified.map((p) => p.id));
        } else {
          // Bulk returned nothing usable, so verify each product individually.
          console.warn('[Meetings] bulk returned no qualified products, falling back to per-product checks.');
          this.checkProductsIndividually();
        }
      });
  }

  /** Determine if a single result object represents a pass, tolerating shapes. */
  private isResultPassed(r: any): boolean {
    if (!r) return false;
    const passedFlag = r.passed ?? r.Passed ?? r.isPassed ?? r.IsPassed;
    if (passedFlag === true) return true;
    if (passedFlag === false) return false;

    // No explicit boolean — fall back to percentage / score vs total.
    const percentage = r.percentage ?? r.Percentage;
    if (typeof percentage === 'number') return percentage >= 50;

    const score = r.score ?? r.Score;
    const total = r.total ?? r.Total;
    if (typeof score === 'number' && typeof total === 'number' && total > 0) {
      return (score / total) * 100 >= 50;
    }
    return false;
  }

  /** Build a Set of productIds the user has passed, tolerating PascalCase JSON. */
  private extractPassedProductIds(results: any[]): Set<number> {
    return new Set<number>(
      (results ?? [])
        .filter((r: any) => this.isResultPassed(r))
        .map((r: any) => Number(r.productId ?? r.ProductId))
        .filter((id: number) => !Number.isNaN(id))
    );
  }

  /** Fallback: query each product's assessment result individually. */
  private checkProductsIndividually(): void {
    const productsWithId = this.products.filter((p) => p.id != null);

    if (productsWithId.length === 0) {
      this.qualifiedProducts = [];
      return;
    }

    forkJoin(
      productsWithId.map((p) =>
        this.assessmentService.getMyProductResult(p.id!).pipe(
          map((res: any) => {
            console.log(`[Meetings] /product/${p.id}/my-result response:`, res);
            return { product: p, passed: this.isResultPassed(res) };
          }),
          catchError((err) => {
            console.warn(`[Meetings] no result for product ${p.id}`, err?.status ?? err);
            return of({ product: p, passed: false });
          })
        )
      )
    ).subscribe({
      next: (outcomes) => {
        this.qualifiedProducts = outcomes
          .filter((o) => o.passed)
          .map((o) => o.product);
        console.log('[Meetings] qualified via per-product checks:', this.qualifiedProducts.map((p) => p.id));
      },
      error: (err) => {
        console.error('[Meetings] Could not verify product assessments', err);
        this.qualifiedProducts = [];
      },
    });
  }

  async saveMeeting() {
    if (this.meetingForm.invalid) return;
    this.submitting = true;
    const userId = localStorage.getItem('userId') || undefined;

    const { contactId, productId, meetingDate, notes } =
      this.meetingForm.value;

    const meetingDto: MeetingDto = {
      userId,
      contact: this.contacts.find((c) => c.id === contactId)!,
      product: this.products.find((p) => p.id === productId)!,
      meeting: {
        ...(this.editingMeeting?.meeting ?? {}),
        clientId: contactId,
        productId,
        meetingDate,
        notes,
      },
    };

    const isEdit = !!this.editingMeeting;
    const request$ = isEdit
      ? this.meetingService.updateMeeting(meetingDto.meeting.id!, meetingDto, notes)
      : this.meetingService.createMeeting(meetingDto, notes);

    request$.subscribe({
      next: async () => {
        await this.showToast(isEdit ? 'Meeting updated successfully!' : 'Meeting created successfully!');
        this.resetForm();
        this.closeMeetingModal();
        this.submitting = false;
        // Refresh the page after a successful form submission so all data
        // (meetings, qualified products, etc.) reflects the latest state.
        setTimeout(() => window.location.reload(), 600);
      },

      error: async (err) => {
        console.error(err);
        this.submitting = false;
        await this.showToast(isEdit ? 'Could not update meeting. Please try again.' : 'Could not create meeting. Please try again.');
      },
    });
  }

  openAddMeetingModal() {
    this.editingMeeting = null;
    this.resetForm();
    this.isFormModalOpen = true;
  }

  openEditMeetingModal(dto: MeetingDto) {
    this.editingMeeting = dto;
    this.meetingForm.patchValue({
      contactId: dto.meeting.clientId,
      productId: dto.meeting.productId,
      meetingDate: dto.meeting.meetingDate,
      notes: dto.meeting.notes ?? '',
    });
    this.isFormModalOpen = true;
  }

  async confirmDelete(dto: MeetingDto) {
    const alert = await this.alertCtrl.create({
      header: 'Delete Meeting',
      message: `Are you sure you want to delete this meeting with ${dto.contact.firstName} ${dto.contact.lastName}?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => this.deleteMeeting(dto.meeting.id!),
        },
      ],
    });
    await alert.present();
  }

  private deleteMeeting(id: number, notes?: string) {
    this.meetingService.deleteMeeting(id, notes).subscribe({
      next: async () => {
        await this.showToast('Meeting deleted.');
        this.loadMeetings();
      },
      error: async (err) => {
        console.error(err);
        await this.showToast('Could not delete meeting. Please try again.');
      },
    });
  }

  closeMeetingModal() {
    this.isFormModalOpen = false;
    this.editingMeeting = null;
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2000 });
    toast.present();
  }

  private resetForm() {
    this.meetingForm.reset();
    this.meetingForm.patchValue({ notes: '' });
  }

  static noWeekendValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const day = new Date(control.value).getDay();
    return day === 0 || day === 6 ? { weekend: true } : null;
  }

  isFuture(date?: string): boolean {
    if (!date) return false;
    return new Date(date) > new Date();
  }
}
