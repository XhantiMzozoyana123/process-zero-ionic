import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AdminInvoicesPageRoutingModule } from './admin-invoices-routing.module';
import { AdminInvoicesPage } from './admin-invoices.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AdminInvoicesPageRoutingModule
  ],
  declarations: [AdminInvoicesPage]
})
export class AdminInvoicesPageModule {}
