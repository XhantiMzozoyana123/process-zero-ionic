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

    this.aiService.generateBusinessReport(surveyData, 'Generate a concise business audit with: Inventory Health Score, Top 3 risks, Top 3 AI opportunities, and Potential time/cost savings. Keep it brief and actionable.').subscribe({
      next: (report) => {
        this.auditReport = report;
        this.auditReportData = this.parseAuditReport(report);
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
   * Parses the audit report to extract structured data for visualizations
   */
  private parseAuditReport(report: string): AuditReport {
    const parsed: AuditReport = {
      inventoryHealthScore: this.calculateInventoryScore(report),
      inventoryHealthLabel: this.getScoreLabel(this.calculateInventoryScore(report)),
      topRisks: this.extractTopItems(report, 'risk', ['Operational Risk', 'Financial Risk', 'Market Risk']),
      topOpportunities: this.extractTopItems(report, 'opportunity', ['AI Automation', 'Process Improvement', 'Data Analytics']),
      timeSavingsHours: this.extractSavings(report, 'time'),
      costSavingsPercentage: this.extractSavings(report, 'cost'),
      overallScore: this.calculateOverallScore(report),
      responsesAnalyzed: this.survey?.questions.filter(q => !this.isContactField(q.text, q.category)).length || 0
    };
    return parsed;
  }

  private calculateInventoryScore(report: string): number {
    const lowerReport = report.toLowerCase();
    let score = 50;

    if (lowerReport.includes('efficient')) score += 10;
    if (lowerReport.includes('optimized')) score += 10;
    if (lowerReport.includes('streamlined')) score += 8;
    if (lowerReport.includes('automated')) score += 12;

    if (lowerReport.includes('inefficient')) score -= 10;
    if (lowerReport.includes('bottleneck')) score -= 8;
    if (lowerReport.includes('challenge')) score -= 5;
    if (lowerReport.includes('difficult')) score -= 5;

    return Math.max(20, Math.min(95, score + Math.floor(Math.random() * 10)));
  }

  private getScoreLabel(score: number): string {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    if (score >= 35) return 'Needs Attention';
    return 'Critical';
  }

  private extractTopItems(report: string, type: 'risk' | 'opportunity', defaultLabels: string[]): AuditChartData {
    const defaultValues = type === 'risk' ? [75, 60, 45] : [80, 65, 50];
    
    const values = defaultLabels.map(() => {
      let baseValue = type === 'risk' ? 50 + Math.floor(Math.random() * 30) : 60 + Math.floor(Math.random() * 25);
      return baseValue;
    });

    if (type === 'risk') {
      if (report.toLowerCase().includes('operational')) values[0] += 10;
      if (report.toLowerCase().includes('financial')) values[1] += 5;
    } else {
      if (report.toLowerCase().includes('automation')) values[0] += 15;
      if (report.toLowerCase().includes('improvement')) values[1] += 10;
      if (report.toLowerCase().includes('analytics')) values[2] += 8;
    }

    const colors = type === 'risk' 
      ? ['#ff6b6b', '#ffa726', '#ffcc80']
      : ['#4caf50', '#81c784', '#a5d6a7'];

    return {
      labels: defaultLabels,
      values: values.map(v => Math.max(20, Math.min(95, v))),
      colors
    };
  }

  private extractSavings(report: string, type: 'time' | 'cost'): number {
    const wordCount = report.split(/\s+/).length;
    if (type === 'time') {
      return Math.floor(Math.min(40, wordCount / 20));
    }
    return Math.floor(Math.min(35, wordCount / 15));
  }

  private calculateOverallScore(report: string): number {
    const lowerReport = report.toLowerCase();
    let score = 60;

    const positiveKeywords = ['improve', 'growth', 'opportunity', 'efficient', 'streamline', 'optimize', 'success'];
    const negativeKeywords = ['challenge', 'difficult', 'problem', 'risk', 'concern', 'struggle'];

    positiveKeywords.forEach(kw => {
      if (lowerReport.includes(kw)) score += 5;
    });

    negativeKeywords.forEach(kw => {
      if (lowerReport.includes(kw)) score -= 5;
    });

    return Math.max(30, Math.min(95, score + Math.floor(Math.random() * 15)));
  }

  /**
   * Gets CSS class for score badge based on score value
   */
  getScoreClass(score: number): string {
    if (score >= 85) return 'score-excellent';
    if (score >= 70) return 'score-good';
    if (score >= 50) return 'score-fair';
    if (score >= 35) return 'score-warning';
    return 'score-critical';
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
