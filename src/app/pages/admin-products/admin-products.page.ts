import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { ProductService } from 'src/app/services/product-service';
import { Product } from 'src/app/models/entities/product.model';

@Component({
  selector: 'app-admin-products',
  templateUrl: './admin-products.page.html',
  styleUrls: ['./admin-products.page.scss'],
  standalone: false
})
export class AdminProductsPage implements OnInit {
  products: Product[] = [];
  loading = false;
  searchTerm = '';

  isDetailModalOpen = false;
  detailProduct: Product | null = null;

  isFormModalOpen = false;
  editingProductId?: number;
  productForm: FormGroup;
  submitting = false;
  showDescPreview = false;

  constructor(
    private productService: ProductService,
    private fb: FormBuilder,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      actualAmount: [0, [Validators.required, Validators.min(0)]],
      url: [''],
      negotiableAmounts: [''],
      profilePictureBase64: [''],
      calEventTypeId: [null]
    });
  }

  ngOnInit() {
    this.loadProducts();
  }

  get displayedProducts(): Product[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.products;
    return this.products.filter(p => {
      const haystack = [p.name, p.description, p.url]
        .filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(term);
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAll().subscribe({
      next: res => { this.products = res; this.loading = false; },
      error: () => { this.showToast('Could not load products.', 'danger'); this.loading = false; }
    });
  }

  refresh(event: any): void {
    this.productService.getAll().subscribe({
      next: res => { this.products = res; event.target.complete(); },
      error: () => { this.showToast('Could not refresh products.', 'danger'); event.target.complete(); }
    });
  }

  // ── Detail modal ────────────────────────────
  openDetailModal(product: Product): void {
    this.detailProduct = product;
    this.isDetailModalOpen = true;
  }

  closeDetailModal(): void {
    this.isDetailModalOpen = false;
    this.detailProduct = null;
  }

  // ── Form modal ──────────────────────────────
  openAddModal(): void {
    this.editingProductId = undefined;
    this.productForm.reset({ actualAmount: 0 });
    this.isFormModalOpen = true;
  }

  openEditModal(product: Product): void {
    this.editingProductId = product.id;
    this.productForm.patchValue({
      name: product.name ?? '',
      description: product.description ?? '',
      actualAmount: product.actualAmount ?? 0,
      url: product.url ?? '',
      negotiableAmounts: product.negotiableAmounts ?? '',
      profilePictureBase64: product.profilePictureBase64 ?? '',
      calEventTypeId: product.calEventTypeId ?? null
    });
    this.isFormModalOpen = true;
  }

  closeFormModal(): void {
    this.isFormModalOpen = false;
    this.editingProductId = undefined;
  }

  saveProduct(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const val = this.productForm.getRawValue();
    const payload: Product = {
      name: val.name.trim(),
      description: val.description?.trim() || undefined,
      actualAmount: +val.actualAmount,
      url: val.url?.trim() || undefined,
      negotiableAmounts: val.negotiableAmounts?.trim() || undefined,
      profilePictureBase64: val.profilePictureBase64?.trim() || undefined,
      calEventTypeId: val.calEventTypeId != null ? +val.calEventTypeId : undefined
    };

    if (this.editingProductId) {
      const existing = this.products.find(p => p.id === this.editingProductId);
      payload.id = this.editingProductId;
      payload.userId = existing?.userId;
      payload.createdAt = existing?.createdAt;
      payload.updatedAt = existing?.updatedAt;
      this.productService.update(this.editingProductId, payload).subscribe({
        next: () => { this.showToast('Product updated.', 'success'); this.submitting = false; this.closeFormModal(); this.loadProducts(); },
        error: () => { this.showToast('Could not update product.', 'danger'); this.submitting = false; }
      });
    } else {
      this.productService.create(payload).subscribe({
        next: () => { this.showToast('Product created.', 'success'); this.submitting = false; this.closeFormModal(); this.loadProducts(); },
        error: () => { this.showToast('Could not create product.', 'danger'); this.submitting = false; }
      });
    }
  }

  async deleteProduct(product: Product): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete product?',
      message: `Remove "${product.name}"? This cannot be undone.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete', role: 'destructive', handler: () => {
            this.productService.delete(product.id!).subscribe({
              next: () => { this.products = this.products.filter(p => p.id !== product.id); this.showToast('Product deleted.', 'success'); this.closeDetailModal(); },
              error: () => { this.showToast('Could not delete product.', 'danger'); }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  isInvalid(name: string): boolean {
    const ctrl = this.productForm.get(name);
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
