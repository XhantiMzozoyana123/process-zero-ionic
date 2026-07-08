import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonIcon, IonTextarea, IonItem, IonFab, IonFabButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
import { AiService } from 'src/app/services/ai.service';
import { AdminUserService } from 'src/app/services/admin-user-service';
import { AdminInvoiceService } from 'src/app/services/admin-invoice-service';
import { AdminPayrollService } from 'src/app/services/admin-payroll-service';
import { LeadlakeService } from 'src/app/services/leadlake-service';
import { MeetingService } from 'src/app/services/meeting-service';
import { ProductService } from 'src/app/services/product-service';
import { AdminClientService } from 'src/app/services/admin-client-service';
import { AdminKpiPolicyService } from 'src/app/services/admin-kpi-policy-service';
import { AssessmentService } from 'src/app/services/assessment-service';
import { AdminInboxService } from 'src/app/services/admin-inbox-service';
import { SurveyService } from 'src/app/services/survey.service';
import { RelayService } from 'src/app/services/relay-service';
import { MilestoneService } from 'src/app/services/milestone-service';
import { ContactService } from 'src/app/services/contact-service';
import { forkJoin } from 'rxjs';
import { catchError, of } from 'rxjs';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

@Component({
  selector: 'app-ai-chatbot',
  templateUrl: './ai-chatbot.component.html',
  styleUrls: ['./ai-chatbot.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonButton, IonIcon, IonTextarea, IonItem, IonFab, IonFabButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent]
})
export class AiChatbotComponent implements OnInit {
  isOpen = false;
  isMinimized = false;
  isMaximized = false;
  userMessage = '';
  messages: Message[] = [];
  isLoading = false;
  private dataContext: any = {};

  constructor(
    private aiService: AiService,
    private adminUserService: AdminUserService,
    private adminInvoiceService: AdminInvoiceService,
    private adminPayrollService: AdminPayrollService,
    private leadlakeService: LeadlakeService,
    private meetingService: MeetingService,
    private productService: ProductService,
    private adminClientService: AdminClientService,
    private adminKpiPolicyService: AdminKpiPolicyService,
    private assessmentService: AssessmentService,
    private adminInboxService: AdminInboxService,
    private surveyService: SurveyService,
    private relayService: RelayService,
    private milestoneService: MilestoneService,
    private contactService: ContactService
  ) {}

  ngOnInit(): void {
    this.loadContextData();
  }

  private loadContextData(): void {
    this.addBotMessage('Loading complete business datalake...');

    const requests = {
      users: this.adminUserService.getAll().pipe(catchError(() => of([]))),
      invoices: this.adminInvoiceService.getAll().pipe(catchError(() => of([]))),
      payroll: this.adminPayrollService.generateMonthlyReport().pipe(catchError(() => of(null))),
      leads: this.leadlakeService.getAll().pipe(catchError(() => of([]))),
      meetings: this.meetingService.getAllMeetings().pipe(catchError(() => of({ items: [], totalCount: 0 }))),
      products: this.productService.getAll().pipe(catchError(() => of([]))),
      clients: this.adminClientService.getAll().pipe(catchError(() => of({ items: [], totalCount: 0 }))),
      kpiPolicies: this.adminKpiPolicyService.getAll().pipe(catchError(() => of([]))),
      assessmentResults: this.assessmentService.getAllUsersResults().pipe(catchError(() => of([]))),
      allAssessments: this.assessmentService.getAllAssessmentsForAdmin().pipe(catchError(() => of([]))),
      inboxes: this.adminInboxService.getAll().pipe(catchError(() => of([]))),
      surveys: this.surveyService.listSurveysForAdmin().pipe(catchError(() => of([]))),
      relayCampaigns: this.relayService.getCampaigns().pipe(catchError(() => of([]))),
      milestones: this.milestoneService.getMilestones().pipe(catchError(() => of([]))),
      contacts: this.contactService.getAll().pipe(catchError(() => of([])))
    };

    forkJoin(requests).subscribe({
      next: (data) => {
        this.dataContext = data;
        this.removeLastMessage();
        this.addBotMessage(this.buildDatalakeSummary(data));
      },
      error: () => {
        this.removeLastMessage();
        this.addBotMessage('I\'m ready to help! I couldn\'t load the full datalake, but I can still assist with general questions.');
      }
    });
  }

  private buildDatalakeSummary(data: any): string {
    const tableCount = Object.keys(data).length;
    const totalRecords = Object.values(data).reduce((sum: number, arr: any) => {
      if (Array.isArray(arr)) return sum + arr.length;
      return sum;
    }, 0);

    let summary = `Hello Admin! I have access to your complete business datalake.\n\n`;
    summary += `📊 **Datalake Overview:**\n- Total Tables: ${tableCount}\n- Total Records: ${totalRecords}\n\nAvailable Data:\n`;
    Object.entries(data).forEach(([tableName, records]) => {
      const count = Array.isArray(records) ? records.length : 0;
      summary += `- ${tableName}: ${count} records\n`;
    });
    summary += `\nAsk me anything about your business data!`;
    return summary;
  }

  private removeLastMessage(): void {
    if (this.messages.length > 0) this.messages.pop();
  }

  private addBotMessage(text: string): void {
    this.messages.push({ sender: 'bot', text });
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.messages.length === 0) this.ngOnInit();
  }

  closeChat(): void {
    this.isOpen = false;
    this.isMinimized = false;
    this.isMaximized = false;
  }

  minimizeChat(): void {
    this.isMinimized = true;
    this.isMaximized = false;
  }

  maximizeChat(): void {
    this.isMaximized = true;
    this.isMinimized = false;
  }

  restoreChat(): void {
    this.isMaximized = false;
    this.isMinimized = false;
  }

  sendMessage(): void {
    if (this.userMessage.trim() === '' || this.isLoading) return;
    this.isLoading = true;
    this.messages.push({ sender: 'user', text: this.userMessage.trim() });
    this.userMessage = '';

    this.aiService.generate(this.buildPrompt()).subscribe({
      next: (response) => {
        this.messages.push({ sender: 'bot', text: response });
        this.isLoading = false;
      },
      error: () => {
        this.messages.push({ sender: 'bot', text: 'I apologize, but I encountered an error processing your request.' });
        this.isLoading = false;
      }
    });
  }

  private buildPrompt(): string {
    return `You are an AI assistant for Process Zero admin panel. You have access to a complete business datalake containing all database tables and records.

Complete Business Datalake (JSON):
${JSON.stringify(this.dataContext, null, 2)}

User Question: ${this.userMessage}

Instructions:
- Analyze the complete datalake to answer the user's question accurately
- Be specific with numbers, facts, and figures from the data
- Provide actionable insights and recommendations
- Identify trends, patterns, or anomalies
- If information is missing, clearly state what's needed
- Keep responses concise but comprehensive
- Format in a clear, professional manner

Assistant Response:`;
  }
}