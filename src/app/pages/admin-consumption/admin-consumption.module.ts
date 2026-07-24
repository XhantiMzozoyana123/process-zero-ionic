import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AdminConsumptionPageRoutingModule } from './admin-consumption-routing.module';
import { AdminConsumptionPage } from './admin-consumption.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AdminConsumptionPageRoutingModule,
    AdminConsumptionPage
  ],
})
export class AdminConsumptionPageModule {}