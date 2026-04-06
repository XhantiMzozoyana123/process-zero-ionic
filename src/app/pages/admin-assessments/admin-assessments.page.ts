import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { AssessmentService } from 'src/app/services/assessment-service';
import { ProductService } from 'src/app/services/product-service';
import { Product } from 'src/app/models/entities/product.model';
import { AssessmentDto } from 'src/app/models/dtos/assessment-dto.model';

@Component({
  selector: 'app-admin-assessments',
  templateUrl: './admin-assessments.page.html',
  styleUrls: ['./admin-assessments.page.scss'],
  standalone: false
})
export class AdminAssessmentsPage implements OnInit {
  products: Product[] = [];
  loading = false;
  submitting = false;
  loadingExisting = false;

  targetMode: 'global' | 'product' = 'global';
  targetProductId: number | null = null;

  assessmentForm: FormGroup;

  constructor(
    private assessmentService: AssessmentService,
    private productService: ProductService,
    private fb: FormBuilder,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.assessmentForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: [''],
      passMark: [null],
      mcqs: this.fb.array([]),
      openQuestions: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadExisting();
  }

  get mcqs(): FormArray {
    return this.assessmentForm.get('mcqs') as FormArray;
  }

  get openQuestions(): FormArray {
    return this.assessmentForm.get('openQuestions') as FormArray;
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAll().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: () => {
        this.showToast('Could not load products.', 'danger');
        this.loading = false;
      }
    });
  }

  // -- MCQ management --
  addMcq(): void {
    const mcqGroup = this.fb.group({
      text: ['', Validators.required],
      correctIndex: [0, [Validators.required, Validators.min(0)]],
      weight: [1, [Validators.required, Validators.min(1)]],
      options: this.fb.array([
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required)
      ])
    });
    this.mcqs.push(mcqGroup);
  }

  removeMcq(index: number): void {
    this.mcqs.removeAt(index);
  }

  getMcqOptions(mcqIndex: number): FormArray {
    return this.mcqs.at(mcqIndex).get('options') as FormArray;
  }

  addOption(mcqIndex: number): void {
    this.getMcqOptions(mcqIndex).push(this.fb.control('', Validators.required));
  }

  removeOption(mcqIndex: number, optionIndex: number): void {
    const opts = this.getMcqOptions(mcqIndex);
    if (opts.length > 2) {
      opts.removeAt(optionIndex);
      // Fix correctIndex if needed
      const mcq = this.mcqs.at(mcqIndex);
      const ci = mcq.get('correctIndex')!.value;
      if (ci >= opts.length) {
        mcq.get('correctIndex')!.setValue(opts.length - 1);
      }
    }
  }

  // -- Open question management --
  addOpenQuestion(): void {
    const oqGroup = this.fb.group({
      text: ['', Validators.required],
      weight: [1, [Validators.required, Validators.min(1)]]
    });
    this.openQuestions.push(oqGroup);
  }

  removeOpenQuestion(index: number): void {
    this.openQuestions.removeAt(index);
  }

  // -- Load existing assessment --
  onTargetModeChange(event: any): void {
    const mode = event?.detail?.value;
    if (mode) {
      this.targetMode = mode;
    }
    this.resetForm();
    this.targetProductId = null;
    if (this.targetMode === 'global') {
      this.loadExisting();
    }
  }

  onProductChange(event: any): void {
    const id = event?.detail?.value;
    if (id) {
      this.targetProductId = id;
    }
    this.resetForm();
    if (this.targetProductId && this.targetProductId > 0) {
      this.loadExisting();
    }
  }

  loadExisting(): void {
    this.loadingExisting = true;

    const obs = this.targetMode === 'global'
      ? this.assessmentService.getGlobalForAdmin()
      : this.assessmentService.getByProductForAdmin(this.targetProductId!);

    obs.subscribe({
      next: (data) => {
        this.populateForm(data);
        this.loadingExisting = false;
        this.showToast('Loaded existing assessment.', 'success');
      },
      error: (err) => {
        this.loadingExisting = false;
        if (err.status === 404) {
          this.showToast('No existing assessment found. Start fresh.', 'medium');
        } else {
          this.showToast('Could not load existing assessment.', 'danger');
          console.error('loadExisting error:', err);
        }
      }
    });
  }

  private populateForm(data: any): void {
    this.resetForm();

    this.assessmentForm.patchValue({
      title: data.title || data.Title || '',
      description: data.description || data.Description || '',
      passMark: data.passMark ?? data.PassMark ?? null
    });

    const mcqs = data.mcqs || data.MCQs || data.mcQs || data.Mcqs || [];
    const openQuestions = data.openQuestions || data.OpenQuestions || [];

    for (const mcq of mcqs) {
      const options = mcq.options || mcq.Options || [];
      const optionsArray = this.fb.array(
        options.map((o: string) => this.fb.control(o, Validators.required))
      );
      const mcqGroup = this.fb.group({
        text: [mcq.text || mcq.Text || '', Validators.required],
        correctIndex: [mcq.correctIndex ?? mcq.CorrectIndex ?? 0, [Validators.required, Validators.min(0)]],
        weight: [mcq.weight ?? mcq.Weight ?? 1, [Validators.required, Validators.min(1)]],
        options: optionsArray
      });
      this.mcqs.push(mcqGroup);
    }

    for (const oq of openQuestions) {
      const oqGroup = this.fb.group({
        text: [oq.text || oq.Text || '', Validators.required],
        weight: [oq.weight ?? oq.Weight ?? 1, [Validators.required, Validators.min(1)]]
      });
      this.openQuestions.push(oqGroup);
    }
  }

  // -- Upload --
  canUpload(): boolean {
    if (this.targetMode === 'product' && (!this.targetProductId || this.targetProductId <= 0)) return false;
    return this.assessmentForm.valid && (this.mcqs.length > 0 || this.openQuestions.length > 0);
  }

  async upload(): Promise<void> {
    const val = this.assessmentForm.getRawValue();

    if (!val.title || !val.title.trim()) {
      this.showToast('Please enter a title.', 'warning');
      return;
    }

    if (this.mcqs.length === 0 && this.openQuestions.length === 0) {
      this.showToast('Add at least one MCQ or open-ended question.', 'warning');
      return;
    }

    if (this.targetMode === 'product' && (!this.targetProductId || this.targetProductId <= 0)) {
      this.showToast('Please select a product.', 'warning');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Upload Assessment?',
      message: this.targetMode === 'global'
        ? 'This will replace the current global assessment. Continue?'
        : `This will replace the assessment for the selected product. Continue?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Upload', role: 'confirm', handler: () => this.performUpload() }
      ]
    });
    await alert.present();
  }

  private performUpload(): void {
    this.submitting = true;
    const val = this.assessmentForm.getRawValue();

    const dto: AssessmentDto = {
      title: val.title.trim(),
      description: (val.description || '').trim(),
      productId: this.targetMode === 'global' ? 0 : this.targetProductId!,
      passMark: val.passMark != null ? +val.passMark : null,
      mcqs: val.mcqs.map((m: any) => ({
        text: m.text.trim(),
        options: m.options.map((o: string) => o.trim()),
        correctIndex: +m.correctIndex,
        weight: +m.weight
      })),
      openQuestions: val.openQuestions.map((oq: any) => ({
        text: oq.text.trim(),
        weight: +oq.weight
      }))
    };

    const obs = this.targetMode === 'global'
      ? this.assessmentService.uploadGlobal(dto)
      : this.assessmentService.uploadByProduct(this.targetProductId!, dto);

    obs.subscribe({
      next: () => {
        this.showToast('Assessment uploaded successfully.', 'success');
        this.submitting = false;
        this.resetForm();
      },
      error: () => {
        this.showToast('Could not upload assessment.', 'danger');
        this.submitting = false;
      }
    });
  }

  resetForm(): void {
    this.assessmentForm.reset({ title: '', description: '', passMark: null });
    this.mcqs.clear();
    this.openQuestions.clear();
  }

  isInvalid(path: string): boolean {
    const ctrl = this.assessmentForm.get(path);
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastController.create({ message, color, duration: 3000, position: 'bottom' });
    await toast.present();
  }
}
