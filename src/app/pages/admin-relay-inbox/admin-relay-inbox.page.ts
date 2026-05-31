import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { RelayService } from 'src/app/services/relay-service';
import { RelayEmailReplyDto } from 'src/app/models/dtos/relay-dto.model';

type ContactStatusOption = 'Reached' | 'FollowUp' | 'Converted' | 'Active' | 'Deactivated';

@Component({
  selector: 'app-admin-relay-inbox',
  templateUrl: './admin-relay-inbox.page.html',
  styleUrls: ['./admin-relay-inbox.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class AdminRelayInboxPage implements OnInit {
  loading = false;
  syncing = false;
  upsertingContact = false;

  unreadReplies: RelayEmailReplyDto[] = [];
  selectedReplyId: number | null = null;
  selectedReplyContactStatus: ContactStatusOption = 'Active';

  readonly contactStatusOptions: ContactStatusOption[] = [
    'Reached',
    'FollowUp',
    'Converted',
    'Active',
    'Deactivated',
  ];

  constructor(
    private relayService: RelayService,
    private toastController: ToastController
  ) {}

  ngOnInit(): void {
    this.loadUnreadReplies();
  }

  refresh(event: any): void {
    this.loadUnreadReplies(event);
  }

  loadUnreadReplies(event?: any): void {
    this.loading = true;

    this.relayService.getUnreadReplies().subscribe({
      next: (replies) => {
        this.unreadReplies = replies || [];

        if (
          this.selectedReplyId &&
          !this.unreadReplies.some((reply) => reply.id === this.selectedReplyId)
        ) {
          this.selectedReplyId = null;
        }

        if (!this.selectedReplyId && this.unreadReplies[0]?.id) {
          this.selectedReplyId = this.unreadReplies[0].id;
        }

        this.loading = false;
        if (event) event.target.complete();
      },
      error: async (err) => {
        this.loading = false;
        if (event) event.target.complete();
        await this.showToast(err?.error?.error || 'Could not load unread replies.', 'danger');
      },
    });
  }

  syncAllReplies(): void {
    this.syncing = true;

    this.relayService.syncAllEmailReplies(50).subscribe({
      next: async (message) => {
        this.syncing = false;
        await this.showToast(message || 'Sync completed.', 'success');
        this.loadUnreadReplies();
      },
      error: async (err) => {
        this.syncing = false;
        await this.showToast(err?.error?.error || 'Could not sync replies.', 'danger');
      },
    });
  }

  upsertContactFromSelectedReply(): void {
    if (!this.selectedReplyId) {
      return;
    }

    this.upsertingContact = true;
    const replyId = this.selectedReplyId;

    this.relayService
      .upsertContactFromReply(replyId, this.selectedReplyContactStatus)
      .subscribe({
        next: async (result) => {
          this.upsertingContact = false;
          await this.showToast(
            result?.contact?.email
              ? `Contact upserted: ${result.contact.email}`
              : 'Contact upserted successfully.',
            'success'
          );

          this.unreadReplies = this.unreadReplies.filter((reply) => reply.id !== replyId);
          this.selectedReplyId = this.unreadReplies[0]?.id ?? null;
        },
        error: async (err) => {
          this.upsertingContact = false;
          await this.showToast(err?.error?.error || 'Failed to upsert contact from reply.', 'danger');
        },
      });
  }

  get selectedReply(): RelayEmailReplyDto | null {
    if (!this.selectedReplyId) {
      return null;
    }
    return this.unreadReplies.find((reply) => reply.id === this.selectedReplyId) || null;
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 2200,
      position: 'top',
    });
    await toast.present();
  }
}
