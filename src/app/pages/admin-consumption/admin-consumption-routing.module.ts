import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminConsumptionPage } from './admin-consumption.page';

const routes: Routes = [
  {
    path: '',
    component: AdminConsumptionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminConsumptionPageRoutingModule {}