import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Observable } from 'rxjs';

import { KpiService } from 'src/app/services/kpi-service';
import { KPI } from 'src/app/models/entities/kpi.model';
import { ProductService } from 'src/app/services/product-service';
import { Product } from 'src/app/models/entities/product.model';


@Component({
  selector: 'app-kpi-form',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    IonicModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './kpi-form.component.html',
  styleUrls: ['./kpi-form.component.scss'],
})
export class KpiFormComponent implements OnInit {

  kpiForm!: FormGroup;
  products: Product[] = [];
  loading = false;
  initializing = false;
  message = '';
  kpi!: KPI;
  productId?: number;

  // Fields mapped to available KPI controller endpoints.
  private readonly supportedUpdateFields = new Set<string>([
    'outreachAttempts',
    'callsBooked',
    'callsAttended',
    'dealsInfluenced',
    'revenueGenerated',
    'dealsClosed',
    'dealsAttempted',
    'averageDealSize',
    'revenueInfluenced',
    'basicClientRetention',
    'activityConsistency',
    'activeTeamSize',
    'teamRevenue',
    'teamCloseRate',
    'teamChurnRate',
    'leaderActivityLevel',
    'monthlyRecurringRevenue',
    'growthRate',
    'teamPerformanceHealth',
    'clientRetention',
    'longTermRevenueGrowth',
    'leadershipStability',
    'brandCompliance',
    'strategicInitiativesDelivered',
    'brandRiskManagement',
    'innovationContribution'
  ]);

  constructor(
    private fb: FormBuilder,
    private kpiService: KpiService,
    private productService: ProductService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadProductsAndKpi();
  }

  private initForm(): void {
    this.kpiForm = this.fb.group({
      // Core activity
      outreachAttempts:  [0, [Validators.min(0)]],
      callsBooked:       [0, [Validators.min(0)]],
      callsAttended:     [0, [Validators.min(0)]],
      dealsInfluenced:   [0, [Validators.min(0)]],
      revenueGenerated:  [0, [Validators.min(0)]],

      // Deal performance
      dealsClosed:           [0, [Validators.min(0)]],
      dealsAttempted:        [1, [Validators.min(1)]],
      averageDealSize:       [0, [Validators.min(0)]],
      revenueInfluenced:     [0, [Validators.min(0)]],
      basicClientRetention:  [0, [Validators.min(0), Validators.max(1)]],
      activityConsistency:   [false],

      // Team metrics
      activeTeamSize:      [{ value: 0, disabled: true }],
      teamRevenue:         [{ value: 0, disabled: true }],
      teamCloseRate:       [{ value: 0, disabled: true }],
      teamChurnRate:       [{ value: 0, disabled: true }],
      leaderActivityLevel: [{ value: 0, disabled: true }],

      // Business health metrics
      monthlyRecurringRevenue:       [{ value: 0, disabled: true }],
      growthRate:                    [{ value: 0, disabled: true }],
      teamPerformanceHealth:         [{ value: 0, disabled: true }],
      clientRetention:               [{ value: 0, disabled: true }],
      longTermRevenueGrowth:         [{ value: 0, disabled: true }],
      leadershipStability:           [{ value: 0, disabled: true }],
      brandCompliance:               [0, [Validators.min(0), Validators.max(1)]],
      strategicInitiativesDelivered: [0, [Validators.min(0)]],
      brandRiskManagement:           [0, [Validators.min(0), Validators.max(1)]],
      innovationContribution:        [0, [Validators.min(0), Validators.max(1)]],
    });
  }

