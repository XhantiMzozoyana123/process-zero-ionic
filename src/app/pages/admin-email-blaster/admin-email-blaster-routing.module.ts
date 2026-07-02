import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminEmailBlasterPage } from './admin-email-blaster.page';

const routes: Routes = [
  { path: '', component: AdminEmailBlasterPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminEmailBlasterPageRoutingModule {}
