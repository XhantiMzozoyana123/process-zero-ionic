import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AdminKpiPoliciesPageRoutingModule } from './admin-kpi-policies-routing.module';
import { AdminKpiPoliciesPage } from './admin-kpi-policies.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AdminKpiPoliciesPageRoutingModule
  ],
  declarations: [AdminKpiPoliciesPage]
})
export class AdminKpiPoliciesPageModule {}
