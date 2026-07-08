import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController, AlertController } from '@ionic/angular';
import { SurveyService } from 'src/app/services/survey.service';
import { AiService } from 'src/app/services/ai.service';
import { SurveyDto } from 'src/app/models/dtos/survey-dto.model';
import { SurveysListDto } from 'src/app/models/dtos/surveys-list-dto.model';
import { SurveySummaryDto } from 'src/app/models/dtos/survey-summary-dto.model';
import { SurveyResponseResultDto } from 'src/app/models/dtos/survey-response-result-dto.model';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-admin-survey',
  templateUrl: './admin-survey.page.html',
  styleUrls: ['./admin-survey.page.scss'],
  standalone: false
})
export class AdminSurveyPage implements OnInit {
  // Tab selection
  activeTab: 'surveys' | 'editor' | 'responses' = 'surveys';

  // ── Survey List ────────────────────────────────────────────────────────────
  surveys: SurveysListDto[] = [];
  loadingSurveys = false;

  // ── Survey Editor ──────────────────────────────────────────────────────────
  surveyForm: FormGroup;
  loadingSurvey = false;
  savingSurvey = false;
  editingSurveyId: number | null = null;
  isNewSurvey = false;

  // ── Responses ──────────────────────────────────────────────────────────────
  summary: SurveySummaryDto | null = null;
  loadingResponses = false;
  selectedResponse: SurveyResponseResultDto | null = null;
  loadingDetail = false;
  selectedSurveyForResponses: number | null = null;

  // ── PDF Report Generation ──────────────────────────────────────────────────
  showReportPrompt = false;
  reportPromptText = '';
  generatingReport = false;

