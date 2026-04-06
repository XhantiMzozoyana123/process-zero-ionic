import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminAssessmentsPage } from './admin-assessments.page';

const routes: Routes = [
  { path: '', component: AdminAssessmentsPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminAssessmentsPageRoutingModule {}
