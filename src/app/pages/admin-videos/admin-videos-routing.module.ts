import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminWebinarsPage } from './admin-webinars.page';

const routes: Routes = [
  {
    path: '',
    component: AdminWebinarsPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminWebinarsPageRoutingModule {}
