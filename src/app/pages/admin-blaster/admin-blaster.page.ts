import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { AdminBlasterService } from 'src/app/services/admin-blaster-service';
import { AdminUserService } from 'src/app/services/admin-user-service';
import { AiService, AiMessage } from 'src/app/services/ai.service';
import { ApplicationUser } from 'src/app/models/entities/application-user.model';
import { EmailDto } from 'src/app/models/dtos/email-dto.model';
import { TwilioFacebookDto } from 'src/app/models/dtos/twilio-facebook-dto.model';
import { TwilioSmsDto } from 'src/app/models/dtos/twilio-sms-dto.model';
import { TwilioWhatsAppDto } from 'src/app/models/dtos/twilio-whatsapp-dto.model';

type MessageChannel = 'email' | 'sms' | 'whatsapp' | 'facebook';

interface ChannelOption {
  value: MessageChannel;
  label: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-admin-blaster',
  templateUrl: './admin-blaster.page.html',
  styleUrls: ['./admin-blaster.page.scss'],
  standalone: false
})
export class AdminBlasterPage implements OnInit {
  @ViewChild('aiMsgContainer') aiMsgContainer!: ElementRef;

  readonly channelOptions: ChannelOption[] = [
    { value: 'email', label: 'Email', description: 'Uses each user\'s email address.', icon: 'mail-outline' },
    { value: 'sms', label: 'SMS', description: 'Uses each user\'s mobile number.', icon: 'chatbubble-outline' },
    { value: 'whatsapp', label: 'WhatsApp', description: 'Uses each user\'s mobile number.', icon: 'logo-whatsapp' },
    { value: 'facebook', label: 'Facebook', description: 'Uses each user\'s Messenger recipient ID.', icon: 'logo-facebook' }
  ];

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
    private messagingService: AdminBlasterService,
    private userService: AdminUserService,
    private aiService: AiService,
    private toastController: ToastController
  ) {
    this.composeForm = this.fb.group({
      channel: ['email', Validators.required],
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
    this.composeForm.get('channel')?.valueChanges.subscribe(channel => {
      this.updateSubjectValidators((channel as MessageChannel) || 'email');
    });
  }

  getInitials(name: string): string {
    const parts = name.split(/[\s@._-]+/).filter(Boolean);
    return (parts[0]?.charAt(0) ?? '').toUpperCase() + (parts[1]?.charAt(0) ?? '').toUpperCase() || '?';
  }

  get searchTerm(): string {
    return (this.searchForm.get('search')?.value || '').trim().toLowerCase();
  }

  get selectedChannel(): MessageChannel {
    return (this.composeForm.get('channel')?.value as MessageChannel) || 'email';
  }

  get requiresSubject(): boolean {
    return this.selectedChannel === 'email';
  }

  get channelLabel(): string {
    return this.getChannelOption(this.selectedChannel).label;
  }

  get channelDescription(): string {
    return this.getChannelOption(this.selectedChannel).description;
  }

  get channelIcon(): string {
    return this.getChannelOption(this.selectedChannel).icon;
  }

  get messagePrompt(): string {
    return this.requiresSubject ? 'Write your email message here...' : `Write your ${this.channelLabel.toLowerCase()} message here...`;
  }

  get missingChannelTargetCount(): number {
    return this.getUsersMissingChannelTarget(this.selectedChannel).length;
  }

  get sendButtonLabel(): string {
    return this.sending ? 'Sending...' : `Send ${this.channelLabel} Blast`;
  }

  get summaryLabel(): string {
    return `Sending ${this.channelLabel.toLowerCase()} to`;
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
      const haystack = [u.userName, u.email, u.id, u.phoneNumber, u.facebookRecipientId, u.messengerRecipientId, u.recipientId]
        .filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(term);
    });
  }

  send(): void {
    if (this.composeForm.invalid || this.selectedUsers.length === 0) return;

    const missingTargets = this.getUsersMissingChannelTarget(this.selectedChannel);
    if (missingTargets.length > 0) {
      const label = this.selectedChannel === 'facebook' ? 'Messenger recipient ID' : this.selectedChannel === 'email' ? 'email address' : 'phone number';
      this.showToast(`${missingTargets.length} selected user(s) are missing a ${label}.`, 'warning');
      return;
    }

    const { subject, body } = this.composeForm.value;

    this.sending = true;
    this.getSendRequest(subject, body).subscribe({
      next: res => {
        this.showToast(res.message, 'success');
        this.selectedUsers = [];
        this.composeForm.reset({ channel: this.selectedChannel, subject: '', body: '' });
        this.sending = false;
        this.showPreview = false;
      },
      error: () => {
        this.showToast(`Failed to send ${this.channelLabel.toLowerCase()} messages. Please try again.`, 'danger');
        this.sending = false;
      }
    });
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({ message, color, duration: 3000, position: 'top' });
    await toast.present();
  }

  getRecipientDisplay(user: ApplicationUser): string {
    const target = this.getChannelTarget(user, this.selectedChannel);
    if (target) {
      return target;
    }

    if (this.selectedChannel === 'facebook') {
      return 'Missing Messenger recipient ID';
    }

    if (this.selectedChannel === 'email') {
      return 'Missing email address';
    }

    return 'Missing phone number';
  }

  private getSendRequest(subject: string, body: string) {
    switch (this.selectedChannel) {
      case 'sms': {
        const messages: TwilioSmsDto[] = this.selectedUsers.map(u => ({
          phoneNumber: u.phoneNumber!,
          message: body
        }));
        return this.messagingService.sendBulkSms(messages);
      }
      case 'whatsapp': {
        const messages: TwilioWhatsAppDto[] = this.selectedUsers.map(u => ({
          phoneNumber: u.phoneNumber!,
          message: body
        }));
        return this.messagingService.sendBulkWhatsApp(messages);
      }
      case 'facebook': {
        const messages: TwilioFacebookDto[] = this.selectedUsers.map(u => ({
          recipientId: this.getFacebookRecipientId(u)!,
          message: body
        }));
        return this.messagingService.sendBulkFacebook(messages);
      }
      case 'email':
      default: {
        const emails: EmailDto[] = this.selectedUsers.map(u => ({
          subject,
          body,
          recipientEmail: u.email,
          recipientName: u.userName
        }));
        return this.messagingService.sendBulkEmails(emails);
      }
    }
  }

  private getUsersMissingChannelTarget(channel: MessageChannel): ApplicationUser[] {
    return this.selectedUsers.filter(user => !this.getChannelTarget(user, channel));
  }

  private getChannelTarget(user: ApplicationUser, channel: MessageChannel): string | undefined {
    switch (channel) {
      case 'email':
        return user.email?.trim() || undefined;
      case 'sms':
      case 'whatsapp':
        return user.phoneNumber?.trim() || undefined;
      case 'facebook':
        return this.getFacebookRecipientId(user);
      default:
        return undefined;
    }
  }

  private getFacebookRecipientId(user: ApplicationUser): string | undefined {
    return user.facebookRecipientId?.trim() || user.messengerRecipientId?.trim() || user.recipientId?.trim() || undefined;
  }

  private getChannelOption(channel: MessageChannel): ChannelOption {
    return this.channelOptions.find(option => option.value === channel) ?? this.channelOptions[0];
  }

  private updateSubjectValidators(channel: MessageChannel): void {
    const subjectControl = this.composeForm.get('subject');
    if (!subjectControl) {
      return;
    }

    if (channel === 'email') {
      subjectControl.setValidators([Validators.required]);
    } else {
      subjectControl.clearValidators();
      subjectControl.setValue('');
    }

    subjectControl.updateValueAndValidity({ emitEvent: false });
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

    this.aiService.generateBlasterDraft(this.selectedChannel, text).subscribe({
      next: response => {
        const parsed = this.parseDraft(response);
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

  private parseDraft(text: string): { subject?: string; body?: string } {
    const match = text.match(/^Subject:\s*(.+)$/im);
    if (!match) {
      return { body: text.trim() || undefined };
    }
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