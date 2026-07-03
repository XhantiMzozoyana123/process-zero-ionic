import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { EmailBlasterService } from 'src/app/services/email-blaster-service';
import { AdminUserService } from 'src/app/services/admin-user-service';
import { AiService, AiMessage } from 'src/app/services/ai.service';
import { ApplicationUser } from 'src/app/models/entities/application-user.model';
import { EmailDto } from 'src/app/models/dtos/email-dto.model';

@Component({
  selector: 'app-admin-email-blaster',
  templateUrl: './admin-email-blaster.page.html',
  styleUrls: ['./admin-email-blaster.page.scss'],
  standalone: false
})
export class AdminEmailBlasterPage implements OnInit {
  @ViewChild('aiMsgContainer') aiMsgContainer!: ElementRef;

  composeForm: FormGroup;
  searchForm: FormGroup;

  allUsers: ApplicationUser[] = [];
  filteredUsers: ApplicationUser[] = [];
  selectedUsers: ApplicationUser[] = [];

  loadingUsers = false;
  sending = false;
  showPreview = false;

  // AI Assistant
  aiPanelOpen = false;
  aiMessages: AiMessage[] = [];
  aiInput = '';
  aiThinking = false;

  constructor(
    private fb: FormBuilder,
    private emailBlasterService: EmailBlasterService,
    private userService: AdminUserService,
    private aiService: AiService,
    private toastController: ToastController
  ) {
    this.composeForm = this.fb.group({
      subject: ['', Validators.required],
      body: ['', Validators.required]
    });

    this.searchForm = this.fb.group({
      search: ['']
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.searchForm.get('search')?.valueChanges.subscribe(() => this.filterUsers());
  }

  getInitials(name: string): string {
    const parts = name.split(/[\s@._-]+/).filter(Boolean);
    return (parts[0]?.charAt(0) ?? '').toUpperCase() + (parts[1]?.charAt(0) ?? '').toUpperCase() || '?';
  }

  get searchTerm(): string {
    return (this.searchForm.get('search')?.value || '').trim().toLowerCase();
  }

  isSelected(user: ApplicationUser): boolean {
    return this.selectedUsers.some(u => u.id === user.id);
  }

  toggleUser(user: ApplicationUser): void {
    const idx = this.selectedUsers.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      this.selectedUsers.splice(idx, 1);
    } else {
      this.selectedUsers.push(user);
    }
    this.selectedUsers = [...this.selectedUsers];
  }

  selectAllFiltered(): void {
    this.filteredUsers.forEach(u => {
      if (!this.isSelected(u)) {
        this.selectedUsers.push(u);
      }
    });
    this.selectedUsers = [...this.selectedUsers];
  }

  deselectAll(): void {
    this.selectedUsers = [];
  }

  removeUser(index: number): void {
    this.selectedUsers.splice(index, 1);
    this.selectedUsers = [...this.selectedUsers];
  }

  loadUsers(): void {
    this.loadingUsers = true;
    this.userService.getAll().subscribe({
      next: users => {
        this.allUsers = users;
        this.filterUsers();
        this.loadingUsers = false;
      },
      error: () => {
        this.showToast('Could not load users.', 'danger');
        this.loadingUsers = false;
      }
    });
  }

  private filterUsers(): void {
    const term = this.searchTerm;
    if (!term) {
      this.filteredUsers = [...this.allUsers];
      return;
    }
    this.filteredUsers = this.allUsers.filter(u => {
      const haystack = [u.userName, u.email, u.id, u.phoneNumber]
        .filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(term);
    });
  }

  send(): void {
    if (this.composeForm.invalid || this.selectedUsers.length === 0) return;

    const { subject, body } = this.composeForm.value;
    const emails: EmailDto[] = this.selectedUsers.map(u => ({
      subject,
      body,
      recipientEmail: u.email,
      recipientName: u.userName
    }));

    this.sending = true;
    this.emailBlasterService.sendBulkToUsers(emails).subscribe({
      next: res => {
        this.showToast(res.message, 'success');
        this.selectedUsers = [];
        this.composeForm.reset();
        this.sending = false;
        this.showPreview = false;
      },
      error: () => {
        this.showToast('Failed to send emails. Please try again.', 'danger');
        this.sending = false;
      }
    });
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({ message, color, duration: 3000, position: 'top' });
    await toast.present();
  }

  // ── AI Assistant ──────────────────────────────────────────────────────────

  toggleAi(): void {
    this.aiPanelOpen = !this.aiPanelOpen;
  }

  sendAiMessage(): void {
    const text = this.aiInput.trim();
    if (!text || this.aiThinking) return;
    this.aiMessages.push({ role: 'user', text });
    this.aiInput = '';
    this.aiThinking = true;
    this.scrollAiToBottom();

    this.aiService.generate(text).subscribe({
      next: response => {
        const parsed = this.parseEmailDraft(response);
        this.aiMessages.push({ role: 'assistant', text: response, ...parsed });
        this.aiThinking = false;
        this.scrollAiToBottom();
      },
      error: () => {
        this.aiMessages.push({
          role: 'assistant',
          text: 'Could not reach the AI server. Please check the connection and try again.'
        });
        this.aiThinking = false;
        this.scrollAiToBottom();
      }
    });
  }

  private parseEmailDraft(text: string): { subject?: string; body?: string } {
    const match = text.match(/^Subject:\s*(.+)$/im);
    if (!match) return {};
    const subject = match[1].trim();
    const body = text.replace(/^Subject:\s*.+(\r?\n)+/im, '').trim();
    return { subject, body: body || undefined };
  }

  applySubject(subject: string): void {
    this.composeForm.patchValue({ subject });
    this.showToast('Subject applied.', 'success');
  }

  applyBody(body: string): void {
    this.composeForm.patchValue({ body });
    this.showToast('Body applied.', 'success');
  }

  applyDraft(subject: string, body: string): void {
    this.composeForm.patchValue({ subject, body });
    this.showToast('Full draft applied to compose form.', 'success');
  }

  private scrollAiToBottom(): void {
    setTimeout(() => {
      const el = this.aiMsgContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 60);
  }
}