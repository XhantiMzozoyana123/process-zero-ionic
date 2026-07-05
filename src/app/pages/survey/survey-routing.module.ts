import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SurveyPage } from './survey.page';

const routes: Routes = [
  {
    path: ':id',
    component: SurveyPage
  },
  {
    path: '',
    component: SurveyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SurveyPageRoutingModule {}