import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AdminWebinarsPageRoutingModule } from './admin-webinars-routing.module';
import { AdminWebinarsPage } from './admin-webinars.page';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, AdminWebinarsPageRoutingModule, AdminWebinarsPage],
})
export class AdminWebinarsPageModule {}