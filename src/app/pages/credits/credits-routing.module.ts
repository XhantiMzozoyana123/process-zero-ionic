import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WalletPage } from './wallet/wallet.page';
import { PackagesPage } from './packages/packages.page';
import { TransactionsPage } from './transactions/transactions.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'wallet',
    pathMatch: 'full'
  },
  {
    path: 'wallet',
    component: WalletPage
  },
  {
    path: 'packages',
    component: PackagesPage
  },
  {
    path: 'transactions',
    component: TransactionsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreditsPageRoutingModule {}