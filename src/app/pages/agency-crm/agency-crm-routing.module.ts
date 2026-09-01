import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AgencyCrmPage } from './agency-crm.page';
import { AgencyCrmGuard } from 'src/app/guards/agency-crm.guard';

const routes: Routes = [
  {
    path: '',
    component: AgencyCrmPage,
    canActivate: [AgencyCrmGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgencyCrmPageRoutingModule {}