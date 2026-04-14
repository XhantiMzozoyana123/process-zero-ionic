import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeatureLeadLakePage } from './lead-lake/lead-lake.page';
import { FeatureContactsPage } from './contacts/contacts.page';
import { FeatureMeetingsPage } from './meetings/meetings.page';
import { FeatureProductsPage } from './products/products.page';
import { FeatureKpiPage } from './kpi/kpi.page';

const routes: Routes = [
  { path: 'lead-lake', component: FeatureLeadLakePage },
  { path: 'contacts', component: FeatureContactsPage },
  { path: 'meetings', component: FeatureMeetingsPage },
  { path: 'products', component: FeatureProductsPage },
  { path: 'kpi', component: FeatureKpiPage },
  { path: '', redirectTo: 'lead-lake', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeaturesRoutingModule {}
