import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminCreditsPage } from './admin-credits.page';

const routes: Routes = [
  {
    path: '',
    component: AdminCreditsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminCreditsPageRoutingModule {}