import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AdminBlasterPageRoutingModule } from './admin-blaster-routing.module';
import { AdminBlasterPage } from './admin-blaster.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AdminBlasterPageRoutingModule
  ],
  declarations: [AdminBlasterPage]
})
export class AdminBlasterPageModule {}
