import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MeetingsPageRoutingModule } from './meetings-routing.module';
import { MeetingsPage } from './meetings.page';
import { CalDatetimePickerModule } from 'src/app/components/cal-datetime-picker/cal-datetime-picker.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MeetingsPageRoutingModule,
    CalDatetimePickerModule
  ],
  declarations: [MeetingsPage]
})
export class MeetingsPageModule {}
