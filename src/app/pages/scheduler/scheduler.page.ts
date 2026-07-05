import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import { SchedulerService } from 'src/app/services/scheduler-service';
import {
  ScheduleSmsDto,
  ScheduleWhatsAppDto,
  ScheduleFacebookDto,
  ScheduleEmailDto,
  RescheduleMessageDto,
  PendingSmsItem,
  PendingWhatsAppItem,
  PendingFacebookItem,
  PendingEmailItem,
  ScheduleResult
} from 'src/app/models/dtos/scheduler-dtos.model';
import { Observable, Subscription } from 'rxjs';

type Channel = 'sms' | 'whatsapp' | 'facebook' | 'email';
type Tab = 'schedule' | 'pending';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-scheduler',
  templateUrl: './scheduler.page.html',
  styleUrls: ['./scheduler.page.scss'],
  standalone: false
})
export class SchedulerPage implements OnInit, OnDestroy {
  // Calendar
  currentMonth = new Date();
  selectedDate: Date | null = null;
  calendarDays: CalendarDay[] = [];

  // UI State
  activeTab: Tab = 'schedule';
  activeChannel: Channel = 'sms';

  // Form models
  smsForm: ScheduleSmsDto = { phoneNumber: '', message: '', scheduledAt: '' };
  whatsappForm: ScheduleWhatsAppDto = { phoneNumber: '', message: '', scheduledAt: '' };
  facebookForm: ScheduleFacebookDto = { recipientId: '', message: '', scheduledAt: '' };
  emailForm: ScheduleEmailDto = { recipientEmail: '', recipientName: '', subject: '', body: '', scheduledAt: '' };

  loading = false;
  submitting = false;

  // Pending messages
  pendingSms: PendingSmsItem[] = [];
  pendingWhatsApp: PendingWhatsAppItem[] = [];
  pendingFacebook: PendingFacebookItem[] = [];
  pendingEmails: PendingEmailItem[] = [];

  private subs = new Subscription();

  constructor(
    private schedulerService: SchedulerService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit(): void {
    this.generateCalendar();
    this.loadPending();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // Calendar methods
  get monthLabel(): string {
    return this.currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  prevMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.generateCalendar();
  }

  selectDate(day: CalendarDay): void {
    if (!day.isCurrentMonth) return;
    this.selectedDate = day.date;
    this.generateCalendar();
    const iso = this.toLocalIsoDate(day.date);
    this.smsForm.scheduledAt = iso;
    this.whatsappForm.scheduledAt = iso;
    this.facebookForm.scheduledAt = iso;
    this.emailForm.scheduledAt = iso;
  }

  private generateCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: CalendarDay[] = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push(this.buildDay(d, false, today));
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push(this.buildDay(d, true, today));
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push(this.buildDay(d, false, today));
    }

    this.calendarDays = days;
  }

  private buildDay(d: Date, isCurrentMonth: boolean, today: Date): CalendarDay {
    const dd = new Date(d);
    dd.setHours(0, 0, 0, 0);
    return {
      date: dd,
      dayNumber: d.getDate(),
      isCurrentMonth,
      isToday: dd.getTime() === today.getTime(),
      isSelected: this.selectedDate ? dd.getTime() === this.selectedDate.getTime() : false
    };
  }

