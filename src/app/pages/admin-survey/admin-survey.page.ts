import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController, AlertController } from '@ionic/angular';
import { SurveyService } from 'src/app/services/survey.service';
import { SurveyDto } from 'src/app/models/dtos/survey-dto.model';
import { SurveysListDto } from 'src/app/models/dtos/surveys-list-dto.model';
import { SurveySummaryDto } from 'src/app/models/dtos/survey-summary-dto.model';
import { SurveyResponseResultDto } from 'src/app/models/dtos/survey-response-result-dto.model';

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

  constructor(
    private fb: FormBuilder,
    private surveyService: SurveyService,
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

  ngOnInit(): void {
    this.loadSurveys();
  }

  // ── Form Getters ───────────────────────────────────────────────────────────

  get questionsFormArray(): FormArray {
    return this.surveyForm.get('questions') as FormArray;
  }

  createQuestionFormGroup(question?: { id: number; text: string; isRequired: boolean }): FormGroup {
    return this.fb.group({
      id: [question?.id ?? Date.now() + Math.floor(Math.random() * 1000)],
      text: [question?.text ?? '', Validators.required],
      isRequired: [question?.isRequired ?? false]
    });
  }

  addQuestion(): void {
    this.questionsFormArray.push(this.createQuestionFormGroup());
  }

  removeQuestion(index: number): void {
    this.questionsFormArray.removeAt(index);
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
        // Add questions from server
        survey.questions.forEach(q => {
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
      questions: formValue.questions.map((q: any) => ({
        id: q.id,
        text: q.text,
        isRequired: q.isRequired
      }))
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

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({ message, color, duration: 3000, position: 'top' });
    await toast.present();
  }
}