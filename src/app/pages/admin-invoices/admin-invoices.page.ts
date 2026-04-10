import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { AdminInvoiceService, PagedResult } from 'src/app/services/admin-invoice-service';
import { ProductService } from 'src/app/services/product-service';
import { AdminClientService } from 'src/app/services/admin-client-service';
import { Invoice } from 'src/app/models/entities/invoice.model';
import { Product } from 'src/app/models/entities/product.model';
import { Contact } from 'src/app/models/entities/contact.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-invoices',
  templateUrl: './admin-invoices.page.html',
  styleUrls: ['./admin-invoices.page.scss'],
  standalone: false
})
export class AdminInvoicesPage implements OnInit {
  invoices: Invoice[] = [];
  products: Product[] = [];
  clients: Contact[] = [];
  loading = false;
  searchTerm = '';
  totalCount = 0;

  viewMode: 'table' | 'cards' = 'table';
  currentPage = 1;
  pageSize = 6;

  isDetailModalOpen = false;
  detailInvoice: Invoice | null = null;

  isFormModalOpen = false;
  editingInvoiceId?: number;
  invoiceForm: FormGroup;
  submitting = false;

  constructor(
    private invoiceService: AdminInvoiceService,
    private productService: ProductService,
    private clientService: AdminClientService,
    private fb: FormBuilder,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.invoiceForm = this.fb.group({
      productId: [null, Validators.required],
      clientId: [null, Validators.required],
      invoiceCode: ['', Validators.required],
      customerCode: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0)]],
      isPaid: [false],
      issuedAt: ['', Validators.required],
      paidAt: [''],
      externalInvoiceId: ['']
    });
  }

  ngOnInit() {
    this.loadData();
  }

  get filteredInvoices(): Invoice[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.invoices;
    return this.invoices.filter(inv => {
      const haystack = [
        inv.invoiceCode, inv.customerCode,
        inv.externalInvoiceId,
        this.getProductName(inv.productId),
        this.getClientName(inv.clientId),
        inv.isPaid ? 'paid' : 'unpaid'
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(term);
    });
  }

  get displayedInvoices(): Invoice[] {
    return this.filteredInvoices;
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize) || 1;
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

  loadData(): void {
    this.loading = true;
    forkJoin({
      invoices: this.invoiceService.getAll(this.currentPage, this.pageSize),
      products: this.productService.getAll(),
      clients: this.clientService.getAll(1, 500)
    }).subscribe({
      next: res => {
        this.invoices = res.invoices.items;
        this.totalCount = res.invoices.totalCount;
        this.products = res.products;
        this.clients = res.clients.items;
        this.loading = false;
      },
      error: () => {
        this.showToast('Could not load data.', 'danger');
        this.loading = false;
      }
    });
  }

  refresh(event: any): void {
    forkJoin({
      invoices: this.invoiceService.getAll(this.currentPage, this.pageSize),
      products: this.productService.getAll(),
      clients: this.clientService.getAll(1, 500)
    }).subscribe({
      next: res => {
        this.invoices = res.invoices.items;
        this.totalCount = res.invoices.totalCount;
        this.products = res.products;
        this.clients = res.clients.items;
        event.target.complete();
      },
      error: () => {
        this.showToast('Could not refresh data.', 'danger');
        event.target.complete();
      }
    });
  }

  // ── Name resolution ─────────────────────────
  getProductName(id: number): string {
    return this.products.find(p => p.id === id)?.name ?? `Product #${id}`;
  }

  getClientName(id: number): string {
    const c = this.clients.find(cl => cl.id === id);
    return c ? `${c.firstName} ${c.lastName}` : `Client #${id}`;
  }

  // ── Detail modal ────────────────────────────
  openDetailModal(invoice: Invoice): void {
    this.detailInvoice = invoice;
    this.isDetailModalOpen = true;
  }

  closeDetailModal(): void {
    this.isDetailModalOpen = false;
    this.detailInvoice = null;
  }

  // ── Form modal ──────────────────────────────
  openAddModal(): void {
    this.editingInvoiceId = undefined;
    this.invoiceForm.reset({ isPaid: false });
    this.isFormModalOpen = true;
  }

  openEditModal(invoice: Invoice): void {
    this.editingInvoiceId = invoice.id;
    this.invoiceForm.patchValue({
      productId: invoice.productId,
      clientId: invoice.clientId,
      invoiceCode: invoice.invoiceCode,
      customerCode: invoice.customerCode,
      amount: invoice.amount,
      isPaid: invoice.isPaid,
      issuedAt: invoice.issuedAt ? new Date(invoice.issuedAt).toISOString() : '',
      paidAt: invoice.paidAt ? new Date(invoice.paidAt).toISOString() : '',
      externalInvoiceId: invoice.externalInvoiceId ?? ''
    });
    this.isFormModalOpen = true;
  }

  closeFormModal(): void {
    this.isFormModalOpen = false;
    this.editingInvoiceId = undefined;
  }

  saveInvoice(): void {
    if (this.invoiceForm.invalid) {
      this.invoiceForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const val = this.invoiceForm.getRawValue();
    const payload: Invoice = {
      productId: +val.productId,
      clientId: +val.clientId,
      invoiceCode: val.invoiceCode.trim(),
      customerCode: val.customerCode.trim(),
      amount: +val.amount,
      isPaid: !!val.isPaid,
      issuedAt: val.issuedAt,
      paidAt: val.paidAt || undefined,
      externalInvoiceId: val.externalInvoiceId?.trim() || undefined
    };

    if (this.editingInvoiceId) {
      const existing = this.invoices.find(i => i.id === this.editingInvoiceId);
      payload.id = this.editingInvoiceId;
      payload.userId = existing?.userId;
      payload.createdAt = existing?.createdAt;
      payload.updatedAt = existing?.updatedAt;
      this.invoiceService.update(this.editingInvoiceId, payload).subscribe({
        next: () => { this.showToast('Invoice updated.', 'success'); this.submitting = false; this.closeFormModal(); this.loadData(); },
        error: () => { this.showToast('Could not update invoice.', 'danger'); this.submitting = false; }
      });
    } else {
      this.invoiceService.create(payload).subscribe({
        next: () => { this.showToast('Invoice created.', 'success'); this.submitting = false; this.closeFormModal(); this.loadData(); },
        error: () => { this.showToast('Could not create invoice.', 'danger'); this.submitting = false; }
      });
    }
  }

  async deleteInvoice(invoice: Invoice): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete invoice?',
      message: `Remove invoice ${invoice.invoiceCode}? This cannot be undone.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete', role: 'destructive', handler: () => {
            this.invoiceService.delete(invoice.id!).subscribe({
              next: () => {
                this.showToast('Invoice deleted.', 'success');
                this.closeDetailModal();
                this.loadData();
              },
              error: () => { this.showToast('Could not delete invoice.', 'danger'); }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  isInvalid(name: string): boolean {
    const ctrl = this.invoiceForm.get(name);
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  formatCurrency(value?: number): string {
    if (value == null) return '—';
    return 'R ' + value.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastController.create({ message, color, duration: 2500, position: 'bottom' });
    await toast.present();
  }
}
