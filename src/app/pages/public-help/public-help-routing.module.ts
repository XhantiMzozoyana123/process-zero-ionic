import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PublicHelpPage } from './public-help.page';

const routes: Routes = [
  { path: '', component: PublicHelpPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicHelpPageRoutingModule {}
