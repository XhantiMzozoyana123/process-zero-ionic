import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminInboxesPage } from './admin-inboxes.page';

const routes: Routes = [
  { path: '', component: AdminInboxesPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminInboxesPageRoutingModule {}
