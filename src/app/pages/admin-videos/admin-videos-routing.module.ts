import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminVideosPage } from './admin-videos.page';

const routes: Routes = [
  {
    path: '',
    component: AdminVideosPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminVideosPageRoutingModule {}
