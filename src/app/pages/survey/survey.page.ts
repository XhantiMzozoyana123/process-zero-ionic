import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { SurveyService } from 'src/app/services/survey.service';
import { SurveyClientDto } from 'src/app/models/dtos/survey-client-dto.model';
import { SurveyResponseSubmissionDto } from 'src/app/models/dtos/survey-response-submission-dto.model';
import { SurveyResponseResultDto } from 'src/app/models/dtos/survey-response-result-dto.model';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.page.html',
  styleUrls: ['./survey.page.scss'],
  standalone: false
})
export class SurveyPage implements OnInit {
  survey: SurveyClientDto | null = null;
  surveyForm: FormGroup;
  loading = true;
  submitting = false;
  submitted = false;
  submissionResult: SurveyResponseResultDto | null = null;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private surveyService: SurveyService,
    private toastController: ToastController
  ) {
    this.surveyForm = this.fb.group({
      respondent: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        phone: [''],
        company: [''],
        job: [''],
        industry: ['']
      }),
      answers: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadSurvey();
  }

  get answersFormArray(): FormArray {
    return this.surveyForm.get('answers') as FormArray;
  }

  get respondentForm(): FormGroup {
    return this.surveyForm.get('respondent') as FormGroup;
  }

  private loadSurvey(): void {
    this.loading = true;
    this.errorMessage = '';
    this.surveyService.getSurvey().subscribe({
      next: (survey) => {
        this.survey = survey;
        this.buildAnswersForm(survey.questions.length);
        this.loading = false;
      },
      error: (err) => {
        if (err.status === 404) {
          this.errorMessage = 'Market research survey has not been uploaded yet. Please check back later.';
        } else {
          this.errorMessage = 'Could not load the survey. Please try again later.';
        }
        this.loading = false;
      }
    });
  }

  private buildAnswersForm(count: number): void {
    // Clear existing
    while (this.answersFormArray.length > 0) {
      this.answersFormArray.removeAt(0);
    }
    // Add form controls for each question
    for (let i = 0; i < count; i++) {
      const question = this.survey!.questions[i];
      const validators = question.isRequired ? [Validators.required] : [];
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
    const submission: SurveyResponseSubmissionDto = {
      respondent: {
        email: formValue.respondent.email,
        firstName: formValue.respondent.firstName,
        lastName: formValue.respondent.lastName,
        phone: formValue.respondent.phone || '',
        company: formValue.respondent.company || '',
        job: formValue.respondent.job || '',
        industry: formValue.respondent.industry || ''
      },
      answers: formValue.answers.map((a: string) => a || '')
    };

    this.submitting = true;
    this.errorMessage = '';
    this.surveyService.submitResponse(submission).subscribe({
      next: (result) => {
        this.submissionResult = result;
        this.submitted = true;
        this.submitting = false;
        this.showToast('Your response has been submitted successfully!', 'success');
      },
      error: (err) => {
        if (err.status === 404) {
          this.errorMessage = 'Survey not found. It may have been removed.';
        } else {
          this.errorMessage = 'Failed to submit your response. Please try again.';
        }
        this.submitting = false;
      }
    });
  }

  retry(): void {
    this.errorMessage = '';
    this.loadSurvey();
  }

  resetForm(): void {
    this.submitted = false;
    this.submissionResult = null;
    this.errorMessage = '';
    this.surveyForm.reset();
    this.loadSurvey();
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({ message, color, duration: 3000, position: 'top' });
    await toast.present();
  }
}