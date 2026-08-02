import { Component, OnInit } from '@angular/core';
import { CreditService } from 'src/app/services/credit.service';
import { CreditPackageDto } from 'src/app/models/dtos/credit-package-dto.model';

@Component({
  selector: 'app-packages',
  templateUrl: './packages.page.html',
  styleUrls: ['./packages.page.scss'],
  standalone: false
})
export class PackagesPage implements OnInit {
  packages: CreditPackageDto[] = [];
  loading = false;
  error: string | null = null;

  constructor(private creditService: CreditService) {}

  ngOnInit() {
    this.loadPackages();
  }

  loadPackages() {
    this.loading = true;
    this.error = null;
    this.creditService.getAvailablePackages().subscribe({
      next: (data) => {
        this.packages = data.sort((a, b) => a.sortOrder - b.sortOrder);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load credit packages.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  formatPrice(pkg: CreditPackageDto): string {
    const currency = pkg.currency || 'ZAR';
    let price = pkg.price;

    if (pkg.discountPercentage && pkg.discountPercentage > 0) {
      price = price * (1 - pkg.discountPercentage / 100);
    }

    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency
    }).format(price);
  }

  isSubscription(pkg: CreditPackageDto): boolean {
    return pkg.isSubscription;
  }
}