import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminOpportunitiesPage } from './admin-opportunities.page';
import { AdminGuard } from 'src/app/guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminOpportunitiesPage,
    canActivate: [AdminGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminOpportunitiesPageRoutingModule {}