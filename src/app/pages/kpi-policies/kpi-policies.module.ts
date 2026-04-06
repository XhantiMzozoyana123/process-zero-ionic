import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { KpiPoliciesPageRoutingModule } from './kpi-policies-routing.module';
import { KpiPoliciesPage } from './kpi-policies.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    KpiPoliciesPageRoutingModule,
  ],
  declarations: [KpiPoliciesPage],
})
export class KpiPoliciesPageModule {}
