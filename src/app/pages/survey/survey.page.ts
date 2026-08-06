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
  showContactModal = false;
  contactForm: FormGroup;
  questionToFormIndex: Map<number, number> = new Map();

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private surveyService: SurveyService,
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

  isMultipleChoice(question: any): boolean {
    // Handle both string enums ("MultipleChoice") and numeric enums (0) from the API,
    // as well as the fallback check for options array presence.
    if (question.options && Array.isArray(question.options) && question.options.length > 0) {
      return true;
    }
    const type = question.type;
    if (type === 'MultipleChoice' || type === 0) {
      return true;
    }
    return false;
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({ message, color, duration: 3000, position: 'top' });
    await toast.present();
  }

  openLink(url: string | null | undefined): void {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }
}