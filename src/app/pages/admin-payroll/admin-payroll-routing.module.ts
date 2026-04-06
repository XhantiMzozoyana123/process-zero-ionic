import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminPayrollPage } from './admin-payroll.page';

const routes: Routes = [
  { path: '', component: AdminPayrollPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminPayrollPageRoutingModule {}
