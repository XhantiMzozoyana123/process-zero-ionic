import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ImpersonationRoutingModule } from './impersonation-routing.module';
import { ImpersonationPage } from './impersonation.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ImpersonationRoutingModule
  ],
  declarations: [ImpersonationPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ImpersonationPageModule {}