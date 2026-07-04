import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AdminSurveyPageRoutingModule } from './admin-survey-routing.module';
import { AdminSurveyPage } from './admin-survey.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AdminSurveyPageRoutingModule
  ],
  declarations: [AdminSurveyPage]
})
export class AdminSurveyPageModule {}