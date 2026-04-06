import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingsPage } from './settings.page';
import { AuthGuard } from 'src/app/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: SettingsPage
  },
  {
    path: 'bank-account',
    loadChildren: () => import('./../../pages/bank-account/bank-account-routing.module')
    .then( m => m.BankAccountPageRoutingModule)
      // canActivate: [AuthGuard] // <-- protects this route
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsPageRoutingModule {}
