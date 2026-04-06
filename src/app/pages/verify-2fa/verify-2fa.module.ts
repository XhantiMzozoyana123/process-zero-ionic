import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Verify2faPageRoutingModule } from './verify-2fa-routing.module';
import { Verify2faPage } from './verify-2fa.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Verify2faPageRoutingModule
  ],
  declarations: [Verify2faPage]
})
export class Verify2faPageModule {}
