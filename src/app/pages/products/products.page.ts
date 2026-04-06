import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Product } from 'src/app/models/entities/product.model';
import { ProductService } from 'src/app/services/product-service';
import { AssessmentService } from 'src/app/services/assessment-service';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
  standalone: false,
})
export class ProductsPage implements OnInit {
  products: Product[] = [];

  loading = false;
  searchTerm = '';
  errorMessage = '';

  viewMode: 'table' | 'cards' = 'table';
  currentPage = 1;
  pageSize = 6;

  isDetailModalOpen = false;
  detailProduct: Product | null = null;

  /** Set of product IDs the user has passed assessments for */
  qualifiedProductIds = new Set<number>();
  assessmentCheckLoading = true;

  constructor(
    private productService: ProductService,
    private assessmentService: AssessmentService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  get filteredProducts(): Product[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.products;

    return this.products.filter((product) => {
      const haystack = [
        product.name,
        product.description,
        product.url,
        product.negotiableAmounts,
        product.actualAmount?.toString(),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }

  get displayedProducts(): Product[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredProducts.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.pageSize) || 1;
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

  loadProducts(event?: any): void {
    this.loading = true;
    this.errorMessage = '';

    this.productService.getAll().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
        if (event) event.target.complete();
        this.checkAssessmentStatuses();
      },
      error: async () => {
        this.errorMessage = 'Could not load products.';
        this.loading = false;
        if (event) event.target.complete();
        await this.showToast('Failed to load products', 'danger');
      },
    });
  }

  refresh(event: any): void {
    this.loadProducts(event);
  }

  /** Check which products the user has passed assessments for */
  private checkAssessmentStatuses(): void {
    this.assessmentCheckLoading = true;
    this.qualifiedProductIds.clear();
    let pending = this.products.length;
    if (pending === 0) {
      this.assessmentCheckLoading = false;
      return;
    }
    for (const product of this.products) {
      if (!product.id) { pending--; if (pending === 0) this.assessmentCheckLoading = false; continue; }
      this.assessmentService.getMyProductResult(product.id).subscribe({
        next: (result) => {
          if (result.passed) this.qualifiedProductIds.add(product.id!);
          pending--;
          if (pending === 0) this.assessmentCheckLoading = false;
        },
        error: () => {
          pending--;
          if (pending === 0) this.assessmentCheckLoading = false;
        }
      });
    }
  }

  isQualified(product: Product): boolean {
    return this.qualifiedProductIds.has(product.id!);
  }

  takeAssessment(product: Product, event?: Event): void {
    if (event) event.stopPropagation();
    this.router.navigate(['/account/assessments'], { queryParams: { productId: product.id } });
  }

  openDetailModal(product: Product): void {
    this.detailProduct = product;
    this.isDetailModalOpen = true;
  }

  closeDetailModal(): void {
    this.isDetailModalOpen = false;
    this.detailProduct = null;
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
