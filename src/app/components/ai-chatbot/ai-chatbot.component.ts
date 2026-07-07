import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonButton, IonIcon, IonTextarea, IonItem, IonLabel, IonFab, IonFabButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
import { AiService } from 'src/app/services/ai.service';
import { DataLakeService, DataLakeExtract } from 'src/app/services/datalake.service';
import { chatbubbleEllipsesOutline, closeCircleOutline, sendOutline } from 'ionicons/icons';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

@Component({
  selector: 'app-ai-chatbot',
  templateUrl: './ai-chatbot.component.html',
  styleUrls: ['./ai-chatbot.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonButton, IonIcon, IonTextarea, IonItem, IonLabel, IonFab, IonFabButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent]
})
export class AiChatbotComponent implements OnInit {
  isOpen = false;
  userMessage = '';
  messages: Message[] = [];
  isLoading = false;

  // Complete data lake cache - contains ALL database tables
  private dataContext: DataLakeExtract = {};

  constructor(
    private aiService: AiService,
    private dataLakeService: DataLakeService
  ) {}

  ngOnInit(): void {
    this.loadContextData();
  }

  private loadContextData(): void {
    this.addBotMessage('Loading complete business datalake...');

    // Single API call to extract ALL data from ALL database tables
    this.dataLakeService.extractAll().subscribe({
      next: (data) => {
        this.dataContext = data;
        this.removeLastMessage();
        
        // Build summary from datalake
        const summary = this.buildDatalakeSummary(data);
        this.addBotMessage(summary);
      },
      error: (err) => {
        console.error('Failed to load datalake:', err);
        this.removeLastMessage();
        this.addBotMessage('I\'m ready to help! I couldn\'t load the full datalake, but I can still assist with general questions.');
      }
    });
  }

  private buildDatalakeSummary(data: DataLakeExtract): string {
    const tableCount = Object.keys(data).length;
    const totalRecords = Object.values(data).reduce((sum, arr) => sum + (arr?.length || 0), 0);

    let summary = `Hello Admin! I have access to your complete business datalake.\n\n`;
    summary += `📊 **Datalake Overview:**\n`;
    summary += `- Total Tables: ${tableCount}\n`;
    summary += `- Total Records: ${totalRecords}\n\n`;
    summary += `Available Data:\n`;

    Object.entries(data).forEach(([tableName, records]) => {
      const count = records?.length || 0;
      summary += `- ${tableName}: ${count} records\n`;
    });

    summary += `\nAsk me anything about your business data!`;
    return summary;
  }

  private removeLastMessage(): void {
    if (this.messages.length > 0) {
      this.messages.pop();
    }
  }

  private addBotMessage(text: string): void {
    this.messages.push({ sender: 'bot', text });
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.messages.length === 0) {
      this.ngOnInit();
    }
  }

  closeChat(): void {
    this.isOpen = false;
  }

  sendMessage(): void {
    if (this.userMessage.trim() === '' || this.isLoading) return;

    this.isLoading = true;
    const userMsg = this.userMessage.trim();
    
    this.messages.push({ sender: 'user', text: userMsg });
    this.userMessage = '';

    // Send complete datalake to AI for analysis
    const prompt = this.buildPrompt(userMsg);
    
    this.aiService.generate(prompt).subscribe({
      next: (response) => {
        this.messages.push({ sender: 'bot', text: response });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('AI generation error:', err);
        this.messages.push({ 
          sender: 'bot', 
          text: 'I apologize, but I encountered an error processing your request. Please try again.' 
        });
        this.isLoading = false;
      }
    });
  }

  private buildPrompt(userMessage: string): string {
    const contextData = JSON.stringify(this.dataContext, null, 2);
    
    return `You are an AI assistant for Process Zero admin panel. You have access to a complete business datalake containing all database tables and records.

Complete Business Datalake (JSON):
${contextData}

User Question: ${userMessage}

Instructions:
- Analyze the complete datalake to answer the user's question accurately
- Query across multiple tables if needed to provide comprehensive answers
- Be specific with numbers, facts, and figures from the data
- Provide actionable insights and recommendations
- Identify trends, patterns, or anomalies
- If information is missing, clearly state what's needed
- For analytical questions, calculate statistics from the raw data
- Keep responses concise but comprehensive
- Format in a clear, professional manner

Assistant Response:`;
  }
}