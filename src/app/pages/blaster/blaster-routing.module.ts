import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BlasterPage } from './blaster.page';

const routes: Routes = [
  { path: '', component: BlasterPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BlasterPageRoutingModule {}
