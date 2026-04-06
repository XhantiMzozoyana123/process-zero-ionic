import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AdminLeadlakePageRoutingModule } from './admin-leadlake-routing.module';
import { AdminLeadlakePage } from './admin-leadlake.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminLeadlakePageRoutingModule
  ],
  declarations: [AdminLeadlakePage]
})
export class AdminLeadlakePageModule {}
