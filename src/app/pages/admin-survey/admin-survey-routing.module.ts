import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminSurveyPage } from './admin-survey.page';
import { AdminGuard } from 'src/app/guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminSurveyPage,
    canActivate: [AdminGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminSurveyPageRoutingModule {}