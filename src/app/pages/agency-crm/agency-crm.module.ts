import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AgencyCrmPage } from './agency-crm.page';
import { AgencyCrmPageRoutingModule } from './agency-crm-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgencyCrmPageRoutingModule
  ],
  declarations: [AgencyCrmPage]
})
export class AgencyCrmPageModule {}