import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminInvoicesPage } from './admin-invoices.page';

const routes: Routes = [
  { path: '', component: AdminInvoicesPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminInvoicesPageRoutingModule {}
