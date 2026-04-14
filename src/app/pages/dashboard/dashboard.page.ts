import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/models/entities/product.model';
import { KPI } from 'src/app/models/entities/kpi.model';
import { ProductService } from 'src/app/services/product-service';
import { KpiService } from 'src/app/services/kpi-service';
import { IntroService } from 'src/app/services/intro-service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {
  products: Product[] = [];
  selectedProductId?: number;
  latestKpi?: KPI;

  loadingProducts = false;
  loadingKpi = false;
  errorMessage = '';

  readonly reportDate = new Date();

  constructor(
    private productService: ProductService,
    private kpiService: KpiService,
    private introService: IntroService
  ) { }

  ngOnInit() {
    this.loadProducts();
  }

  startTour(): void {
    this.introService.startDashboardTour();
  }

  get selectedProduct(): Product | undefined {
    return this.products.find((product) => product.id === this.selectedProductId);
  }

  get hasKpi(): boolean {
    return !!this.latestKpi;
  }

  get heroMetrics(): Array<{ label: string; value: string; detail: string; tone: string }> {
    if (!this.latestKpi) {
      return [];
    }

    const callAttendance = this.safePercent(this.latestKpi.callsAttended, this.latestKpi.callsBooked);
    const closeRate = this.safePercent(this.latestKpi.dealsClosed, this.latestKpi.dealsAttempted);

    return [
      {
        label: 'Revenue Generated',
        value: this.formatCurrency(this.latestKpi.revenueGenerated),
        detail: `${this.latestKpi.dealsInfluenced} deals influenced`,
        tone: 'gold'
      },
      {
        label: 'Call Attendance',
        value: `${callAttendance}%`,
        detail: `${this.latestKpi.callsAttended}/${this.latestKpi.callsBooked} calls attended`,
        tone: 'teal'
      },
      {
        label: 'Deal Close Rate',
        value: `${closeRate}%`,
        detail: `${this.latestKpi.dealsClosed}/${this.latestKpi.dealsAttempted} deals closed`,
        tone: 'coral'
      },
      {
        label: 'Monthly Recurring Revenue',
        value: this.formatCurrency(this.latestKpi.monthlyRecurringRevenue),
        detail: `${this.formatPercent(this.latestKpi.growthRate)} growth rate`,
        tone: 'slate'
      }
    ];
  }

  get funnelMetrics(): Array<{ label: string; value: number; percent: number; accent: string }> {
    if (!this.latestKpi) {
      return [];
    }

    const maxValue = Math.max(
      this.latestKpi.outreachAttempts,
      this.latestKpi.callsBooked,
      this.latestKpi.callsAttended,
      this.latestKpi.dealsInfluenced,
      this.latestKpi.dealsClosed,
      1
    );

    return [
      { label: 'Outreach Attempts', value: this.latestKpi.outreachAttempts, percent: this.toPercent(this.latestKpi.outreachAttempts, maxValue), accent: 'var(--dashboard-gold)' },
      { label: 'Calls Booked', value: this.latestKpi.callsBooked, percent: this.toPercent(this.latestKpi.callsBooked, maxValue), accent: 'var(--dashboard-teal)' },
      { label: 'Calls Attended', value: this.latestKpi.callsAttended, percent: this.toPercent(this.latestKpi.callsAttended, maxValue), accent: 'var(--dashboard-blue)' },
      { label: 'Deals Influenced', value: this.latestKpi.dealsInfluenced, percent: this.toPercent(this.latestKpi.dealsInfluenced, maxValue), accent: 'var(--dashboard-coral)' },
      { label: 'Deals Closed', value: this.latestKpi.dealsClosed, percent: this.toPercent(this.latestKpi.dealsClosed, maxValue), accent: 'var(--dashboard-ink)' }
    ];
  }

  get revenueMetrics(): Array<{ label: string; value: number; percent: number }> {
    if (!this.latestKpi) {
      return [];
    }

    const values = [
      this.latestKpi.revenueGenerated,
      this.latestKpi.revenueInfluenced,
      this.latestKpi.teamRevenue,
      this.latestKpi.monthlyRecurringRevenue,
      this.latestKpi.averageDealSize
    ];
    const maxValue = Math.max(...values, 1);

    return [
      { label: 'Revenue Generated', value: this.latestKpi.revenueGenerated, percent: this.toPercent(this.latestKpi.revenueGenerated, maxValue) },
      { label: 'Revenue Influenced', value: this.latestKpi.revenueInfluenced, percent: this.toPercent(this.latestKpi.revenueInfluenced, maxValue) },
      { label: 'Team Revenue', value: this.latestKpi.teamRevenue, percent: this.toPercent(this.latestKpi.teamRevenue, maxValue) },
      { label: 'MRR', value: this.latestKpi.monthlyRecurringRevenue, percent: this.toPercent(this.latestKpi.monthlyRecurringRevenue, maxValue) },
      { label: 'Average Deal Size', value: this.latestKpi.averageDealSize, percent: this.toPercent(this.latestKpi.averageDealSize, maxValue) }
    ];
  }

  get healthMetrics(): Array<{ label: string; value: number; descriptor: string; ring: string }> {
    if (!this.latestKpi) {
      return [];
    }

    return [
      {
        label: 'Client Retention',
        value: this.toMetricPercent(this.latestKpi.clientRetention || this.latestKpi.basicClientRetention),
        descriptor: 'Retention quality',
        ring: this.getRingStyle(this.toMetricPercent(this.latestKpi.clientRetention || this.latestKpi.basicClientRetention), '#1d7874', '#d9ece7')
      },
      {
        label: 'Team Performance',
        value: this.toMetricPercent(this.latestKpi.teamPerformanceHealth),
        descriptor: 'Execution health',
        ring: this.getRingStyle(this.toMetricPercent(this.latestKpi.teamPerformanceHealth), '#335c67', '#d8e3e7')
      },
      {
        label: 'Brand Compliance',
        value: this.toMetricPercent(this.latestKpi.brandCompliance),
        descriptor: 'Standards adherence',
        ring: this.getRingStyle(this.toMetricPercent(this.latestKpi.brandCompliance), '#c06c52', '#f0ddd6')
      },
      {
        label: 'Leadership Stability',
        value: this.toMetricPercent(this.latestKpi.leadershipStability),
        descriptor: 'Leadership durability',
        ring: this.getRingStyle(this.toMetricPercent(this.latestKpi.leadershipStability), '#d7a449', '#f6ead1')
      }
    ];
  }

  get operatingMetrics(): Array<{ label: string; value: string; note: string }> {
    if (!this.latestKpi) {
      return [];
    }

    return [
      {
        label: 'Average Deal Size',
        value: this.formatCurrency(this.latestKpi.averageDealSize),
        note: 'Per closed deal'
      },
      {
        label: 'Activity Consistency',
        value: this.formatPercent(this.latestKpi.activityConsistency),
        note: 'Consistent execution cadence'
      },
      {
        label: 'Active Team Size',
        value: `${this.latestKpi.activeTeamSize}`,
        note: 'Current active contributors'
      },
      {
        label: 'Team Churn Rate',
        value: this.formatPercent(this.latestKpi.teamChurnRate),
        note: 'Lower is healthier'
      },
      {
        label: 'Strategic Initiatives',
        value: `${this.latestKpi.strategicInitiativesDelivered}`,
        note: 'Major initiatives delivered'
      },
      {
        label: 'Innovation Contribution',
        value: this.formatPercent(this.latestKpi.innovationContribution),
        note: 'Innovation contribution score'
      }
    ];
  }

  onProductChange() {
    if (!this.selectedProductId) {
      this.latestKpi = undefined;
      this.errorMessage = '';
      return;
    }

    this.loadLatestKpi(this.selectedProductId);
  }

  refresh(event: CustomEvent<{ complete?: () => void }>) {
    if (this.selectedProductId) {
      this.loadLatestKpi(this.selectedProductId, event);
      return;
    }

    this.loadProducts(event);
  }

  private loadProducts(event?: CustomEvent<{ complete?: () => void }>) {
    this.loadingProducts = true;
    this.errorMessage = '';

    this.productService.getAll().subscribe({
      next: (products) => {
        this.products = products;
        this.loadingProducts = false;

        if (!this.products.length) {
          this.latestKpi = undefined;
          this.completeRefresh(event);
          return;
        }

        if (!this.selectedProductId || !this.products.some((product) => product.id === this.selectedProductId)) {
          this.selectedProductId = this.products[0].id;
        }

        this.loadLatestKpi(this.selectedProductId, event);
      },
      error: () => {
        this.loadingProducts = false;
        this.latestKpi = undefined;
        this.errorMessage = 'Could not load products for KPI reporting.';
        this.completeRefresh(event);
      }
    });
  }

  private loadLatestKpi(productId?: number, event?: CustomEvent<{ complete?: () => void }>) {
    if (!productId) {
      this.latestKpi = undefined;
      this.completeRefresh(event);
      return;
    }

    this.loadingKpi = true;
    this.errorMessage = '';

    this.kpiService.getLatestKpi(productId).subscribe({
      next: (kpi) => {
        this.latestKpi = kpi;
        this.loadingKpi = false;
        this.completeRefresh(event);
      },
      error: (err) => {
        this.latestKpi = undefined;
        this.loadingKpi = false;
        this.errorMessage = err?.status === 404
          ? 'No KPI snapshot has been recorded for this product yet.'
          : 'Could not load KPI metrics right now.';
        this.completeRefresh(event);
      }
    });
  }

  private completeRefresh(event?: CustomEvent<{ complete?: () => void }>) {
    event?.detail?.complete?.();
  }

  private safePercent(value: number, total: number): number {
    if (!total) {
      return 0;
    }

    return this.normalizePercent((value / total) * 100);
  }

  private toPercent(value: number, maxValue: number): number {
    if (!maxValue) {
      return 0;
    }

    return Math.max(8, this.normalizePercent((value / maxValue) * 100));
  }

  private normalizePercent(value: number): number {
    if (!Number.isFinite(value)) {
      return 0;
    }

    return Math.max(0, Math.min(100, Math.round(value)));
  }

  private toMetricPercent(value: number): number {
    if (!Number.isFinite(value)) {
      return 0;
    }

    const normalized = value <= 1 ? value * 100 : value;
    return this.normalizePercent(normalized);
  }

  private formatPercent(value: number): string {
    return `${this.toMetricPercent(value)}%`;
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0,
    }).format(value || 0);
  }

  private getRingStyle(value: number, color: string, trackColor: string): string {
    return `conic-gradient(${color} 0 ${value}%, ${trackColor} ${value}% 100%)`;
  }

}