  private toLocalIsoDate(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  // Tab/channel helpers
  setTab(tab: Tab): void {
    this.activeTab = tab;
    if (tab === 'pending') {
      this.loadPending();
    }
  }

  setChannel(channel: Channel): void {
    this.activeChannel = channel;
  }

  // Submit handlers
  async submitSms(): Promise<void> {
    if (!this.smsForm.phoneNumber || !this.smsForm.message || !this.smsForm.scheduledAt) {
      this.showToast('Please fill in all SMS fields and select a date.', 'danger');
      return;
    }
    await this.runRequest(this.schedulerService.scheduleSms(this.smsForm), 'SMS scheduled successfully.', 'SMS');
  }

  async submitWhatsApp(): Promise<void> {
    if (!this.whatsappForm.phoneNumber || !this.whatsappForm.message || !this.whatsappForm.scheduledAt) {
      this.showToast('Please fill in all WhatsApp fields and select a date.', 'danger');
      return;
    }
    await this.runRequest(this.schedulerService.scheduleWhatsApp(this.whatsappForm), 'WhatsApp message scheduled successfully.', 'WhatsApp');
  }

  async submitFacebook(): Promise<void> {
    if (!this.facebookForm.recipientId || !this.facebookForm.message || !this.facebookForm.scheduledAt) {
      this.showToast('Please fill in all Facebook fields and select a date.', 'danger');
      return;
    }
    await this.runRequest(this.schedulerService.scheduleFacebook(this.facebookForm), 'Facebook message scheduled successfully.', 'Facebook');
  }

  async submitEmail(): Promise<void> {
    if (!this.emailForm.recipientEmail || !this.emailForm.subject || !this.emailForm.body || !this.emailForm.scheduledAt) {
      this.showToast('Please fill in all Email fields and select a date.', 'danger');
      return;
    }
    await this.runRequest(this.schedulerService.scheduleEmail(this.emailForm), 'Email scheduled successfully.', 'Email');
  }

  private runRequest(obs: Observable<ScheduleResult>, successMsg: string, label: string): void {
    this.submitting = true;
    const s = obs.subscribe({
      next: (res) => {
        this.submitting = false;
        this.showToast(`${successMsg} (ID: ${res.id})`, 'success');
        this.resetChannelForm(this.activeChannel);
        this.loadPending();
      },
      error: (err: any) => {
        this.submitting = false;
        const msg = err?.error?.error || `Failed to schedule ${label}.`;
        this.showToast(msg, 'danger');
      }
    });
    this.subs.add(s);
  }

  // Pending messages
  loadPending(): void {
    this.loading = true;
    this.subs.add(
      this.schedulerService.getPendingSms().subscribe({
        next: (data: any) => { this.pendingSms = data.messages || []; },
        complete: () => { this.loading = false; }
      })
    );
    this.subs.add(
      this.schedulerService.getPendingWhatsApp().subscribe({
        next: (data: any) => { this.pendingWhatsApp = data.messages || []; },
        complete: () => { this.loading = false; }
      })
    );
    this.subs.add(
      this.schedulerService.getPendingFacebook().subscribe({
        next: (data: any) => { this.pendingFacebook = data.messages || []; },
        complete: () => { this.loading = false; }
      })
    );
    this.subs.add(
      this.schedulerService.getPendingEmails().subscribe({
        next: (data: any) => { this.pendingEmails = data.messages || []; },
        complete: () => { this.loading = false; }
      })
    );
  }

  refreshPending(): void {
    this.loadPending();
  }

  // Reschedule / Cancel
  async reschedule(id: number, type: Channel): Promise<void> {
    const input = await this.promptNewDateTime('Reschedule', 'Select new date and time (UTC):');
    if (!input) return;
    let obs: Observable<{ message: string }>;
    switch (type) {
      case 'sms': obs = this.schedulerService.rescheduleSms(id, input); break;
      case 'whatsapp': obs = this.schedulerService.rescheduleWhatsApp(id, input); break;
      case 'facebook': obs = this.schedulerService.rescheduleFacebook(id, input); break;
      case 'email': obs = this.schedulerService.rescheduleEmail(id, input); break;
      default: return;
    }
    this.subs.add(
      obs.subscribe({
        next: () => {
          this.showToast('Rescheduled successfully.', 'success');
          this.refreshPending();
        },
        error: (err: any) => {
          this.showToast(err?.error?.error || 'Failed to reschedule.', 'danger');
        }
      })
    );
  }

  async cancel(id: number, type: Channel): Promise<void> {
    const confirmed = await this.confirm(`Cancel this ${type} message?`);
    if (!confirmed) return;
    let obs: Observable<{ message: string }>;
    switch (type) {
      case 'sms': obs = this.schedulerService.cancelScheduledSms(id); break;
      case 'whatsapp': obs = this.schedulerService.cancelScheduledWhatsApp(id); break;
      case 'facebook': obs = this.schedulerService.cancelScheduledFacebook(id); break;
      case 'email': obs = this.schedulerService.cancelScheduledEmail(id); break;
      default: return;
    }
    this.subs.add(
      obs.subscribe({
        next: () => {
          this.showToast('Cancelled successfully.', 'success');
          this.refreshPending();
        },
        error: (err: any) => {
          this.showToast(err?.error?.error || 'Failed to cancel.', 'danger');
        }
      })
    );
  }

  // Helpers
  private resetChannelForm(channel: Channel): void {
    switch (channel) {
      case 'sms':
        this.smsForm = { phoneNumber: '', message: '', scheduledAt: this.smsForm.scheduledAt };
        break;
      case 'whatsapp':
        this.whatsappForm = { phoneNumber: '', message: '', scheduledAt: this.whatsappForm.scheduledAt };
        break;
      case 'facebook':
        this.facebookForm = { recipientId: '', message: '', scheduledAt: this.facebookForm.scheduledAt };
        break;
      case 'email':
        this.emailForm = { recipientEmail: '', recipientName: '', subject: '', body: '', scheduledAt: this.emailForm.scheduledAt };
        break;
    }
  }

  private async showToast(message: string, color: 'success' | 'danger'): Promise<void> {
    const toast = await this.toastController.create({ message, duration: 3000, color });
    await toast.present();
  }

  private async confirm(message: string): Promise<boolean> {
    const alert = await this.alertController.create({
      header: 'Confirm',
      message,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'OK', handler: () => true }
      ]
    });
    await alert.present();
    const result = await alert.onDidDismiss();
    return result.role !== 'cancel';
  }

  private promptNewDateTime(title: string, message: string): Promise<string | null> {
    return new Promise<string | null>((resolve) => {
      this.alertController.create({
        header: title,
        message,
        inputs: [
          {
            name: 'datetime',
            type: 'datetime-local',
            min: new Date().toISOString().slice(0, 16)
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => { resolve(null); }
          },
          {
            text: 'OK',
            handler: (data: any) => {
              if (data && data.datetime) {
                resolve(new Date(data.datetime).toISOString());
              } else {
                resolve(null);
              }
            }
          }
        ]
      }).then((alert: any) => {
        alert.present();
        alert.onDidDismiss().then((res: any) => {
          if (res.role === 'cancel') {
            resolve(null);
          } else if (res.data && res.data.datetime) {
            resolve(new Date(res.data.datetime).toISOString());
          } else {
            resolve(null);
          }
        });
      }).catch(() => resolve(null));
    });
  }
}