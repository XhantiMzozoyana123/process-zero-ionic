import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AdminClientsPageRoutingModule } from './admin-clients-routing.module';
import { AdminClientsPage } from './admin-clients.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AdminClientsPageRoutingModule
  ],
  declarations: [AdminClientsPage]
})
export class AdminClientsPageModule {}
