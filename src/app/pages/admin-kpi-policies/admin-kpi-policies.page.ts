import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { AdminKpiPolicyService } from 'src/app/services/admin-kpi-policy-service';
import { ProductService } from 'src/app/services/product-service';
import { KpiPolicy } from 'src/app/models/entities/kpi-policy.model';
import { Product } from 'src/app/models/entities/product.model';

@Component({
  selector: 'app-admin-kpi-policies',
  templateUrl: './admin-kpi-policies.page.html',
  styleUrls: ['./admin-kpi-policies.page.scss'],
  standalone: false
})
export class AdminKpiPoliciesPage implements OnInit {
  policies: KpiPolicy[] = [];
  products: Product[] = [];
  loading = false;
  searchTerm = '';

  isDetailModalOpen = false;
  detailPolicy: KpiPolicy | null = null;

  isFormModalOpen = false;
  editingPolicyId?: number;
  policyForm: FormGroup;
  submitting = false;

  constructor(
    private policyService: AdminKpiPolicyService,
    private productService: ProductService,
    private fb: FormBuilder,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.policyForm = this.fb.group({
      // Scope
      productId: [null],
      effectiveFrom: ['', Validators.required],
      effectiveTo: [null],
      isActive: [true],
      // Target threshold
      targetMRR: [0, [Validators.required, Validators.min(0)]],

      // Consequence flags
      gracePeriodDays: [0, [Validators.required, Validators.min(0)]],
      autoFreezeOnBreach: [false]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  get displayedPolicies(): KpiPolicy[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.policies;
    return this.policies.filter(p => {
      const haystack = [
        this.getProductName(p.productId),
        p.isActive ? 'active' : 'inactive',
        p.effectiveFrom,
        p.effectiveTo
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(term);
    });
  }

  loadData(event?: any): void {
    this.loading = true;
    this.productService.getAll().subscribe({
      next: products => { this.products = products; this.loadPolicies(event); },
      error: () => { this.loadPolicies(event); }
    });
  }

  private loadPolicies(event?: any): void {
    this.policyService.getAll().subscribe({
      next: res => { this.policies = res; this.loading = false; if (event) event.target.complete(); },
      error: () => { this.showToast('Could not load policies.', 'danger'); this.loading = false; if (event) event.target.complete(); }
    });
  }

  refresh(event: any): void {
    this.loadData(event);
  }

  getProductName(productId?: number | null): string {
    if (!productId) return 'All Products';
    const product = this.products.find(p => p.id === productId);
    return product?.name || `Product #${productId}`;
  }

  // ── Detail modal ────────────────────────────
  openDetailModal(policy: KpiPolicy): void {
    this.detailPolicy = policy;
    this.isDetailModalOpen = true;
  }

  closeDetailModal(): void {
    this.isDetailModalOpen = false;
    this.detailPolicy = null;
  }

  // ── Form modal ──────────────────────────────
  openAddModal(): void {
    this.editingPolicyId = undefined;
    this.policyForm.reset({
      isActive: true,
      targetMRR: 0,
      gracePeriodDays: 0,
      autoFreezeOnBreach: false
    });

    this.isFormModalOpen = true;
  }

  openEditModal(policy: KpiPolicy): void {
    this.editingPolicyId = policy.id;
    this.policyForm.patchValue({
      productId: policy.productId ?? null,
      effectiveFrom: policy.effectiveFrom ?? '',
      effectiveTo: policy.effectiveTo ?? null,
      isActive: policy.isActive ?? true,
      targetMRR: policy.targetMRR ?? 0,
      gracePeriodDays: policy.gracePeriodDays ?? 0,

      autoFreezeOnBreach: policy.autoFreezeOnBreach ?? false
    });
    this.isFormModalOpen = true;
  }

  closeFormModal(): void {
    this.isFormModalOpen = false;
    this.editingPolicyId = undefined;
  }

  savePolicy(): void {
    if (this.policyForm.invalid) {
      this.policyForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const val = this.policyForm.getRawValue();
    const payload: KpiPolicy = {
      productId: val.productId != null ? +val.productId : null,
      effectiveFrom: val.effectiveFrom,
      effectiveTo: val.effectiveTo || null,
      isActive: val.isActive,
      targetMRR: +val.targetMRR,
      gracePeriodDays: +val.gracePeriodDays,

      autoFreezeOnBreach: val.autoFreezeOnBreach
    };

    if (this.editingPolicyId) {
      const existing = this.policies.find(p => p.id === this.editingPolicyId);
      payload.id = this.editingPolicyId;
      payload.userId = existing?.userId;
      payload.createdAt = existing?.createdAt;
      payload.updatedAt = existing?.updatedAt;
      this.policyService.update(this.editingPolicyId, payload).subscribe({
        next: () => { this.showToast('Policy updated.', 'success'); this.submitting = false; this.closeFormModal(); this.loadData(); },
        error: () => { this.showToast('Could not update policy.', 'danger'); this.submitting = false; }
      });
    } else {
      this.policyService.create(payload).subscribe({
        next: () => { this.showToast('Policy created.', 'success'); this.submitting = false; this.closeFormModal(); this.loadData(); },
        error: () => { this.showToast('Could not create policy.', 'danger'); this.submitting = false; }
      });
    }
  }

  async deletePolicy(policy: KpiPolicy): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete policy?',
      message: `Remove this policy for ${this.getProductName(policy.productId)}? This cannot be undone.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete', role: 'destructive', handler: () => {
            this.policyService.delete(policy.id!).subscribe({
              next: () => { this.policies = this.policies.filter(p => p.id !== policy.id); this.showToast('Policy deleted.', 'success'); this.closeDetailModal(); },
              error: () => { this.showToast('Could not delete policy.', 'danger'); }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  isInvalid(name: string): boolean {
    const ctrl = this.policyForm.get(name);
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  formatPercent(value?: number): string {
    if (value == null) return '—';
    return (value * 100).toFixed(1) + '%';
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
