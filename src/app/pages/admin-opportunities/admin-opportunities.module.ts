import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AdminOpportunitiesPageRoutingModule } from './admin-opportunities-routing.module';

import { AdminOpportunitiesPage } from './admin-opportunities.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AdminOpportunitiesPageRoutingModule
  ],
  declarations: [AdminOpportunitiesPage]
})
export class AdminOpportunitiesPageModule {}