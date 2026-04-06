import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AdminMeetingsPageRoutingModule } from './admin-meetings-routing.module';
import { AdminMeetingsPage } from './admin-meetings.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AdminMeetingsPageRoutingModule
  ],
  declarations: [AdminMeetingsPage]
})
export class AdminMeetingsPageModule {}
