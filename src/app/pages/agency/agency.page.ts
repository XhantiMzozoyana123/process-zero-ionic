import { Component, AfterViewInit, OnDestroy, ElementRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-agency',
  templateUrl: 'agency.page.html',
  styleUrls: ['agency.page.scss'],
  standalone: false,
})
export class AgencyPage implements AfterViewInit, OnDestroy {

  featureLinks = [
    { icon: 'globe-outline', title: 'Lead Lake', desc: 'Prospect intelligence hub', route: '/features/lead-lake' },
    { icon: 'people-outline', title: 'My Contacts', desc: 'Manage your pipeline', route: '/features/contacts' },
    { icon: 'calendar-outline', title: 'Meetings', desc: 'Schedule & track calls', route: '/features/meetings' },
    { icon: 'cube-outline', title: 'Products', desc: 'Digital product catalogue', route: '/features/products' },
    { icon: 'stats-chart-outline', title: 'KPI Form & Policies', desc: 'Performance tracking', route: '/features/kpi' },
  ];

  benefits = [
    {
      icon: 'calendar-outline',
      title: 'Pre-Booked Appointments',
      description: 'We deliver qualified, booked appointments directly to your calendar — no cold outreach required on your end.'
    },
    {
      icon: 'people-outline',
      title: 'Qualified Leads Only',
      description: 'Every appointment is vetted through our sales network so your team only speaks to decision-makers ready to buy.'
    },
    {
      icon: 'trending-up-outline',
      title: 'Scale Without Hiring',
      description: 'Expand your pipeline without recruiting, training, or managing additional sales reps. We handle the top of funnel.'
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Zero Risk Partnership',
      description: 'Performance-based pricing means you only pay for results. No retainers, no upfront fees, no wasted ad spend.'
    },
    {
      icon: 'flash-outline',
      title: 'Fast Onboarding',
      description: 'Get up and running in days, not months. We plug into your existing sales workflow and start delivering immediately.'
    },
    {
      icon: 'analytics-outline',
      title: 'Transparent Reporting',
      description: 'Real-time dashboards and weekly reports so you always know exactly where your pipeline stands.'
    }
  ];

  howItWorks = [
    { step: '1', title: 'Partner With Us', description: 'Tell us about your ideal client profile and we tailor our outreach accordingly.' },
    { step: '2', title: 'We Prospect & Qualify', description: 'Our network of trained reps identifies and qualifies leads that match your criteria.' },
    { step: '3', title: 'Appointments Booked', description: 'Qualified prospects are booked directly onto your team\'s calendar.' },
    { step: '4', title: 'You Close & Grow', description: 'Focus on what you do best — closing deals and scaling your agency.' }
  ];

  faqs = [
    {
      question: 'What types of agencies do you work with?',
      answer: 'We partner with digital marketing agencies, software consultancies, staffing firms, and any B2B service provider looking to grow their client base.',
      open: false
    },
    {
      question: 'How are appointments qualified?',
      answer: 'Each lead goes through a multi-step qualification process. We verify decision-maker status, budget authority, timeline, and fit with your ideal client profile before booking.',
      open: false
    },
    {
      question: 'What does the pricing model look like?',
      answer: 'We operate on a performance-based model — you only pay per booked appointment that meets your qualification criteria. No retainers or setup fees.',
      open: false
    },
    {
      question: 'How quickly can we start receiving appointments?',
      answer: 'Most partners start receiving their first appointments within 5–7 business days of onboarding. We move fast once your ideal client profile is locked in.',
      open: false
    },
    {
      question: 'Can we set our own qualification criteria?',
      answer: 'Absolutely. During onboarding, we work with you to define exact criteria — industry, company size, revenue range, geography, and any other filters you need.',
      open: false
    }
  ];

  testimonials = [
    { name: 'Sarah V.', role: 'CEO, Digital Agency', quote: 'We went from 3 meetings a month to 18 — in the first 30 days. Process Zero changed the game for us.', avatar: 'SV' },
    { name: 'Michael T.', role: 'Founder, SaaS Consultancy', quote: 'No more cold calls. No more wasted ad budget. Just qualified meetings on my calendar every week.', avatar: 'MT' },
    { name: 'Priya K.', role: 'Growth Lead, Staffing Firm', quote: 'The ROI is insane. We closed R420k in new contracts from Process Zero appointments in Q1 alone.', avatar: 'PK' },
    { name: 'David L.', role: 'MD, Marketing Studio', quote: 'I was skeptical, but the first week they booked 4 appointments with decision-makers. All four converted.', avatar: 'DL' },
  ];

  liveFeed = [
    { icon: 'checkmark-circle', text: 'New agency partner onboarded — Cape Town', time: '3 min ago' },
    { icon: 'calendar-outline', text: '12 appointments booked this morning', time: '11 min ago' },
    { icon: 'trending-up-outline', text: 'Partner pipeline up 340% this quarter', time: '24 min ago' },
    { icon: 'cash-outline', text: 'R180k closed from booked meetings', time: '38 min ago' },
    { icon: 'people-outline', text: 'New agency partner onboarded — Johannesburg', time: '45 min ago' },
    { icon: 'checkmark-circle', text: '8 qualified meetings confirmed today', time: '1 hr ago' },
    { icon: 'trending-up-outline', text: 'Agency close rate holding at 67%', time: '1 hr ago' },
    { icon: 'calendar-outline', text: '5 appointments booked for next week', time: '2 hr ago' },
  ];

  comparisonRows = [
    { feature: 'Upfront cost', us: 'R0', them: 'R15k–R50k/mo' },
    { feature: 'Time to first appointment', us: '5–7 days', them: '30–90 days' },
    { feature: 'Lead qualification', us: 'Multi-step vetting', them: 'Basic filters' },
    { feature: 'Pay model', us: 'Per qualified meeting', them: 'Monthly retainer' },
    { feature: 'Risk', us: 'Zero — pay for results', them: 'High — pay upfront' },
    { feature: 'Pipeline visibility', us: 'Real-time dashboard', them: 'Weekly PDF reports' },
  ];

  // animated counters
  animatedReps = 0;
  animatedDays = 0;
  animatedRate = 0;
  animatedMeetings = 0;
  activeTestimonial = 0;

  private observer: IntersectionObserver | null = null;
  private testimonialTimer: any;
  private counterAnimated = false;

  constructor(private router: Router, private el: ElementRef, private zone: NgZone) {}

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

  toggleFaq(index: number): void {
    this.faqs[index].open = !this.faqs[index].open;
  }

  selectTestimonial(index: number): void {
    this.activeTestimonial = index;
    clearInterval(this.testimonialTimer);
    this.startTestimonialRotation();
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  private startTestimonialRotation(): void {
    this.testimonialTimer = setInterval(() => {
      this.zone.run(() => {
        this.activeTestimonial = (this.activeTestimonial + 1) % this.testimonials.length;
      });
    }, 4500);
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
    this.animateValue('animatedReps', 500, 1400);
    this.animateValue('animatedDays', 5, 800);
    this.animateValue('animatedRate', 67, 1200);
    this.animateValue('animatedMeetings', 2400, 1600);
  }

  private animateValue(prop: 'animatedReps' | 'animatedDays' | 'animatedRate' | 'animatedMeetings', target: number, duration: number): void {
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
