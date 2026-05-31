import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { RelayUserPageRoutingModule } from './relay-user-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RelayUserPageRoutingModule,
  ],
})
export class RelayUserPageModule {}
