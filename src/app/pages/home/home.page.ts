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
    { name: 'Thabo M.', role: 'Independent Sales Rep', quote: 'I closed my first deal within a week. The recurring income is a game changer — I earn even while I sleep.', avatar: 'TM' },
    { name: 'Lerato K.', role: 'Digital Marketer', quote: 'No product to build, no inventory to manage. I just focus on selling and the commissions keep coming in.', avatar: 'LK' },
    { name: 'James O.', role: 'Sales Consultant', quote: 'The KPI dashboard keeps me sharp. I can see exactly where my revenue is growing and where to push harder.', avatar: 'JO' },
    { name: 'Naledi S.', role: 'Freelance Closer', quote: 'Process Zero gave me the system I needed. Four months in and I\'m earning more than my old 9-to-5.', avatar: 'NS' },
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

  activeTestimonial = 0;
  animatedCommission = 0;
  animatedReps = 0;
  animatedProducts = 0;

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
  }

  private animateValue(prop: 'animatedCommission' | 'animatedReps' | 'animatedProducts', target: number, duration: number): void {
    const steps = 40;
    const increment = target / steps;
    const stepTime = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        this[prop] = target;
        clearInterval(timer);
      } else {
        this[prop] = Math.round(current);
      }
    }, stepTime);
  }
}
