import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminBlasterPage } from './admin-blaster.page';

const routes: Routes = [
  { path: '', component: AdminBlasterPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminBlasterPageRoutingModule {}
