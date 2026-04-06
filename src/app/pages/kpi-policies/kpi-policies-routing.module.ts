import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { KpiPoliciesPage } from './kpi-policies.page';

const routes: Routes = [
  { path: '', component: KpiPoliciesPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class KpiPoliciesPageRoutingModule {}
