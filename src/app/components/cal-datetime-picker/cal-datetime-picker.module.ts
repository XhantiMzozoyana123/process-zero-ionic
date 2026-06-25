import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CalDatetimePickerComponent } from './cal-datetime-picker.component';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
  declarations: [CalDatetimePickerComponent],
  exports: [CalDatetimePickerComponent]
})
export class CalDatetimePickerModule {}