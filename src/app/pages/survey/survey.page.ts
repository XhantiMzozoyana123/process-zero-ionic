import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { SurveyService } from 'src/app/services/survey.service';
import { Survey, SurveyQuestion, SurveyResponseResult } from 'src/app/models/dtos/survey.model';

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

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private surveyService: SurveyService,
    private toastController: ToastController
  ) {
    this.surveyForm = this.fb.group({
      answers: this.fb.array([])
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
        const contactFields: SurveyQuestion[] = [];
        const businessFields: SurveyQuestion[] = [];
        for (const q of survey.questions) {
          if (this.isContactField(q.text)) {
            contactFields.push(q);
          } else {
            businessFields.push(q);
          }
        }
        this.survey = {
          ...survey,
          questions: [...businessFields, ...contactFields]
        };
        this.buildAnswersForm(this.survey.questions.length);
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Survey not found or is not available.';
        this.loading = false;
      }
    });
  }

  private buildAnswersForm(count: number): void {
    while (this.answersFormArray.length > 0) {
      this.answersFormArray.removeAt(0);
    }
    for (let i = 0; i < count; i++) {
      const question = this.survey!.questions[i];
      const validators = question.required ? [Validators.required] : [];
      if (question.text.toLowerCase().includes('email')) {
        validators.push(Validators.email);
      }
      this.answersFormArray.push(this.fb.control('', validators));
    }
  }

  submit(): void {
    if (this.surveyForm.invalid) {
      this.surveyForm.markAllAsTouched();
      this.showToast('Please fill in all required fields.', 'warning');
      return;
    }

    const formValue = this.surveyForm.value;
    const answers = formValue.answers.map((a: string) => a?.trim() || '');

    this.submitting = true;
    this.errorMessage = '';
    this.surveyService.submitResponse(this.survey!.id, answers).subscribe({
      next: (result) => {
        this.submissionResult = result;
        this.submitted = true;
        this.submitting = false;
        this.showToast('Your response has been submitted successfully!', 'success');
      },
      error: (err) => {
        this.errorMessage = 'Failed to submit your response. Please try again.';
        this.submitting = false;
      }
    });
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
    if (this.survey) {
      this.loadSurvey(this.survey.id);
    }
  }

  isContactField(questionText: string): boolean {
    const lower = questionText.toLowerCase();
    return lower.includes('email') || 
           lower.includes('phone') || 
           lower.includes('name') || 
           lower.includes('company') || 
           lower.includes('job') || 
           lower.includes('industry') ||
           lower.includes('first') ||
           lower.includes('last');
  }

  getInputType(questionText: string): string {
    const lower = questionText.toLowerCase();
    if (lower.includes('email')) return 'email';
    if (lower.includes('phone')) return 'tel';
    return 'text';
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({ message, color, duration: 3000, position: 'top' });
    await toast.present();
  }
}