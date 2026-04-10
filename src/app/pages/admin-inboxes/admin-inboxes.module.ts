import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AdminInboxesPageRoutingModule } from './admin-inboxes-routing.module';
import { AdminInboxesPage } from './admin-inboxes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AdminInboxesPageRoutingModule
  ],
  declarations: [AdminInboxesPage]
})
export class AdminInboxesPageModule {}
