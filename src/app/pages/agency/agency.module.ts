import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AgencyPage } from './agency.page';
import { AgencyPageRoutingModule } from './agency-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgencyPageRoutingModule
  ],
  declarations: [AgencyPage]
})
export class AgencyPageModule {}
