import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AdminVideosPageRoutingModule } from './admin-videos-routing.module';
import { AdminVideosPage } from './admin-videos.page';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, AdminVideosPageRoutingModule, AdminVideosPage],
})
export class AdminVideosPageModule {}