  constructor(
    private fb: FormBuilder,
    private surveyService: SurveyService,
    private aiService: AiService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    this.surveyForm = this.fb.group({
      name: ['', Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
      status: ['Active'],
      questions: this.fb.array([])
    });
  }

  onReportPromptCancelBound = (): void => this.onReportPromptCancel();
  
  onReportPromptConfirmBound = (data: any): void => this.onReportPromptConfirm(data);

  ngOnInit(): void {
    this.loadSurveys();
  }

  // ── Form Getters ───────────────────────────────────────────────────────────

  get questionsFormArray(): FormArray {
    return this.surveyForm.get('questions') as FormArray;
  }

  createQuestionFormGroup(question?: { id: number; text: string; isRequired: boolean; type?: string; options?: string[] }): FormGroup {
    return this.fb.group({
      id: [question?.id ?? Date.now() + Math.floor(Math.random() * 1000)],
      text: [question?.text ?? '', Validators.required],
      isRequired: [question?.isRequired ?? false],
      type: [question?.type ?? 'OpenEnded'],
      options: [question?.options ?? []]
    });
  }

  addQuestion(): void {
    this.questionsFormArray.push(this.createQuestionFormGroup());
  }

  removeQuestion(index: number): void {
    this.questionsFormArray.removeAt(index);
  }

  getQuestionOptionsFormArray(questionIndex: number): FormArray {
    return this.questionsFormArray.at(questionIndex).get('options') as FormArray;
  }

  addOption(questionIndex: number): void {
    this.getQuestionOptionsFormArray(questionIndex).push(
      this.fb.control('', Validators.required)
    );
  }

  removeOption(questionIndex: number, optionIndex: number): void {
    this.getQuestionOptionsFormArray(questionIndex).removeAt(optionIndex);
  }

  // ── Survey List ────────────────────────────────────────────────────────────

  loadSurveys(): void {
    this.activeTab = 'surveys';
    this.loadingSurveys = true;
    this.surveyService.listSurveysForAdmin().subscribe({
      next: (surveys) => {
        this.surveys = surveys;
        this.loadingSurveys = false;
      },
      error: () => {
        this.showToast('Could not load surveys.', 'danger');
        this.loadingSurveys = false;
      }
    });
  }

  // ── Survey Editor ──────────────────────────────────────────────────────────

  createNewSurvey(): void {
    this.editingSurveyId = null;
    this.isNewSurvey = true;
    this.surveyForm.reset({
      name: '',
      title: '',
      description: '',
      status: 'Active'
    });
    // Clear questions
    while (this.questionsFormArray.length > 0) {
      this.questionsFormArray.removeAt(0);
    }
    this.activeTab = 'editor';
  }

  editSurvey(surveyId: number): void {
    this.editingSurveyId = surveyId;
    this.isNewSurvey = false;
    this.loadingSurvey = true;
    this.activeTab = 'editor';

    this.surveyService.getSurveyForAdmin(surveyId).subscribe({
      next: (survey) => {
        this.surveyForm.patchValue({
          name: survey.name,
          title: survey.title,
          description: survey.description,
          status: survey.status || 'Active'
        });
        // Clear existing questions
        while (this.questionsFormArray.length > 0) {
          this.questionsFormArray.removeAt(0);
        }
        // IMPORTANT: Filter out the 7 contact questions (indices 0-6) that the
        // backend prepends automatically. We only want to show and edit the
        // admin's business/pain point questions. The backend will re-prepend
        // the contact questions when the survey is saved.
        const businessQuestions = survey.questions.filter(q =>
          q.category !== 'Contact'
        );
        // Add business questions from server
        businessQuestions.forEach(q => {
          this.questionsFormArray.push(this.createQuestionFormGroup(q));
        });
        this.loadingSurvey = false;
      },
      error: () => {
        this.showToast('Could not load survey for editing.', 'danger');
        this.loadingSurvey = false;
      }
    });
  }

  saveSurvey(): void {
    if (this.surveyForm.invalid) {
      this.surveyForm.markAllAsTouched();
      this.showToast('Please fill in all required fields.', 'warning');
      return;
    }

    const formValue = this.surveyForm.value;
    const survey: SurveyDto = {
      name: formValue.name,
      title: formValue.title,
      description: formValue.description,
      status: formValue.status,
      questions: formValue.questions.map((q: any) => {
        // For new surveys, omit the client-generated id so the backend can
        // assign proper IDs. On update, preserve server-assigned IDs.
        const question: any = {
          text: q.text,
          isRequired: q.isRequired,
          type: q.type || 'OpenEnded'
        };
        // Only include options for MultipleChoice questions
        if (question.type === 'MultipleChoice' && q.options?.length) {
          question.options = q.options;
        }
        if (!this.isNewSurvey && q.id != null) {
          question.id = q.id;
        }
        return question;
      })
    };

    this.savingSurvey = true;

    const operation = this.isNewSurvey
      ? this.surveyService.createSurvey(survey)
      : this.surveyService.updateSurvey(this.editingSurveyId!, survey);

    operation.subscribe({
      next: () => {
        this.showToast(
          this.isNewSurvey ? 'Survey created successfully!' : 'Survey updated successfully!',
          'success'
        );
        this.savingSurvey = false;
        this.loadSurveys();
      },
      error: (err) => {
        this.showToast(
          err.error?.message || 'Failed to save survey. Please try again.',
          'danger'
        );
        this.savingSurvey = false;
      }
    });
  }

  cancelEdit(): void {
    this.loadSurveys();
  }

  async confirmDeleteSurvey(surveyId: number, surveyName: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete Survey',
      message: `Are you sure you want to delete "${surveyName}"? This will permanently delete all responses and respondent data associated with this survey.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.deleteSurvey(surveyId);
          }
        }
      ]
    });
    await alert.present();
  }

  private deleteSurvey(surveyId: number): void {
    this.surveyService.deleteSurvey(surveyId).subscribe({
      next: () => {
        this.showToast('Survey deleted successfully.', 'success');
        this.loadSurveys();
      },
      error: () => {
        this.showToast('Failed to delete survey.', 'danger');
      }
    });
  }

  // ── Responses ──────────────────────────────────────────────────────────────

  viewResponses(surveyId: number): void {
    this.selectedSurveyForResponses = surveyId;
    this.activeTab = 'responses';
    this.loadingResponses = true;
    this.selectedResponse = null;
    this.surveyService.getAllResponses(surveyId).subscribe({
      next: (summary) => {
        this.summary = summary;
        this.loadingResponses = false;
      },
      error: () => {
        this.showToast('Could not load survey responses.', 'danger');
        this.loadingResponses = false;
      }
    });
  }

  viewResponseDetail(responseId: number): void {
    this.loadingDetail = true;
    this.surveyService.getResponseById(responseId).subscribe({
      next: (response) => {
        this.selectedResponse = response;
        this.loadingDetail = false;
      },
      error: () => {
        this.showToast('Could not load response details.', 'danger');
        this.loadingDetail = false;
      }
    });
  }

  closeDetail(): void {
    this.selectedResponse = null;
  }

  switchTab(event: CustomEvent): void {
    const tab = event.detail.value as 'surveys' | 'editor' | 'responses';
    this.activeTab = tab;
    if (tab === 'surveys') {
      this.loadSurveys();
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  /**
   * Copies the public survey link to clipboard.
   * The survey is accessible at /survey/{id} for respondents.
   */
  copySurveyLink(surveyId: number): void {
    const baseUrl = window.location.origin;
    const surveyUrl = `${baseUrl}/survey/${surveyId}`;
    navigator.clipboard.writeText(surveyUrl).then(
      () => {
        this.showToast('Survey link copied to clipboard!', 'success');
      },
      () => {
        this.showToast('Failed to copy link.', 'danger');
      }
    );
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'medium';
      case 'closed': return 'danger';
      default: return 'medium';
    }
  }

  // ── PDF Report Generation ──────────────────────────────────────────────────

  openReportPrompt(): void {
    this.showReportPrompt = true;
    this.reportPromptText = '';
  }

  closeReportPrompt(): void {
    this.showReportPrompt = false;
    this.reportPromptText = '';
  }

  onReportPromptCancel(): void {
    this.closeReportPrompt();
  }

  onReportPromptConfirm(data: any): void {
    this.reportPromptText = data.prompt || '';
    this.generatePdfReport();
  }

  generatePdfReport(): void {
    if (!this.summary || !this.reportPromptText.trim()) {
      this.showToast('Please enter instructions for the report.', 'warning');
      return;
    }

    this.generatingReport = true;
    this.closeReportPrompt();

    const surveyData = {
      survey: this.summary,
      responses: this.summary.responses,
      totalResponses: this.summary.totalResponses,
      dateRange: {
        from: this.summary.collectedFrom,
        to: this.summary.collectedTo
      }
    };

    this.aiService.generateBusinessReport(surveyData, this.reportPromptText).subscribe({
      next: (businessPlan) => {
        this.createPdfFromMarkdown(businessPlan);
        this.generatingReport = false;
        this.showToast('PDF report generated successfully!', 'success');
      },
      error: () => {
        this.showToast('Failed to generate business plan. Please try again.', 'danger');
        this.generatingReport = false;
      }
    });
  }

  private createPdfFromMarkdown(markdown: string): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxLineWidth = pageWidth - margin * 2;
    let yPosition = margin;

    const lines = markdown.split('\n');

    doc.setFont('helvetica');

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine === '') {
        yPosition += 5;
        continue;
      }

      if (trimmedLine.startsWith('# ')) {
        if (yPosition > 260) {
          doc.addPage();
          yPosition = margin;
        }
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        const title = trimmedLine.substring(2);
        doc.text(title, margin, yPosition);
        yPosition += 10;
        continue;
      }

      if (trimmedLine.startsWith('## ')) {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = margin;
        }
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        const subtitle = trimmedLine.substring(3);
        doc.text(subtitle, margin, yPosition);
        yPosition += 8;
        continue;
      }

      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const bulletText = trimmedLine.substring(2);
        const splitBullet = doc.splitTextToSize('• ' + bulletText, maxLineWidth - 5);
        doc.text(splitBullet, margin + 5, yPosition);
        yPosition += splitBullet.length * 5;
        continue;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const splitText = doc.splitTextToSize(trimmedLine, maxLineWidth);
      doc.text(splitText, margin, yPosition);
      yPosition += splitText.length * 5;

      if (yPosition > 280) {
        doc.addPage();
        yPosition = margin;
      }
    }

    const fileName = `business-plan-${this.summary?.name || 'report'}-${new Date().getTime()}.pdf`;
    doc.save(fileName);
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({ message, color, duration: 3000, position: 'top' });
    await toast.present();
  }
}