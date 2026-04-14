import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
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

  constructor(private router: Router) {}

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  navigateTo(path: string): void {
    this.router.navigateByUrl(path);
  }
}
