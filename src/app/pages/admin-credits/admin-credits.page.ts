import { Component, OnInit } from '@angular/core';
import { CreditService } from 'src/app/services/credit.service';
import { CreditPackageDto } from 'src/app/models/dtos/credit-package-dto.model';
import { Observable } from 'rxjs';
import { CreateCreditPackageDto } from 'src/app/models/dtos/create-credit-package-dto.model';

@Component({
  selector: 'app-admin-credits',
  templateUrl: './admin-credits.page.html',
  styleUrls: ['./admin-credits.page.scss'],
  standalone: false
})
export class AdminCreditsPage implements OnInit {
  packages$: Observable<CreditPackageDto[]> = new Observable();
  createPackageForm: CreateCreditPackageDto = { name: '', description: '', creditAmount: 0, price: 0 };

  constructor(private creditService: CreditService) {}

  ngOnInit() {
    this.loadPackages();
  }

  loadPackages() {
    this.packages$ = this.creditService.getAllPackages();
  }

  create() {
    if (!this.createPackageForm.name || !this.createPackageForm.creditAmount || !this.createPackageForm.price) {
      return;
    }
    this.creditService.createPackage(this.createPackageForm).subscribe({
      next: () => {
        this.createPackageForm = { name: '', description: '', creditAmount: 0, price: 0 };
        this.loadPackages();
      },
      error: (err) => console.error('Create package failed', err)
    });
  }
}