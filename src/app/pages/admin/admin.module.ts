import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AdminPageRoutingModule } from './admin-routing.module';
import { AdminPage } from './admin.page';
import { AiChatbotComponent } from '../../components/ai-chatbot/ai-chatbot.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminPageRoutingModule,
    AiChatbotComponent
  ],
  declarations: [AdminPage]
})
export class AdminPageModule {}
