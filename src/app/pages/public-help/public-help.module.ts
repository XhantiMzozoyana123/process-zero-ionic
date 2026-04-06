import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { PublicHelpPageRoutingModule } from './public-help-routing.module';
import { PublicHelpPage } from './public-help.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    PublicHelpPageRoutingModule
  ],
  declarations: [PublicHelpPage]
})
export class PublicHelpPageModule {}
