import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Observable } from 'rxjs';

import { KpiService } from 'src/app/services/kpi-service';
import { KPI } from 'src/app/models/entities/kpi.model';
import { ProductService } from 'src/app/services/product-service';
import { Product } from 'src/app/models/entities/product.model';

/**
 * Lets a sales rep log their daily KPI activity for a product.
 *
 * The backend activity endpoints are additive: each submit adds the entered
 * amount to the running daily total. MeetingsBooked is auto-tracked by the
 * backend (no input), and MRR / ActiveClients are recalculated automatically.
 */
@Component({
  selector: 'app-kpi-form',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
  ],
  templateUrl: './kpi-form.component.html',
  styleUrls: ['./kpi-form.component.scss'],
})
export class KpiFormComponent implements OnInit {

  products: Product[] = [];
  loading = false;
  initializing = false;
  message = '';
  isError = false;
  kpi?: KPI;
  productId?: number;

  // Amounts to add on the next submit.
  callOutreachToAdd = 1;
  emailOutreachToAdd = 1;
  callsMadeToAdd = 1;
  dealAmount = 0;

  constructor(
    private kpiService: KpiService,
    private productService: ProductService,
  ) {}

  ngOnInit(): void {
    this.loadProductsAndKpi();
  }

  private loadProductsAndKpi(): void {
    this.initializing = true;
    this.productService.getAll().subscribe({
      next: (products) => {
        this.products = products ?? [];
        this.productId = this.products[0]?.id;
        if (this.productId) {
          this.refreshLatestKpi(this.productId);
        }
        this.initializing = false;
      },
      error: (err) => {
        console.error('Failed to load products', err);
        this.setMessage('Failed to load products.', true);
        this.initializing = false;
      }
    });
  }

  private refreshLatestKpi(productId: number): void {
    this.kpiService.getLatestKpi(productId).subscribe({
      next: (kpi) => {
        this.kpi = kpi ?? undefined;
      },
      error: (err) => {
        // 404 simply means no snapshot has been recorded yet — not a hard error.
        if (err?.status === 404) {
          this.kpi = undefined;
        } else {
          console.error('Failed to refresh KPI', err);
        }
      }
    });
  }

  onProductChange(): void {
    const normalizedProductId = this.toNumber(this.productId);
    if (!Number.isFinite(normalizedProductId) || normalizedProductId < 1) {
      this.productId = undefined;
      return;
    }

    this.productId = normalizedProductId;
    this.kpi = undefined;
    this.message = '';
    this.refreshLatestKpi(normalizedProductId);
  }

  // ── Activity submissions ───────────────────────────────────

  addCallOutreach(): void {
    this.runCountUpdate(this.callOutreachToAdd, 'Call outreach',
      (productId, count) => this.kpiService.addCallOutreach(productId, count));
  }

  addEmailOutreach(): void {
    this.runCountUpdate(this.emailOutreachToAdd, 'Email outreach',
      (productId, count) => this.kpiService.addEmailOutreach(productId, count));
  }

  addCallsMade(): void {
    this.runCountUpdate(this.callsMadeToAdd, 'Calls made',
      (productId, count) => this.kpiService.addCallsMade(productId, count));
  }

  addDealClosed(): void {
    const productId = this.requireProductId();
    if (productId === null) return;

    const amount = this.toNumber(this.dealAmount);
    if (!Number.isFinite(amount) || amount < 0) {
      this.setMessage('Deal amount must be 0 or greater.', true);
      return;
    }

    this.run(this.kpiService.addDealClosed(productId, amount), 'Deal closed recorded', productId);
  }

  recalculateMrr(): void {
    const productId = this.requireProductId();
    if (productId === null) return;
    this.run(this.kpiService.recalculateMrr(productId), 'MRR recalculated', productId);
  }

  // ── Helpers ────────────────────────────────────────────────

  private runCountUpdate(
    rawCount: number,
    label: string,
    factory: (productId: number, count: number) => Observable<void>
  ): void {
    const productId = this.requireProductId();
    if (productId === null) return;

    const count = this.toNumber(rawCount);
    if (!Number.isFinite(count) || count < 1 || !Number.isInteger(count)) {
      this.setMessage(`${label} must be a whole number of 1 or greater.`, true);
      return;
    }

    this.run(factory(productId, count), `${label} saved`, productId);
  }

  private run(update$: Observable<void>, successMessage: string, productId: number): void {
    this.loading = true;
    update$.subscribe({
      next: () => {
        this.loading = false;
        this.setMessage(`${successMessage}!`, false);
        this.refreshLatestKpi(productId);
      },
      error: (err: unknown) => {
        console.error(err);
        this.loading = false;
        const backendMessage = this.extractBackendMessage(err);
        this.setMessage(backendMessage || `Failed to save ${successMessage.toLowerCase()}.`, true);
      }
    });
  }

  private requireProductId(): number | null {
    const productId = this.toNumber(this.productId);
    if (!Number.isFinite(productId) || productId < 1) {
      this.setMessage('Product not loaded yet.', true);
      return null;
    }
    return productId;
  }

  private setMessage(message: string, isError: boolean): void {
    this.message = message;
    this.isError = isError;
  }

  private toNumber(value: unknown): number {
    const num = Number(value);
    return Number.isFinite(num) ? num : NaN;
  }

  private extractBackendMessage(err: unknown): string {
    const httpError = err as any;
    const rawError = httpError?.error;

    if (typeof rawError === 'string' && rawError.trim()) {
      return rawError.trim();
    }

    const modelState = httpError?.error?.errors;
    const modelStateMessage = modelState
      ? Object.values(modelState)
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

    return (
      httpError?.error?.error ||
      httpError?.error?.message ||
      httpError?.error?.title ||
      modelStateMessage ||
      (httpError?.status === 500 ? 'Server error while saving KPI. Verify this product belongs to your account.' : '') ||
      ''
    );
  }
}
