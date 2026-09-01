import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AdminAgenciesPage } from './admin-agencies.page';
import { AdminAgenciesPageRoutingModule } from './admin-agencies-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminAgenciesPageRoutingModule
  ],
  declarations: [AdminAgenciesPage]
})
export class AdminAgenciesPageModule {}