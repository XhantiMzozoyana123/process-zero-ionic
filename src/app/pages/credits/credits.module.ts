import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CreditsPageRoutingModule } from './credits-routing.module';
import { WalletPage } from './wallet/wallet.page';
import { PackagesPage } from './packages/packages.page';
import { TransactionsPage } from './transactions/transactions.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreditsPageRoutingModule
  ],
  declarations: [
    WalletPage,
    PackagesPage,
    TransactionsPage
  ]
})
export class CreditsPageModule { }