  private refreshLatestKpi(productId: number): void {
    this.kpiService.getLatestKpi(productId).subscribe({
      next: (kpi) => {
        if (!kpi) return;
        this.kpi = kpi;
        this.kpiForm.patchValue(kpi);
        // Reset event toggles after refresh to avoid accidental repeated submits.
        this.kpiForm.get('activityConsistency')?.setValue(false, { emitEvent: false });
      },
      error: (err) => console.error('Failed to refresh KPI', err)
    });
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
        this.message = 'Failed to load products.';
        this.initializing = false;
      }
    });
  }

  onProductChange(): void {
    const normalizedProductId = this.toNumber(this.productId);
    if (!this.isFiniteNumber(normalizedProductId) || normalizedProductId < 1) {
      this.productId = undefined;
      return;
    }

    this.productId = normalizedProductId;

    this.message = '';
    this.refreshLatestKpi(normalizedProductId);
  }

  submitField(fieldKey: string): void {
    if (!this.canSubmitField(fieldKey)) {
      this.message = `${fieldKey} is read-only in the current API.`;
      return;
    }

    const control = this.kpiForm.get(fieldKey);
    if (!control || control.invalid) {
      this.message = `Invalid value for ${fieldKey}`;
      return;
    }

    const productId = this.toNumber(this.productId);
    if (!this.isFiniteNumber(productId) || productId < 1) {
      this.message = 'Product not loaded yet.';
      return;
    }

    this.loading = true;
    const value = control.value;

    const numericValue = this.toNumber(value);
    const dealsClosedValue = this.toNumber(this.kpiForm.get('dealsClosed')?.value);
    const dealsAttemptedValue = this.toNumber(this.kpiForm.get('dealsAttempted')?.value);

    let update$: Observable<void> | undefined;

    // Map fieldKey to KPI service calls
    switch (fieldKey) {
      case 'outreachAttempts': {
        if (!this.isFiniteNumber(numericValue) || numericValue < 0) {
          this.loading = false;
          this.message = 'Outreach attempts must be 0 or greater.';
          return;
        }
        update$ = this.kpiService.updateOutreach(productId, numericValue);
        break;
      }
      case 'callsBooked': update$ = this.kpiService.incrementCallsBooked(productId); break;
      case 'callsAttended': {
        if (!this.isFiniteNumber(numericValue) || numericValue < 0 || !Number.isInteger(numericValue)) {
          this.loading = false;
          this.message = 'Calls attended must be a whole number 0 or greater.';
          return;
        }
        update$ = this.kpiService.confirmCallAttendance(productId, numericValue);
        break;
      }
      case 'dealsInfluenced': {
        if (!this.isFiniteNumber(numericValue) || numericValue < 0) {
          this.loading = false;
          this.message = 'Deals influenced must be 0 or greater.';
          return;
        }
        update$ = this.kpiService.incrementDealsInfluenced(productId, numericValue);
        break;
      }
      case 'revenueGenerated': {
        if (!this.isFiniteNumber(numericValue) || numericValue < 0) {
          this.loading = false;
          this.message = 'Revenue generated must be 0 or greater.';
          return;
        }
        update$ = this.kpiService.addRevenueGenerated(productId, numericValue);
        break;
      }
      case 'dealsClosed':
      case 'dealsAttempted': {
        if (!this.isFiniteNumber(dealsClosedValue) || dealsClosedValue < 0) {
          this.loading = false;
          this.message = 'Deals closed must be 0 or greater.';
          return;
        }

        if (!this.isFiniteNumber(dealsAttemptedValue) || dealsAttemptedValue < 1) {
          this.loading = false;
          this.message = 'Deals attempted must be at least 1.';
          return;
        }

        update$ = this.kpiService.updateCloseRate(productId, dealsClosedValue, dealsAttemptedValue);
        break;
      }
      case 'averageDealSize': {
        if (!this.isFiniteNumber(numericValue) || numericValue < 0) {
          this.loading = false;
          this.message = 'Average deal size must be 0 or greater.';
          return;
        }
        update$ = this.kpiService.updateAverageDealSize(productId, numericValue);
        break;
      }
      case 'revenueInfluenced': {
        if (!this.isFiniteNumber(numericValue) || numericValue < 0) {
          this.loading = false;
          this.message = 'Revenue influenced must be 0 or greater.';
          return;
        }
        update$ = this.kpiService.updateRevenueInfluenced(productId, numericValue);
        break;
      }
      case 'basicClientRetention': {
        if (!this.isFiniteNumber(numericValue) || numericValue < 0 || numericValue > 1) {
          this.loading = false;
          this.message = 'Client retention must be between 0 and 1.';
          return;
        }
        update$ = this.kpiService.updateBasicClientRetention(productId, numericValue);
        break;
      }
      case 'activityConsistency': update$ = this.kpiService.updateActivityConsistency(productId, this.toBoolean(value)); break;
      case 'activeTeamSize': update$ = this.kpiService.updateActiveTeamSize(productId); break;
      case 'teamRevenue': update$ = this.kpiService.updateTeamRevenue(productId); break;
      case 'teamCloseRate': update$ = this.kpiService.updateTeamCloseRate(productId); break;
      case 'teamChurnRate': update$ = this.kpiService.updateTeamChurnRate(productId); break;
      case 'leaderActivityLevel': update$ = this.kpiService.updateLeaderActivityLevel(productId); break;
      case 'monthlyRecurringRevenue': update$ = this.kpiService.updateMonthlyRecurringRevenue(productId); break;
      case 'growthRate': update$ = this.kpiService.updateGrowthRate(productId); break;
      case 'teamPerformanceHealth': update$ = this.kpiService.updateTeamPerformanceHealth(productId); break;
      case 'clientRetention': update$ = this.kpiService.updateClientRetentionExternal(productId); break;
      case 'longTermRevenueGrowth': update$ = this.kpiService.updateLongTermRevenueGrowth(productId); break;
      case 'leadershipStability': update$ = this.kpiService.updateLeadershipStability(productId); break;
      case 'brandCompliance': {
        if (!this.isFiniteNumber(numericValue) || numericValue < 0 || numericValue > 1) {
          this.loading = false;
          this.message = 'Brand compliance must be between 0 and 1.';
          return;
        }
        update$ = this.kpiService.updateBrandCompliance(productId, numericValue);
        break;
      }
      case 'strategicInitiativesDelivered': {
        if (!this.isFiniteNumber(numericValue) || numericValue < 0) {
          this.loading = false;
          this.message = 'Strategic initiatives must be 0 or greater.';
          return;
        }
        update$ = this.kpiService.updateStrategicInitiativesDelivered(productId, numericValue);
        break;
      }
      case 'brandRiskManagement': {
        if (!this.isFiniteNumber(numericValue) || numericValue < 0 || numericValue > 1) {
          this.loading = false;
          this.message = 'Brand risk must be between 0 and 1.';
          return;
        }
        update$ = this.kpiService.updateBrandRiskManagement(productId, numericValue);
        break;
      }
      case 'innovationContribution': {
        if (!this.isFiniteNumber(numericValue) || numericValue < 0 || numericValue > 1) {
          this.loading = false;
          this.message = 'Innovation contribution must be between 0 and 1.';
          return;
        }
        update$ = this.kpiService.updateInnovationContribution(productId, numericValue);
        break;
      }
      default:
        this.loading = false;
        this.message = `No API endpoint is configured for ${fieldKey}.`;
        return;
    }

    update$?.subscribe({
      next: () => {
        this.loading = false;
        this.message = `${fieldKey} saved successfully!`;
        this.refreshLatestKpi(productId);
      },
      error: (err: unknown) => {
        console.error(err);
        this.loading = false;
        const backendMessage = this.extractBackendMessage(err);
        this.message = backendMessage || `Failed to save ${fieldKey}`;
      }
    });
  }

  canSubmitField(fieldKey: string): boolean {
    return this.supportedUpdateFields.has(fieldKey);
  }

  private toNumber(value: unknown): number {
    const num = Number(value);
    return Number.isFinite(num) ? num : NaN;
  }

  private isFiniteNumber(value: number): boolean {
    return Number.isFinite(value);
  }

  private toBoolean(value: unknown): boolean {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      return value.trim().toLowerCase() === 'true' || value.trim() === '1';
    }

    if (typeof value === 'number') {
      return value === 1;
    }

    return false;
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
      (httpError?.status === 500 ? 'Server error while saving KPI. Verify this product belongs to your account and backend KPI service can create/update records for it.' : '') ||
      ''
    );
  }
}
