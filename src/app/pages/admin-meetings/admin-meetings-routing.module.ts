import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminMeetingsPage } from './admin-meetings.page';

const routes: Routes = [
  { path: '', component: AdminMeetingsPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminMeetingsPageRoutingModule {}
