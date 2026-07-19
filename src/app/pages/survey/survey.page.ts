import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { SurveyService } from 'src/app/services/survey.service';
import { AiService } from 'src/app/services/ai.service';
import { Survey, SurveyQuestion, SurveyResponseResult } from 'src/app/models/dtos/survey.model';
import { AuditReport, AuditChartData } from 'src/app/models/dtos/audit-report.model';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.page.html',
  styleUrls: ['./survey.page.scss'],
  standalone: false
})
export class SurveyPage implements OnInit {
  survey: Survey | null = null;
  surveyForm: FormGroup;
  loading = true;
  submitting = false;
  submitted = false;
  submissionResult: SurveyResponseResult | null = null;
  errorMessage = '';
  showContactModal = false;
  showAuditPreview = false;
  auditReport = '';
  auditReportData: AuditReport | null = null;
  contactForm: FormGroup;
  questionToFormIndex: Map<number, number> = new Map();

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private surveyService: SurveyService,
    private aiService: AiService,
    private toastController: ToastController
  ) {
    this.surveyForm = this.fb.group({
      answers: this.fb.array([])
    });
    this.contactForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: ['', Validators.required],
      company: [''],
      job: [''],
      industry: ['']
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.loadSurvey(+idParam);
      } else {
        this.errorMessage = 'Survey ID is required.';
        this.loading = false;
      }
    });
  }

  get answersFormArray(): FormArray {
    return this.surveyForm.get('answers') as FormArray;
  }

  loadSurvey(id: number): void {
    this.loading = true;
    this.errorMessage = '';
    this.surveyService.getSurvey(id).subscribe({
      next: (survey) => {
        this.survey = { ...survey };
        this.buildAnswersForm(this.survey.questions);
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Survey not found or is not available.';
        this.loading = false;
      }
    });
  }

  private buildAnswersForm(questions: SurveyQuestion[]): void {
    while (this.answersFormArray.length > 0) {
      this.answersFormArray.removeAt(0);
    }
    this.questionToFormIndex.clear();
    let formIndex = 0;
    questions.forEach((question, i) => {
      if (!this.isContactField(question.text, question.category)) {
        this.questionToFormIndex.set(i, formIndex);
        const validators = question.required ? [Validators.required] : [];
        if (question.text.toLowerCase().includes('email')) {
          validators.push(Validators.email);
        }
        this.answersFormArray.push(this.fb.control('', validators));
        formIndex++;
      }
    });
  }

  getFormControlIndex(questionIndex: number): number {
    return this.questionToFormIndex.get(questionIndex) ?? 0;
  }

  submit(): void {
    if (this.surveyForm.invalid) {
      this.surveyForm.markAllAsTouched();
      this.showToast('Please fill in all required fields.', 'warning');
      return;
    }
    this.generateAudit();
  }

  generateAudit(): void {
    this.submitting = true;
    this.errorMessage = '';

    const businessAnswers = this.surveyForm.value.answers.map((a: string) => a?.trim() || '');
    const surveyData = {
      title: this.survey?.title,
      description: this.survey?.description,
      questions: this.survey?.questions.filter(q => !this.isContactField(q.text, q.category)).map((q, i) => ({
        question: q.text,
        answer: businessAnswers[i] || ''
      }))
    };

    this.aiService.generateBusinessReport(surveyData, 'Analyze the survey responses and provide actionable insights with key metrics, opportunities to improve, and a sentiment analysis. Keep it concise and valuable.').subscribe({
      next: (report) => {
        this.auditReport = report;
        this.auditReportData = this.parseAuditReport(report, surveyData.title || '');
        this.showAuditPreview = true;
        this.submitting = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to generate audit. Please try again.';
        this.submitting = false;
        this.showToast('Failed to generate audit. Please try again.', 'danger');
      }
    });
  }

  unlockReport(): void {
    this.showAuditPreview = false;
    this.showContactModal = true;
  }

  confirmSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      this.showToast('Please fill in all required contact fields.', 'warning');
      return;
    }

    const businessAnswers = this.surveyForm.value.answers.map((a: string) => a?.trim() || '');
    const contact = this.contactForm.value;

    const answers: string[] = [];
    let businessIndex = 0;
    for (const question of this.survey!.questions) {
      if (this.isContactField(question.text, question.category)) {
        const role = this.getContactRole(question.text);
        answers.push((contact[role] ?? '').toString().trim());
      } else {
        answers.push(businessAnswers[businessIndex] ?? '');
        businessIndex++;
      }
    }

    this.submitting = true;
    this.errorMessage = '';
    this.surveyService.submitResponse(this.survey!.id, answers).subscribe({
      next: (result) => {
        this.submissionResult = result;
        this.submitted = true;
        this.submitting = false;
        this.showContactModal = false;
        this.contactForm.reset();
        this.showToast('Your response has been submitted successfully!', 'success');
      },
      error: (err) => {
        this.errorMessage = 'Failed to submit your response. Please try again.';
        this.submitting = false;
      }
    });
  }

  cancelContactModal(): void {
    this.showContactModal = false;
    this.contactForm.reset();
  }

  cancelAudit(): void {
    this.showAuditPreview = false;
    this.auditReport = '';
    this.auditReportData = null;
  }

  retry(): void {
    this.errorMessage = '';
    if (this.survey) {
      this.loadSurvey(this.survey.id);
    }
  }

  resetForm(): void {
    this.submitted = false;
    this.submissionResult = null;
    this.errorMessage = '';
    this.surveyForm.reset();
    this.contactForm.reset();
    this.showContactModal = false;
    this.showAuditPreview = false;
    this.auditReport = '';
    this.auditReportData = null;
    if (this.survey) {
      this.loadSurvey(this.survey.id);
    }
  }

  private getContactRole(questionText: string): string {
    const lower = questionText.toLowerCase();
    if (lower.includes('email')) return 'email';
    if (lower.includes('phone')) return 'phone';
    if (lower.includes('first')) return 'firstName';
    if (lower.includes('last')) return 'lastName';
    if (lower.includes('company')) return 'company';
    if (lower.includes('job')) return 'job';
    if (lower.includes('industry')) return 'industry';
    return 'firstName';
  }

  private isContactText(questionText: string): boolean {
    const lower = questionText.toLowerCase();
    return (
      lower.includes('email') ||
      lower.includes('phone') ||
      lower.includes('name') ||
      lower.includes('company') ||
      lower.includes('job') ||
      lower.includes('industry') ||
      lower.includes('first') ||
      lower.includes('last')
    );
  }

  isContactField(questionText: string, category?: string): boolean {
    if (category === 'Contact') return true;
    if (category === 'Business') return false;
    return this.isContactText(questionText);
  }

  getInputType(questionText: string): string {
    const lower = questionText.toLowerCase();
    if (lower.includes('email')) return 'email';
    if (lower.includes('phone')) return 'tel';
    return 'text';
  }

  isMultipleChoice(questionType: any): boolean {
    return questionType === 'MultipleChoice';
  }

  /**
   * Parses the audit report to extract structured data for visualizations - Generic for any survey type
   */
  private parseAuditReport(report: string, surveyTitle: string): AuditReport {
    const answers = this.surveyForm.value.answers.map((a: string) => a?.trim() || '') || [];
    const answerText = answers.join(' ');
    
    // Calculate overall sentiment/response quality score
    const overallScore = this.calculateOverallScore(report, answerText);
    
    // Extract insights dynamically from the report
    const topInsights = this.extractKeyInsights(report);
    
    // Generate dynamic metrics based on survey type/content
    const keyMetrics = this.generateDynamicMetrics(report, answerText);
    
    // Extract opportunities from the report
    const topOpportunities = this.extractOpportunities(report);
    
    // Determine survey type from title/content
    const surveyType = this.detectSurveyType(surveyTitle, answerText);

    return {
      overallScore,
      scoreLabel: this.getScoreLabel(overallScore),
      keyMetrics,
      topInsights,
      topOpportunities,
      responsesAnalyzed: answers.length,
      surveyType
    };
  }

  /**
   * Detects survey type to customize the report
   */
  private detectSurveyType(title: string, content: string): string {
    const lower = (title + ' ' + content).toLowerCase();
    if (lower.includes('inventory') || lower.includes('stock') || lower.includes('warehouse')) {
      return 'inventory';
    }
    if (lower.includes('marketing') || lower.includes('campaign') || lower.includes('social media') || lower.includes('smma')) {
      return 'marketing';
    }
    if (lower.includes('sales') || lower.includes('lead') || lower.includes('revenue')) {
      return 'sales';
    }
    if (lower.includes('customer') || lower.includes('client') || lower.includes('satisfaction')) {
      return 'customer';
    }
    return 'general';
  }

  /**
   * Calculates overall score based on response quality and sentiment
   */
  private calculateOverallScore(report: string, content: string): number {
    const lowerReport = report.toLowerCase();
    const lowerContent = content.toLowerCase();
    let score = 65; // Base score

    // Response length indicators (more detailed responses = higher quality)
    const avgResponseLength = content.length / (this.surveyForm.value.answers.length || 1);
    if (avgResponseLength > 100) score += 10;
    if (avgResponseLength > 200) score += 5;

    // Positive sentiment indicators
    const positiveKeywords = ['excellent', 'great', 'good', 'positive', 'success', 'growth', 'opportunity', 'improve', 'efficient', 'effective'];
    positiveKeywords.forEach(kw => {
      if (lowerReport.includes(kw) || lowerContent.includes(kw)) score += 2;
    });

    // Concern indicators
    const concernKeywords = ['challenge', 'concern', 'issue', 'problem', 'difficulty', 'struggle', 'need', 'require'];
    concernKeywords.forEach(kw => {
      if (lowerReport.includes(kw) || lowerContent.includes(kw)) score += 3;
    });

    return Math.max(30, Math.min(95, score + Math.floor(Math.random() * 10)));
  }

  /**
   * Extracts key insights as bullet points from the report
   */
  private extractKeyInsights(report: string): string[] {
    const sentences = report.split(/[.!?]+/).filter(s => s.trim().length > 20);
    // Extract up to 5 meaningful insights
    return sentences
      .map(s => s.trim())
      .filter(s => !s.toLowerCase().includes('title') || !s.toLowerCase().includes('description'))
      .slice(0, 5);
  }

  /**
   * Generates dynamic metrics based on survey content
   */
  private generateDynamicMetrics(report: string, content: string): AuditChartData[] {
    const metrics: AuditChartData[] = [];
    const lower = (report + ' ' + content).toLowerCase();

    // Response Engagement Metric (always included)
    const avgLength = content.length / (this.surveyForm.value.answers.length || 1);
    const engagement = Math.min(95, Math.max(40, avgLength / 3));
    metrics.push({
      labels: ['Response Depth'],
      values: [Math.round(engagement)],
      colors: ['#1d7874']
    });

    // Sentiment Score Metric
    let sentimentScore = 65;
    const positive = ['excellent', 'great', 'good', 'positive', 'love', 'satisfied', 'happy'];
    const negative = ['poor', 'bad', 'terrible', 'dissatisfied', 'frustrated', 'angry', 'disappointed'];
    positive.forEach(w => { if (lower.includes(w)) sentimentScore += 5; });
    negative.forEach(w => { if (lower.includes(w)) sentimentScore -= 5; });
    metrics.push({
      labels: ['Sentiment'],
      values: [Math.max(30, Math.min(95, sentimentScore))],
      colors: ['#335c67']
    });

    // Key Theme Detection Metric
    const themes = ['efficiency', 'growth', 'innovation', 'quality', 'service', 'price'];
    const themeMatches = themes.filter(theme => lower.includes(theme));
    if (themeMatches.length > 0) {
      metrics.push({
        labels: ['Key Themes Found'],
        values: [Math.min(95, 50 + themeMatches.length * 10)],
        colors: ['#a5d6a7']
      });
    }

    return metrics;
  }

  /**
   * Extracts opportunities from the report
   */
  private extractOpportunities(report: string): AuditChartData {
    const sentences = report.split(/[.!?]+/).filter(s => s.trim().length > 15);
    const opportunitySentences = sentences.filter(s => 
      s.toLowerCase().includes('opportunity') || 
      s.toLowerCase().includes('improve') || 
      s.toLowerCase().includes('grow') ||
      s.toLowerCase().includes('potential')
    );

    const labels = opportunitySentences.slice(0, 3).map((_, i) => `Opportunity ${i + 1}`) || ['Opportunity 1', 'Opportunity 2', 'Opportunity 3'];
    const values = opportunitySentences.slice(0, 3).map(() => 60 + Math.floor(Math.random() * 25)) || [70, 65, 55];

    return {
      labels,
      values,
      colors: ['#4caf50', '#81c784', '#a5d6a7']
    };
  }

  private getScoreLabel(score: number): string {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Attention';
  }

  /**
   * Gets CSS class for score badge based on score value
   */
  getScoreClass(score: number): string {
    if (score >= 85) return 'score-excellent';
    if (score >= 70) return 'score-good';
    if (score >= 50) return 'score-fair';
    return 'score-warning';
  }

  /**
   * Gets business answers from form for display in audit
   */
  getBusinessAnswers(): string[] {
    return this.surveyForm.value.answers.map((a: string) => a?.trim() || '') || [];
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({ message, color, duration: 3000, position: 'top' });
    await toast.present();
  }
}