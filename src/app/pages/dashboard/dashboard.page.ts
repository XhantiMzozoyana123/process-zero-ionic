import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from 'src/app/models/entities/product.model';
import { KPI } from 'src/app/models/entities/kpi.model';
import { Milestone } from 'src/app/models/milestone.model';
import { ProductService } from 'src/app/services/product-service';
import { KpiService } from 'src/app/services/kpi-service';
import { IntroService } from 'src/app/services/intro-service';
import { MilestoneService } from 'src/app/services/milestone-service';

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

  milestones: Milestone[] = [];
  loadingMilestones = false;
  allMilestonesComplete = false;
  milestonesDismissed = localStorage.getItem('milestones_dismissed') === 'true';
  milestonesCollapsed = localStorage.getItem('milestones_collapsed') === 'true';

  readonly reportDate = new Date();

  constructor(
    private productService: ProductService,
    private kpiService: KpiService,
    private introService: IntroService,
    private milestoneService: MilestoneService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadProducts();
    this.loadMilestones();
  }

  toggleMilestonesCollapsed(): void {
    this.milestonesCollapsed = !this.milestonesCollapsed;
    localStorage.setItem('milestones_collapsed', String(this.milestonesCollapsed));
  }

  get completedMilestones(): number {
    return this.milestones.filter(m => m.completed).length;
  }

  get milestoneProgress(): number {
    if (!this.milestones.length) return 0;
    return Math.round((this.completedMilestones / this.milestones.length) * 100);
  }

  get showMilestones(): boolean {
    return !this.milestonesDismissed && this.milestones.length > 0 && !this.allMilestonesComplete;
  }

  goToMilestone(milestone: Milestone): void {
    if (!milestone.completed) {
      if (milestone.id === 'update-kpi') {
        this.introService.startKpiFabTour(() => {
          const fabBtn = document.querySelector<HTMLElement>('.kpi-fab-btn');
          if (fabBtn) fabBtn.click();
        });
        return;
      }

      this.router.navigateByUrl(milestone.route).then(() => {
        const tourDelay = 800;
        const tourMap: Record<string, () => void> = {
          'product-assessment': () => this.introService.startProductsTour(),
          'browse-leads':       () => this.introService.startLeadLakeTour(),
          'add-contact':        () => this.introService.startContactsTour(),
          'book-meeting':       () => this.introService.startMeetingsTour(),
        };
        const tourFn = tourMap[milestone.id];
        if (tourFn) {
          setTimeout(tourFn, tourDelay);
        }
      });
    }
  }

  dismissMilestones(): void {
    this.milestonesDismissed = true;
    localStorage.setItem('milestones_dismissed', 'true');
  }

  private loadMilestones(): void {
    const cached = this.milestoneService.getCached();
    if (cached) {
      this.milestones = cached;
      this.allMilestonesComplete = cached.every(m => m.completed);
      this.loadingMilestones = false;
    } else {
      this.loadingMilestones = true;
    }

    this.milestoneService.getMilestones().subscribe({
      next: (milestones) => {
        this.milestones = milestones;
        this.allMilestonesComplete = milestones.every(m => m.completed);
        this.loadingMilestones = false;
      },
      error: () => {
        if (!cached) this.milestones = [];
        this.loadingMilestones = false;
      }
    });
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

    const k = this.latestKpi;
    return [
      {
        label: 'Deal Size Closed',
        value: this.formatCurrency(k.dealSizeClosed),
        detail: `${k.activeClients} active clients`,
        tone: 'gold'
      },
      {
        label: 'Monthly Recurring Revenue',
        value: this.formatCurrency(k.monthlyRecurringRevenue),
        detail: 'Derived from contacts + invoices',
        tone: 'teal'
      },
      {
        label: 'Meetings Booked',
        value: `${k.meetingsBooked}`,
        detail: 'Auto-tracked from meetings',
        tone: 'coral'
      },
      {
        label: 'Calls Made',
        value: `${k.callsMade}`,
        detail: `${k.callOutreach} call outreach`,
        tone: 'slate'
      }
    ];
  }

  get funnelMetrics(): Array<{ label: string; value: number; percent: number; accent: string }> {
    if (!this.latestKpi) {
      return [];
    }

    const k = this.latestKpi;
    const maxValue = Math.max(
      k.callOutreach,
      k.emailOutreach,
      k.callsMade,
      k.meetingsBooked,
      1
    );

    return [
      { label: 'Call Outreach', value: k.callOutreach, percent: this.toPercent(k.callOutreach, maxValue), accent: 'var(--dashboard-gold)' },
      { label: 'Email Outreach', value: k.emailOutreach, percent: this.toPercent(k.emailOutreach, maxValue), accent: 'var(--dashboard-teal)' },
      { label: 'Calls Made', value: k.callsMade, percent: this.toPercent(k.callsMade, maxValue), accent: 'var(--dashboard-blue)' },
      { label: 'Meetings Booked', value: k.meetingsBooked, percent: this.toPercent(k.meetingsBooked, maxValue), accent: 'var(--dashboard-coral)' }
    ];
  }

  get revenueMetrics(): Array<{ label: string; value: number; percent: number }> {
    if (!this.latestKpi) {
      return [];
    }

    const k = this.latestKpi;
    const values = [
      k.dealSizeClosed,
      k.monthlyRecurringRevenue
    ];
    const maxValue = Math.max(...values, 1);

    return [
      { label: 'Deal Size Closed', value: k.dealSizeClosed, percent: this.toPercent(k.dealSizeClosed, maxValue) },
      { label: 'Monthly Recurring Revenue', value: k.monthlyRecurringRevenue, percent: this.toPercent(k.monthlyRecurringRevenue, maxValue) }
    ];
  }

  get operatingMetrics(): Array<{ label: string; value: string; note: string }> {
    if (!this.latestKpi) {
      return [];
    }

    const k = this.latestKpi;
    return [
      {
        label: 'Active Clients',
        value: `${k.activeClients}`,
        note: 'Used for MRR calculation'
      },
      {
        label: 'Call Outreach',
        value: `${k.callOutreach}`,
        note: 'Call outreach made for the day'
      },
      {
        label: 'Email Outreach',
        value: `${k.emailOutreach}`,
        note: 'Email outreach made for the day'
      },
      {
        label: 'Meetings Booked',
        value: `${k.meetingsBooked}`,
        note: 'Auto-incremented on meeting creation'
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

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0,
    }).format(value || 0);
  }
}