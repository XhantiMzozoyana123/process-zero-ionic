import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AdminEmailBlasterPageRoutingModule } from './admin-email-blaster-routing.module';
import { AdminEmailBlasterPage } from './admin-email-blaster.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AdminEmailBlasterPageRoutingModule
  ],
  declarations: [AdminEmailBlasterPage]
})
export class AdminEmailBlasterPageModule {}
