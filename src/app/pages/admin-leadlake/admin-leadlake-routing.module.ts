import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminLeadlakePage } from './admin-leadlake.page';

const routes: Routes = [
  { path: '', component: AdminLeadlakePage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminLeadlakePageRoutingModule {}
