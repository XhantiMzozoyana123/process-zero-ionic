import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { BlasterPageRoutingModule } from './blaster-routing.module';
import { BlasterPage } from './blaster.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    BlasterPageRoutingModule
  ],
  declarations: [BlasterPage]
})
export class BlasterPageModule {}
