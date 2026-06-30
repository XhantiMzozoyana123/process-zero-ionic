import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { forkJoin } from 'rxjs';
import { catchError, of } from 'rxjs';
import { AssessmentService } from 'src/app/services/assessment-service';
import { ProductService } from 'src/app/services/product-service';
import { AdminUserService } from 'src/app/services/admin-user-service';
import { Product } from 'src/app/models/entities/product.model';
import { AssessmentDto, AdminSubmissionResultDto } from 'src/app/models/dtos/assessment-dto.model';
import { ApplicationUser } from 'src/app/models/entities/application-user.model';

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
  resultsLoading = false;
  userLookupLoading = false;

  adminResults: AdminSubmissionResultDto[] = [];
  adminUserId = '';
  selectedUserGlobalResult: AdminSubmissionResultDto | null = null;
  adminUsers: ApplicationUser[] = [];
  rawDebugSample: string | null = null;

  private usersById = new Map<string, ApplicationUser>();
  private usersByLookup = new Map<string, ApplicationUser>();

  targetMode: 'global' | 'product' = 'global';
  targetProductId: number | null = null;

  assessmentForm: FormGroup;

  constructor(
    private assessmentService: AssessmentService,
    private productService: ProductService,
    private adminUserService: AdminUserService,
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
    this.loadUsersAndResults();
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

  refreshPage(event?: any): void {
    this.loadProducts();
    this.loadExisting();
    this.loadUsersAndResults();
    event?.target?.complete();
  }

  /** Load users and results in parallel, then enrich results with user identity. */
  loadUsersAndResults(): void {
    this.resultsLoading = true;
    this.rawDebugSample = null;

    forkJoin({
      users: this.adminUserService.getAll().pipe(catchError(() => of([]))),
      results: this.assessmentService.getAllUsersResults().pipe(catchError(() => of([])))
    }).subscribe(({ users, results }) => {
      // Build user index first
      this.adminUsers = Array.isArray(users) ? users : [];
      this.rebuildUsersIndex(this.adminUsers);

      // Capture raw debug sample before normalizing
      const rawArr = Array.isArray(results) ? results : [];
      if (rawArr.length > 0) {
        this.rawDebugSample = JSON.stringify(rawArr[0], null, 2);
      }

      // Enrich results with user identity from index
      this.adminResults = rawArr.map((item) => this.normalizeResultWithUser(item));
      this.resultsLoading = false;
    });
  }

  private rebuildUsersIndex(users: ApplicationUser[]): void {
    this.usersById.clear();
    this.usersByLookup.clear();

    for (const u of users) {
      if (!u?.id) continue;
      const id = String(u.id);
      this.usersById.set(id, u);
      this.usersByLookup.set(id.toLowerCase(), u);
      if (u.userName) this.usersByLookup.set(u.userName.toLowerCase(), u);
      if (u.email) this.usersByLookup.set(u.email.toLowerCase(), u);
    }
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

  loadAllUsersResults(): void {
    this.loadUsersAndResults();
  }

  lookupUserGlobalResult(): void {
    const userInput = (this.adminUserId || '').trim();
    if (!userInput) {
      this.showToast('Please enter a user id, username, or email.', 'warning');
      return;
    }

    // Try to resolve via index, but fall back to the raw input as a userId.
    const resolvedUserId = this.resolveUserInputToId(userInput) ?? userInput;

    // ── 1. Try to find it in already-loaded results first ──────────────────
    const cached = this.adminResults.find((r) => {
      const pid = r.productId ?? (r as any).ProductId;
      const uid = this.getResultUserId(r);
      return (pid === 0 || pid == null) &&
        (uid === resolvedUserId ||
          uid.toLowerCase() === userInput.toLowerCase() ||
          (r as any)._userName?.toLowerCase() === userInput.toLowerCase() ||
          (r as any)._email?.toLowerCase() === userInput.toLowerCase());
    });

    if (cached) {
      this.selectedUserGlobalResult = cached;
      this.showToast('Showing global result from loaded data.', 'medium');
      return;
    }

    // ── 2. Call API ────────────────────────────────────────────────────────
    this.userLookupLoading = true;
    this.selectedUserGlobalResult = null;

    this.assessmentService.getUserGlobalResultForAdmin(resolvedUserId).subscribe({
      next: (result) => {
        this.selectedUserGlobalResult = this.normalizeResultWithUser(result, resolvedUserId);
        this.userLookupLoading = false;
      },
      error: (err) => {
        this.userLookupLoading = false;
        if (err?.status === 404) {
          this.showToast('No global result found for this user.', 'medium');
          return;
        }
        const status = err?.status ? ` (HTTP ${err.status})` : '';
        this.showToast(`Could not load global result for this user${status}.`, 'danger');
      }
    });
  }

  clearUserGlobalLookup(): void {
    this.adminUserId = '';
    this.selectedUserGlobalResult = null;
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

  private resolveUserInputToId(input: string): string | null {
    const raw = (input || '').trim();
    if (!raw) return null;
    // Exact id map
    if (this.usersById.has(raw)) return raw;
    // Lookup by username/email/lowercase id
    const fromMap = this.usersByLookup.get(raw.toLowerCase());
    if (fromMap?.id) return String(fromMap.id);
    return null;
  }

  private normalizeResultWithUser(result: any, preferredUserId?: string): any {
    const normalized: any = { ...(result || {}) };

    // Stamp preferred userId if nothing resolved yet
    if (preferredUserId && !this.extractUserCandidate(normalized)) {
      normalized.userId = preferredUserId;
    }

    const candidate = this.extractUserCandidate(normalized);
    if (!candidate) return normalized;

    // Try direct id lookup
    const byId = this.usersById.get(String(candidate));
    if (byId) {
      normalized.userId = normalized.userId || byId.id;
      normalized._userName = byId.userName;
      normalized._email = byId.email;
      return normalized;
    }

    // Try username/email lookup
    const byLookup = this.usersByLookup.get(String(candidate).toLowerCase());
    if (byLookup) {
      normalized.userId = normalized.userId || byLookup.id;
      normalized._userName = byLookup.userName;
      normalized._email = byLookup.email;
    }

    return normalized;
  }

  private extractUserCandidate(result: any): string | null {
    const value =
      result?.userId ||
      result?.UserId ||
      result?.applicationUserId ||
      result?.ApplicationUserId ||
      result?.partnerUserId ||
      result?.PartnerUserId ||
      result?.submittedByUserId ||
      result?.SubmittedByUserId ||
      result?.createdByUserId ||
      result?.CreatedByUserId ||
      result?.ownerUserId ||
      result?.OwnerUserId ||
      result?.userName ||
      result?.UserName ||
      result?.email ||
      result?.Email ||
      result?.user?.id ||
      result?.User?.Id ||
      result?.user?.userName ||
      result?.User?.UserName ||
      result?.user?.email ||
      result?.User?.Email;

    if (value == null) return null;
    const str = String(value).trim();
    return str ? str : null;
  }

  /** Returns the best display label for the user column. */
  getResultUserId(result: any): string {
    // Prefer enriched friendly name set by normalizeResultWithUser
    if (result?._userName) return String(result._userName);
    if (result?._email) return String(result._email);

    // Fallback to raw payload fields
    if (result?.userId) return String(result.userId);
    if (result?.UserId) return String(result.UserId);
    if (result?.userName) return String(result.userName);
    if (result?.UserName) return String(result.UserName);
    if (result?.email) return String(result.email);
    if (result?.Email) return String(result.Email);

    const direct =
      result?.userId ||
      result?.UserId ||
      result?.userid ||
      result?.userID ||
      result?.applicationUserId ||
      result?.ApplicationUserId ||
      result?.partnerUserId ||
      result?.PartnerUserId ||
      result?.submittedByUserId ||
      result?.SubmittedByUserId ||
      result?.createdByUserId ||
      result?.CreatedByUserId ||
      result?.ownerUserId ||
      result?.OwnerUserId ||
      result?.userName ||
      result?.UserName ||
      result?.username ||
      result?.email ||
      result?.Email ||
      result?.user?.id ||
      result?.User?.Id ||
      result?.user?.userId ||
      result?.User?.UserId ||
      result?.user?.userName ||
      result?.User?.UserName ||
      result?.user?.email ||
      result?.User?.Email;

    if (direct != null && String(direct).trim() !== '') return String(direct);

    const recursiveValue = this.findFirstUserLikeValue(result, 0);
    if (recursiveValue) return recursiveValue;

    return 'Unknown';
  }

  private findFirstUserLikeValue(node: any, depth: number): string | null {
    if (!node || typeof node !== 'object' || depth > 3) return null;

    for (const [key, value] of Object.entries(node)) {
      const normalized = key.toLowerCase();
      const looksLikeUserKey =
        normalized.includes('userid') ||
        normalized.includes('user_id') ||
        normalized.includes('username') ||
        normalized === 'user' ||
        normalized.includes('email') ||
        normalized.includes('partneruser');

      if (looksLikeUserKey) {
        if (typeof value === 'string' && value.trim() !== '') return value;
        if (typeof value === 'number') return String(value);
      }

      if (value && typeof value === 'object') {
        const nested = this.findFirstUserLikeValue(value, depth + 1);
        if (nested) return nested;
      }
    }

    return null;
  }

  getResultProductId(result: any): string {
    const value = result?.productId ?? result?.ProductId;
    return value == null ? '-' : String(value);
  }

  getResultScoreSummary(result: any): string {
    const score = result?.score ?? result?.Score;
    const total = result?.total ?? result?.Total;
    if (score == null || total == null) return '-';
    return `${score}/${total}`;
  }

  getResultPercentage(result: any): string {
    const value = result?.percentage ?? result?.Percentage;
    return value == null ? '-' : `${value}%`;
  }

  getResultPassed(result: any): string {
    const value = result?.passed ?? result?.Passed;
    if (value == null) return '-';
    return value ? 'Passed' : 'Failed';
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
