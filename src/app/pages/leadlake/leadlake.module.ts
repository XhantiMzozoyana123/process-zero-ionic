import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LeadlakePageRoutingModule } from './leadlake-routing.module';

import { LeadlakePage } from './leadlake.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LeadlakePageRoutingModule
  ],
  declarations: [LeadlakePage]
})
export class LeadlakePageModule {}
