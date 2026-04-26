import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ReplayAiPage } from './replay-ai.page';
import { ReplayAiPageRoutingModule } from './replay-ai-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReplayAiPageRoutingModule
  ],
  declarations: [ReplayAiPage]
})
export class ReplayAiPageModule {}
