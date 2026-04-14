import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { FeaturesRoutingModule } from './features-routing.module';
import { FeatureLeadLakePage } from './lead-lake/lead-lake.page';
import { FeatureContactsPage } from './contacts/contacts.page';
import { FeatureMeetingsPage } from './meetings/meetings.page';
import { FeatureProductsPage } from './products/products.page';
import { FeatureKpiPage } from './kpi/kpi.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FeaturesRoutingModule
  ],
  declarations: [
    FeatureLeadLakePage,
    FeatureContactsPage,
    FeatureMeetingsPage,
    FeatureProductsPage,
    FeatureKpiPage
  ]
})
export class FeaturesModule {}
