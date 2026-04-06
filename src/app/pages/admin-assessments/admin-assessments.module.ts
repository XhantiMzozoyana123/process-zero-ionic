import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AdminAssessmentsPageRoutingModule } from './admin-assessments-routing.module';
import { AdminAssessmentsPage } from './admin-assessments.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AdminAssessmentsPageRoutingModule
  ],
  declarations: [AdminAssessmentsPage]
})
export class AdminAssessmentsPageModule {}
