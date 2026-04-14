import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-feature-products',
  templateUrl: './products.page.html',
  styleUrls: ['../features.scss'],
  standalone: false
})
export class FeatureProductsPage {
  featureLinks = [
    { icon: 'globe-outline', title: 'Lead Lake', desc: 'Prospect intelligence hub', route: '/features/lead-lake' },
    { icon: 'people-outline', title: 'My Contacts', desc: 'Manage your pipeline', route: '/features/contacts' },
    { icon: 'calendar-outline', title: 'Meetings', desc: 'Schedule & track calls', route: '/features/meetings' },
    { icon: 'cube-outline', title: 'Products', desc: 'Digital product catalogue', route: '/features/products' },
    { icon: 'stats-chart-outline', title: 'KPI Form & Policies', desc: 'Performance tracking', route: '/features/kpi' },
  ];

  constructor(private router: Router) {}

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  navigateTo(path: string): void {
    this.router.navigateByUrl(path);
  }
}
