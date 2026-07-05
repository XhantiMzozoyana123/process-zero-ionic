import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SchedulerPage } from './scheduler.page';
import { SchedulerPageRoutingModule } from './scheduler-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SchedulerPageRoutingModule
  ],
  declarations: [SchedulerPage]
})
export class SchedulerPageModule {}