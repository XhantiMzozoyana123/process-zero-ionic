import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService } from 'src/app/services/contact-service';
import { Contact, ContactStatus, ContactStatusLabels } from 'src/app/models/entities/contact.model';
import { LeadLake, LeadLakeIndustry } from 'src/app/models/entities/leadlake.model';
import { AlertController } from '@ionic/angular';
import { IntroService } from 'src/app/services/intro-service';

@Component({
  selector: 'app-contacts',
  standalone: false,
  templateUrl: './contacts.page.html',
  styleUrls: ['./contacts.page.scss'],
})
export class ContactsPage implements OnInit {
  contacts: Contact[] = [];
  contactForm: FormGroup;
  industryOptions = Object.values(LeadLakeIndustry);
  loading = false;
  submitting = false;
  message = '';
  errorMessage = '';
  searchTerm = '';
  isFormModalOpen = false;
  editingContactId?: number;
  viewMode: 'table' | 'cards' = 'table';
  currentPage = 1;
  pageSize = 3;
  private readonly statusValues = [
    ContactStatus.Reached,
    ContactStatus.FollowUp,
    ContactStatus.Converted,
    ContactStatus.Active,
    ContactStatus.Deactivated,
  ];

  constructor(
    private contactService: ContactService,
    private fb: FormBuilder,
    private alertController: AlertController,
    private introService: IntroService
  ) {
    // Initialize reactive form
    this.contactForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      company: ['', Validators.required],
      job: ['', Validators.required],
      location: ['', Validators.required],
      industry: [LeadLakeIndustry.Other, Validators.required]
    });
  }

  ngOnInit() {
    this.loadContacts();
  }

  startTour(): void {
    this.introService.startContactsTour();
  }

  get filteredContacts(): Contact[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.contacts;

    return this.contacts.filter((contact) => {
      const haystack = [
        contact.firstName,
        contact.lastName,
        contact.email,
        contact.phone,
        contact.company,
        contact.job,
        contact.location,
        contact.status
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }

  get totalPages(): number {
    return Math.ceil(this.filteredContacts.length / this.pageSize) || 1;
  }

  get displayedContacts(): Contact[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredContacts.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  isInvalid(controlName: string): boolean {
    const control = this.contactForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  getStatusLabel(status?: ContactStatus | number): string {
    if (status == null) return 'Unknown';
    return ContactStatusLabels[status as ContactStatus] ?? 'Unknown';
  }

  getStatusColor(status?: ContactStatus | number): 'success' | 'warning' | 'primary' | 'danger' | 'medium' {
    if (status == null) return 'medium';
    if (status === ContactStatus.Reached) return 'success';
    if (status === ContactStatus.FollowUp) return 'warning';
    if (status === ContactStatus.Converted) return 'primary';
    if (status === ContactStatus.Deactivated) return 'danger';
    return 'medium';
  }

  // Load current user's contacts
  loadContacts() {
    this.loading = true;
    this.errorMessage = '';

    this.contactService.getMine().subscribe({
      next: (res) => {
        this.contacts = res;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Could not load contacts. Please try again.';
        this.loading = false;
      }
    });
  }

  submit() {
    this.message = '';
    this.errorMessage = '';

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    this.submitting = true;

    const formValue = this.contactForm.getRawValue();

    const normalizedLead: LeadLake = {
      firstName: formValue.firstName.trim(),
      lastName: formValue.lastName.trim(),
      email: formValue.email.trim(),
      phone: formValue.phone.trim(),
      company: formValue.company.trim(),
      job: formValue.job.trim(),
      location: formValue.location.trim(),
      industry: formValue.industry
    };

    if (this.editingContactId) {
      const existing = this.contacts.find((c) => c.id === this.editingContactId);
      const updatePayload: Contact = {
        id: this.editingContactId,
        userId: existing?.userId,
        createdAt: existing?.createdAt,
        updatedAt: existing?.updatedAt,
        firstName: normalizedLead.firstName,
        lastName: normalizedLead.lastName,
        email: normalizedLead.email,
        phone: normalizedLead.phone,
        company: normalizedLead.company,
        job: normalizedLead.job,
        location: normalizedLead.location,
        status: existing?.status
      };

      this.contactService.update(this.editingContactId, updatePayload).subscribe({
        next: () => {
          this.message = 'Contact updated.';
          this.submitting = false;
          this.resetForm();
          this.closeFormModal();
          this.loadContacts();
        },
        error: (err) => {
          const backendMessage = this.extractBackendError(err);
          this.errorMessage = backendMessage || 'Could not update contact. Please try again.';
          this.submitting = false;
        }
      });

      return;
    }

    const leadPayload = {
      ...normalizedLead,
      // Some ASP.NET APIs expect enum numbers instead of enum strings in JSON payloads.
      industry: this.toIndustryApiValue(formValue.industry)
    };

    this.contactService.create(leadPayload).subscribe({
      next: () => {
        this.message = 'Contact added.';
        this.submitting = false;
        this.resetForm();
        this.closeFormModal();
        this.loadContacts();
      },
      error: (err) => {
        const backendMessage = this.extractBackendError(err);
        this.errorMessage = backendMessage || 'Could not add contact. Please try again.';
        this.submitting = false;
      }
    });
  }

  // Delete contact
  async deleteContact(id: number) {
    const alert = await this.alertController.create({
      header: 'Delete contact?',
      message: 'This action cannot be undone.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.contactService.delete(id).subscribe({
              next: () => {
                this.contacts = this.contacts.filter((contact) => contact.id !== id);
                this.message = 'Contact deleted.';
                setTimeout(() => window.location.reload(), 600);
              },
              error: () => {
                this.errorMessage = 'Could not delete contact. Please try again.';
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  openAddContactModal() {
    this.message = '';
    this.errorMessage = '';
    this.editingContactId = undefined;
    this.resetForm();
    this.isFormModalOpen = true;
  }

  openEditContactModal(contact: Contact) {
    this.message = '';
    this.errorMessage = '';
    this.editingContactId = contact.id;

    this.contactForm.patchValue({
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      email: contact.email || '',
      phone: contact.phone || '',
      company: contact.company || '',
      job: contact.job || '',
      location: contact.location || '',
      industry: LeadLakeIndustry.Other
    });

    this.contactForm.markAsPristine();
    this.contactForm.markAsUntouched();
    this.isFormModalOpen = true;
  }

  closeFormModal() {
    this.isFormModalOpen = false;
    this.editingContactId = undefined;
  }

  private resetForm() {
    this.contactForm.reset({ industry: LeadLakeIndustry.Other });
    this.contactForm.markAsPristine();
    this.contactForm.markAsUntouched();
  }

  private toIndustryApiValue(industry: LeadLakeIndustry | number): number | LeadLakeIndustry {
    if (typeof industry === 'number') {
      return industry;
    }

    const values = Object.values(LeadLakeIndustry) as LeadLakeIndustry[];
    const index = values.findIndex((value) => value === industry);
    return index >= 0 ? index : LeadLakeIndustry.Other;
  }

  private extractBackendError(err: any): string {
    const modelStateErrors = err?.error?.errors
      ? Object.values(err.error.errors)
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

    return err?.error?.error || err?.error?.title || modelStateErrors || '';
  }

}