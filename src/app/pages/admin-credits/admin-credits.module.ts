import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AsyncPipe } from '@angular/common';

import { AdminCreditsPageRoutingModule } from './admin-credits-routing.module';
import { AdminCreditsPage } from './admin-credits.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AdminCreditsPageRoutingModule,
    AsyncPipe
  ],
  declarations: [AdminCreditsPage]
})
export class AdminCreditsPageModule {}