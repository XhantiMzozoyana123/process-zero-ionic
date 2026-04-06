import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminClientsPage } from './admin-clients.page';

const routes: Routes = [
  { path: '', component: AdminClientsPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminClientsPageRoutingModule {}
