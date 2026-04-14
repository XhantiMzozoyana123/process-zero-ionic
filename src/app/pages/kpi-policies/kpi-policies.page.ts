import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { KpiPolicy } from 'src/app/models/entities/kpi-policy.model';
import { Product } from 'src/app/models/entities/product.model';
import { KpiPolicyService } from 'src/app/services/kpi-policy-service';
import { ProductService } from 'src/app/services/product-service';
import { IntroService } from 'src/app/services/intro-service';

@Component({
  selector: 'app-kpi-policies',
  templateUrl: './kpi-policies.page.html',
  styleUrls: ['./kpi-policies.page.scss'],
  standalone: false,
})
export class KpiPoliciesPage implements OnInit {
  policies: KpiPolicy[] = [];
  products: Product[] = [];

  loading = false;
  searchTerm = '';
  errorMessage = '';

  viewMode: 'table' | 'cards' = 'table';
  currentPage = 1;
  pageSize = 6;

  isDetailModalOpen = false;
  detailPolicy: KpiPolicy | null = null;

  constructor(
    private kpiPolicyService: KpiPolicyService,
    private productService: ProductService,
    private toastCtrl: ToastController,
    private introService: IntroService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  startTour(): void {
    this.introService.startKpiPoliciesTour();
  }

  get filteredPolicies(): KpiPolicy[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.policies;

    return this.policies.filter((p) => {
      const haystack = [
        this.getProductName(p.productId),
        p.isActive ? 'active' : 'inactive',
        p.effectiveFrom,
        p.effectiveTo,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }

  get displayedPolicies(): KpiPolicy[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredPolicies.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredPolicies.length / this.pageSize) || 1;
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

  loadData(event?: any): void {
    this.loading = true;
    this.errorMessage = '';

    this.productService.getAll().subscribe({
      next: (products) => {
        this.products = products;
        this.loadPolicies(event);
      },
      error: () => {
        this.loadPolicies(event);
      },
    });
  }

  private loadPolicies(event?: any): void {
    this.kpiPolicyService.getAll().subscribe({
      next: (policies) => {
        this.policies = policies;
        this.loading = false;
        if (event) event.target.complete();
      },
      error: async () => {
        this.errorMessage = 'Could not load KPI policies.';
        this.loading = false;
        if (event) event.target.complete();
        await this.showToast('Failed to load KPI policies', 'danger');
      },
    });
  }

  refresh(event: any): void {
    this.loadData(event);
  }

  getProductName(productId?: number | null): string {
    if (!productId) return 'All Products';
    const product = this.products.find((p) => p.id === productId);
    return product?.name || `Product #${productId}`;
  }

  openDetailModal(policy: KpiPolicy): void {
    this.detailPolicy = policy;
    this.isDetailModalOpen = true;
  }

  closeDetailModal(): void {
    this.isDetailModalOpen = false;
    this.detailPolicy = null;
  }

  formatPercent(value?: number): string {
    if (value == null) return '—';
    return (value * 100).toFixed(1) + '%';
  }

  formatCurrency(value?: number): string {
    if (value == null) return '—';
    return 'R ' + value.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  private async showToast(message: string, color: 'success' | 'danger'): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'top',
    });
    await toast.present();
  }
}
