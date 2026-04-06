import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { BankAccountPageRoutingModule } from './bank-account-routing.module';
import { BankAccountPage } from './bank-account.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, // <-- ADD THIS
    IonicModule,
    BankAccountPageRoutingModule
  ],
  declarations: [BankAccountPage]
})
export class BankAccountPageModule {}