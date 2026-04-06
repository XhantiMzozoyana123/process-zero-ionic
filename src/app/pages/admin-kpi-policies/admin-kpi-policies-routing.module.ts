import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminKpiPoliciesPage } from './admin-kpi-policies.page';

const routes: Routes = [
  { path: '', component: AdminKpiPoliciesPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminKpiPoliciesPageRoutingModule {}
