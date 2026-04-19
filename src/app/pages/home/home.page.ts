import { Component, AfterViewInit, OnDestroy, ElementRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements AfterViewInit, OnDestroy {
  featureLinks = [
    { icon: 'globe-outline', title: 'Lead Lake', desc: 'Prospect intelligence hub', route: '/features/lead-lake' },
    { icon: 'people-outline', title: 'My Contacts', desc: 'Manage your pipeline', route: '/features/contacts' },
    { icon: 'calendar-outline', title: 'Meetings', desc: 'Schedule & track calls', route: '/features/meetings' },
    { icon: 'cube-outline', title: 'Products', desc: 'Digital product catalogue', route: '/features/products' },
    { icon: 'stats-chart-outline', title: 'KPI Form & Policies', desc: 'Performance tracking', route: '/features/kpi' },
  ];

  features = [
    {
      icon: 'flash-outline',
      title: 'No Product Development',
      description: 'Skip the grind of building a product. We connect you with proven digital offers ready to sell.',
    },
    {
      icon: 'cash-outline',
      title: '20% Commission Per Sale',
      description: 'Earn a 20% commission on every successful deal you close — simple, transparent, and rewarding.',
    },
    {
      icon: 'sync-outline',
      title: 'Recurring Income',
      description: 'Get paid for as long as the customer stays active. Your effort compounds into ongoing revenue.',
    },
    {
      icon: 'people-outline',
      title: 'Contact & Lead Tools',
      description: 'Manage leads, contacts, and meetings in one place — everything you need to close more deals.',
    },
    {
      icon: 'bar-chart-outline',
      title: 'Performance Dashboard',
      description: 'Track your revenue, close rates, retention, and growth with real-time KPI analytics.',
    },
    {
      icon: 'rocket-outline',
      title: 'Built to Scale',
      description: 'A clear system, strong offers, and real earning potential — designed to grow with you.',
    },
  ];

  howItWorks = [
    { step: '1', title: 'Sign Up', description: 'Create your free account and get instant access to the platform.' },
    { step: '2', title: 'Browse Products', description: 'Explore proven digital offers in our product catalogue.' },
    { step: '3', title: 'Start Selling', description: 'Use our lead and contact tools to connect with prospects.' },
    { step: '4', title: 'Earn Recurring', description: 'Close deals, earn 20% commission, and build recurring income.' },
  ];

  testimonials = [
    { name: 'Thabo M.', role: 'Independent Sales Rep', quote: 'I closed my first deal within a week. The recurring income is a game changer — I earn even while I sleep.', avatar: 'TM', earnings: 'R18,400' },
    { name: 'Lerato K.', role: 'Digital Marketer', quote: 'No product to build, no inventory to manage. I just focus on selling and the commissions keep coming in.', avatar: 'LK', earnings: 'R24,200' },
    { name: 'James O.', role: 'Sales Consultant', quote: 'The KPI dashboard keeps me sharp. I can see exactly where my revenue is growing and where to push harder.', avatar: 'JO', earnings: 'R31,600' },
    { name: 'Naledi S.', role: 'Freelance Closer', quote: 'Process Zero gave me the system I needed. Four months in and I\'m earning more than my old 9-to-5.', avatar: 'NS', earnings: 'R42,800' },
  ];

  activityFeed = [
    { icon: 'checkmark-circle', text: 'New rep signed up from Johannesburg', time: '2 min ago' },
    { icon: 'cash-outline', text: 'Commission paid out — R4,200', time: '8 min ago' },
    { icon: 'trending-up-outline', text: 'Monthly revenue hit new record', time: '15 min ago' },
    { icon: 'people-outline', text: 'New rep signed up from Cape Town', time: '22 min ago' },
    { icon: 'checkmark-circle', text: 'Deal closed — SaaS product', time: '31 min ago' },
    { icon: 'cash-outline', text: 'Commission paid out — R2,800', time: '45 min ago' },
    { icon: 'trending-up-outline', text: 'Team growth up 18% this week', time: '1 hr ago' },
    { icon: 'people-outline', text: 'New rep signed up from Durban', time: '1 hr ago' },
  ];

  milestones = [
    { amount: 'R5,000', label: 'First milestone', timeframe: 'Week 2–4', icon: 'flag-outline', highlight: false },
    { amount: 'R15,000', label: 'Gaining momentum', timeframe: 'Month 2', icon: 'trending-up-outline', highlight: false },
    { amount: 'R35,000', label: 'Consistent closer', timeframe: 'Month 3–4', icon: 'flame-outline', highlight: false },
    { amount: 'R50,000+', label: 'Top performer', timeframe: 'Month 5–6', icon: 'trophy-outline', highlight: true },
  ];

  leaderboard = [
    { name: 'Sipho N.', location: 'Johannesburg', earnings: 'R62,400', deals: 78, avatar: 'SN' },
    { name: 'Amahle D.', location: 'Cape Town', earnings: 'R54,800', deals: 64, avatar: 'AD' },
    { name: 'Bongani K.', location: 'Pretoria', earnings: 'R48,200', deals: 57, avatar: 'BK' },
    { name: 'Zanele M.', location: 'Durban', earnings: 'R41,600', deals: 49, avatar: 'ZM' },
    { name: 'Thabo R.', location: 'Bloemfontein', earnings: 'R36,100', deals: 42, avatar: 'TR' },
  ];

  faqs = [
    { question: 'Is it free to join?', answer: 'Yes! There are no upfront fees or hidden costs. You sign up, get access to the platform, and start selling immediately.', open: false },
    { question: 'How does the 20% commission work?', answer: 'You earn 20% of every sale you close. If a customer subscribes to a R2,000/month product, you earn R400/month for as long as they stay active.', open: false },
    { question: 'What kind of products will I be selling?', answer: 'High-quality digital products and SaaS subscriptions across various industries. All products are vetted and proven to convert.', open: false },
    { question: 'How do I get paid?', answer: 'Commissions are tracked in real-time on your dashboard and paid out monthly via bank transfer. Full transparency — no surprises.', open: false },
    { question: 'Do I need sales experience?', answer: 'Experience helps, but it\'s not required. We provide product info, lead tools, and a clear system so anyone motivated can succeed.', open: false },
  ];

  activeTestimonial = 0;
  animatedCommission = 0;
  animatedReps = 0;
  animatedProducts = 0;
  animatedAvgEarnings = 0;
  animatedJoinedThisWeek = 0;
  animatedPaidOut = 0;

  // Earnings calculator
  calcSales = 10;
  calcMonthly = 4000;
  calcYearly = 48000;
  calcRecurring = 204000;

  private observer: IntersectionObserver | null = null;
  private testimonialTimer: any;
  private counterAnimated = false;

  constructor(private router: Router, private el: ElementRef, private zone: NgZone) {}

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  ngAfterViewInit(): void {
    this.setupScrollAnimations();
    this.startTestimonialRotation();
    this.updateCalc();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    clearInterval(this.testimonialTimer);
  }

  navigateTo(path: string): void {
    this.router.navigateByUrl(path);
  }

  selectTestimonial(index: number): void {
    this.activeTestimonial = index;
    clearInterval(this.testimonialTimer);
    this.startTestimonialRotation();
  }

  onCalcChange(event: Event): void {
    const val = +(event.target as HTMLInputElement).value;
    this.calcSales = val;
    this.updateCalc();
  }

  private updateCalc(): void {
    const avgProductValue = 2000;
    const commissionRate = 0.20;
    const retentionRate = 0.85;
    const commission = this.calcSales * avgProductValue * commissionRate;
    this.calcMonthly = Math.round(commission);
    this.calcYearly = Math.round(commission * 12);
    // Recurring: sum of compounding retained customers over 12 months
    let recurring = 0;
    for (let m = 1; m <= 12; m++) {
      recurring += commission * Math.pow(retentionRate, m - 1);
    }
    this.calcRecurring = Math.round(recurring);
  }

  private startTestimonialRotation(): void {
    this.testimonialTimer = setInterval(() => {
      this.zone.run(() => {
        this.activeTestimonial = (this.activeTestimonial + 1) % this.testimonials.length;
      });
    }, 5000);
  }

  private setupScrollAnimations(): void {
    const options = { threshold: 0.15, rootMargin: '0px 0px -40px 0px' };
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          if (entry.target.classList.contains('stats-bar') && !this.counterAnimated) {
            this.counterAnimated = true;
            this.zone.run(() => this.animateCounters());
          }
        }
      });
    }, options);

    setTimeout(() => {
      const sections = this.el.nativeElement.querySelectorAll('.reveal-on-scroll');
      sections.forEach((s: Element) => this.observer!.observe(s));
    }, 100);
  }

  private animateCounters(): void {
    this.animateValue('animatedCommission', 20, 1200);
    this.animateValue('animatedReps', 500, 1400);
    this.animateValue('animatedProducts', 30, 1000);
    this.animateValue('animatedAvgEarnings', 18500, 1600);
    this.animateValue('animatedJoinedThisWeek', 47, 1200);
    this.animateValue('animatedPaidOut', 284000, 1800);
  }

  private animateValue(prop: keyof HomePage, target: number, duration: number): void {
    const steps = 40;
    const increment = target / steps;
    const stepTime = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        (this as any)[prop] = target;
        clearInterval(timer);
      } else {
        (this as any)[prop] = Math.round(current);
      }
    }, stepTime);
  }
}
