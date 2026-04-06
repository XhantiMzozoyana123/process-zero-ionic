import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { AdminPayrollPageRoutingModule } from './admin-payroll-routing.module';
import { AdminPayrollPage } from './admin-payroll.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    AdminPayrollPageRoutingModule
  ],
  declarations: [AdminPayrollPage]
})
export class AdminPayrollPageModule {}
