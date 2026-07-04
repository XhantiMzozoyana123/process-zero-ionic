import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController, AlertController } from '@ionic/angular';
import { SurveyService } from 'src/app/services/survey.service';
import { SurveyDto } from 'src/app/models/dtos/survey-dto.model';
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
  activeTab: 'editor' | 'responses' = 'editor';

  // ── Survey Editor ──────────────────────────────────────────────────────────
  surveyForm: FormGroup;
  loadingSurvey = false;
  savingSurvey = false;
  surveyLoaded = false;

  // ── Responses ──────────────────────────────────────────────────────────────
  summary: SurveySummaryDto | null = null;
  loadingResponses = false;
  selectedResponse: SurveyResponseResultDto | null = null;
  loadingDetail = false;

  constructor(
    private fb: FormBuilder,
    private surveyService: SurveyService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    this.surveyForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      questions: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadSurveyForAdmin();
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

  // ── Survey Editor ──────────────────────────────────────────────────────────

  private loadSurveyForAdmin(): void {
    this.loadingSurvey = true;
    this.surveyService.getSurveyForAdmin().subscribe({
      next: (survey) => {
        if (survey) {
          this.surveyForm.patchValue({
            title: survey.title,
            description: survey.description
          });
          // Clear existing questions
          while (this.questionsFormArray.length > 0) {
            this.questionsFormArray.removeAt(0);
          }
          // Add questions from server
          survey.questions.forEach(q => {
            this.questionsFormArray.push(this.createQuestionFormGroup(q));
          });
          this.surveyLoaded = true;
        }
        this.loadingSurvey = false;
      },
      error: (err) => {
        if (err.status === 404) {
          // No survey exists yet - that's fine, start fresh
          this.surveyLoaded = true;
        } else {
          this.showToast('Could not load survey for editing.', 'danger');
        }
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
      title: formValue.title,
      description: formValue.description,
      questions: formValue.questions.map((q: any) => ({
        id: q.id,
        text: q.text,
        isRequired: q.isRequired
      }))
    };

    this.savingSurvey = true;
    this.surveyService.uploadSurvey(survey).subscribe({
      next: () => {
        this.showToast('Survey saved successfully!', 'success');
        this.savingSurvey = false;
      },
      error: () => {
        this.showToast('Failed to save survey. Please try again.', 'danger');
        this.savingSurvey = false;
      }
    });
  }

  // ── Responses ──────────────────────────────────────────────────────────────

  loadResponses(): void {
    this.activeTab = 'responses';
    this.loadingResponses = true;
    this.selectedResponse = null;
    this.surveyService.getAllResponses().subscribe({
      next: (summary) => {
        this.summary = summary;
        this.loadingResponses = false;
      },
      error: (err) => {
        if (err.status === 404) {
          this.summary = null;
        } else {
          this.showToast('Could not load survey responses.', 'danger');
        }
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
    const tab = event.detail.value as 'editor' | 'responses';
    this.activeTab = tab;
    if (tab === 'responses') {
      this.loadResponses();
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({ message, color, duration: 3000, position: 'top' });
    await toast.present();
  }
}