import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { AssessmentService } from 'src/app/services/assessment-service';
import {
  AssessmentClientDto,
  SubmissionDto,
  SubmissionResultDto
} from 'src/app/models/dtos/assessment-dto.model';

@Component({
  selector: 'app-assessment',
  templateUrl: './assessment.page.html',
  styleUrls: ['./assessment.page.scss'],
  standalone: false
})
export class AssessmentPage implements OnInit {
  // Phases: 'loading' | 'error' | 'welcome' | 'quiz' | 'submitting' | 'result'
  phase: 'loading' | 'error' | 'welcome' | 'quiz' | 'submitting' | 'result' = 'loading';
  errorMessage = '';

  assessment: AssessmentClientDto | null = null;
  mcqAnswers: number[] = [];
  openAnswers: string[] = [];

  // Stepper
  currentStep = 0;
  totalQuestions = 0;
  animDirection: 'forward' | 'backward' = 'forward';

  // Result
  result: SubmissionResultDto | null = null;
  submittingProgress = 0;

  /** If set, this is a product-specific assessment */
  productId: number | null = null;

  constructor(
    private assessmentService: AssessmentService,
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit(): void {
    const pid = this.route.snapshot.queryParamMap.get('productId');
    this.productId = pid ? +pid : null;
    this.loadAssessment();
  }

  /** Normalize PascalCase backend JSON to camelCase DTO */
  private normalizeAssessment(raw: any): AssessmentClientDto {
    const mcqs = (raw.mcqs ?? raw.Mcqs ?? raw.mcQs ?? raw.MCQs ?? []).map((q: any) => ({
      text: q.text ?? q.Text ?? '',
      options: q.options ?? q.Options ?? [],
      weight: q.weight ?? q.Weight ?? 1
    }));
    const openQuestions = (raw.openQuestions ?? raw.OpenQuestions ?? []).map((q: any) => ({
      text: q.text ?? q.Text ?? '',
      weight: q.weight ?? q.Weight ?? 1
    }));
    return {
      title: raw.title ?? raw.Title ?? 'Assessment',
      description: raw.description ?? raw.Description ?? '',
      productId: raw.productId ?? raw.ProductId ?? 0,
      mcqs,
      openQuestions
    };
  }

  private normalizeResult(raw: any): SubmissionResultDto {
    return {
      productId: raw.productId ?? raw.ProductId ?? 0,
      score: raw.score ?? raw.Score ?? 0,
      total: raw.total ?? raw.Total ?? 0,
      percentage: raw.percentage ?? raw.Percentage ?? 0,
      passed: raw.passed ?? raw.Passed ?? false
    };
  }

  loadAssessment(): void {
    this.phase = 'loading';
    const source$ = this.productId
      ? this.assessmentService.getByProduct(this.productId)
      : this.assessmentService.getGlobal();
    source$.subscribe({
      next: (raw) => {
        const data = this.normalizeAssessment(raw);
        this.assessment = data;
        this.totalQuestions = data.mcqs.length + data.openQuestions.length;
        this.mcqAnswers = new Array(data.mcqs.length).fill(-1);
        this.openAnswers = new Array(data.openQuestions.length).fill('');
        this.phase = 'welcome';
      },
      error: (err) => {
        this.errorMessage = err.status === 404
          ? 'No assessment available yet. Please contact an administrator.'
          : 'Could not load the assessment. Please try again.';
        this.phase = 'error';
      }
    });
  }

  startAssessment(): void {
    this.currentStep = 0;
    this.animDirection = 'forward';
    this.phase = 'quiz';
  }

  // --- Question navigation helpers ---
  get isMcqStep(): boolean {
    return this.assessment != null && this.currentStep < this.assessment.mcqs.length;
  }

  get isOpenStep(): boolean {
    return this.assessment != null && this.currentStep >= this.assessment.mcqs.length;
  }

  get currentMcqIndex(): number {
    return this.currentStep;
  }

  get currentOpenIndex(): number {
    return this.assessment ? this.currentStep - this.assessment.mcqs.length : 0;
  }

  get progressPercent(): number {
    if (this.totalQuestions === 0) return 0;
    return ((this.currentStep + 1) / this.totalQuestions) * 100;
  }

  get answeredPercent(): number {
    if (this.totalQuestions === 0) return 0;
    const mcqDone = this.mcqAnswers.filter(a => a >= 0).length;
    const openDone = this.openAnswers.filter(a => a.trim().length > 0).length;
    return ((mcqDone + openDone) / this.totalQuestions) * 100;
  }

  get isCurrentAnswered(): boolean {
    if (this.isMcqStep) {
      return this.mcqAnswers[this.currentMcqIndex] >= 0;
    }
    return this.openAnswers[this.currentOpenIndex]?.trim().length > 0;
  }

  get isLastStep(): boolean {
    return this.currentStep === this.totalQuestions - 1;
  }

  get allMcqsAnswered(): boolean {
    return this.mcqAnswers.every(a => a >= 0);
  }

  nextStep(): void {
    if (this.currentStep < this.totalQuestions - 1) {
      this.animDirection = 'forward';
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 0) {
      this.animDirection = 'backward';
      this.currentStep--;
    }
  }

  selectMcqOption(optionIndex: number): void {
    this.mcqAnswers[this.currentMcqIndex] = optionIndex;
  }

  // --- Submission ---
  async confirmSubmit(): Promise<void> {
    if (!this.allMcqsAnswered) {
      const toast = await this.toastController.create({
        message: 'Please answer all multiple-choice questions before submitting.',
        color: 'warning',
        duration: 3000,
        position: 'bottom'
      });
      await toast.present();
      return;
    }

    const alert = await this.alertController.create({
      header: 'Submit Assessment',
      message: 'Are you sure you want to submit? You cannot change your answers after submission.',
      buttons: [
        { text: 'Review', role: 'cancel' },
        { text: 'Submit', role: 'confirm', handler: () => this.submit() }
      ]
    });
    await alert.present();
  }

  private submit(): void {
    this.phase = 'submitting';
    this.submittingProgress = 0;
    this.animateSubmitProgress();

    const submission: SubmissionDto = {
      mcqAnswers: this.mcqAnswers,
      openAnswers: this.openAnswers.map(a => a.trim() || null)
    };

    const submit$ = this.productId
      ? this.assessmentService.submitByProduct(this.productId, submission)
      : this.assessmentService.submitGlobal(submission);

    submit$.subscribe({
      next: (raw) => {
        this.result = this.normalizeResult(raw);
        // Finish progress bar then show result
        this.submittingProgress = 100;
        setTimeout(() => {
          this.phase = 'result';
        }, 600);
      },
      error: async () => {
        this.phase = 'quiz';
        const toast = await this.toastController.create({
          message: 'Submission failed. Please try again.',
          color: 'danger',
          duration: 3000,
          position: 'bottom'
        });
        await toast.present();
      }
    });
  }

  private animateSubmitProgress(): void {
    const interval = setInterval(() => {
      if (this.submittingProgress >= 90 || this.phase !== 'submitting') {
        clearInterval(interval);
        return;
      }
      this.submittingProgress += Math.random() * 12;
      if (this.submittingProgress > 90) this.submittingProgress = 90;
    }, 300);
  }

  goToDashboard(): void {
    if (this.productId) {
      this.router.navigateByUrl('/account/products');
    } else {
      this.router.navigateByUrl('/account/dashboard');
    }
  }

  retake(): void {
    this.result = null;
    this.currentStep = 0;
    if (this.assessment) {
      this.mcqAnswers = new Array(this.assessment.mcqs.length).fill(-1);
      this.openAnswers = new Array(this.assessment.openQuestions.length).fill('');
    }
    this.phase = 'welcome';
  }
}
