import { Component } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';
import { AdminPayrollService } from 'src/app/services/admin-payroll-service';

@Component({
  selector: 'app-admin-payroll',
  templateUrl: './admin-payroll.page.html',
  styleUrls: ['./admin-payroll.page.scss'],
  standalone: false
})
export class AdminPayrollPage {
  generating = false;
  lastDownloadUrl: string | null = null;
  lastGeneratedAt: Date | null = null;

  constructor(
    private payrollService: AdminPayrollService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  get currentMonth(): string {
    return new Date().toLocaleString('en-ZA', { month: 'long', year: 'numeric' });
  }

  async confirmGenerate(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Generate Payroll?',
      message: `This will compute monthly commissions, create a CSV report, and send email notifications to all admins and sales reps. Continue?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Generate', handler: () => this.generateReport() }
      ]
    });
    await alert.present();
  }

  generateReport(): void {
    this.generating = true;
    this.payrollService.generateMonthlyReport().subscribe({
      next: res => {
        if (!res || !res.downloadUrl) {
          this.generating = false;
          this.showToast('No payout data found for this period.', 'warning');
          return;
        }
        // Extract just the filename from the backend URL and use the service's own apiUrl
        const segments = res.downloadUrl.split('/');
        const fileName = segments[segments.length - 1];
        this.lastDownloadUrl = fileName;
        this.lastGeneratedAt = new Date();
        this.generating = false;
        this.showToast('Payroll report generated and notifications sent.', 'success');
      },
      error: err => {
        this.generating = false;
        if (err.status === 204) {
          this.showToast('No payout data found for this period.', 'warning');
        } else {
          this.showToast('Could not generate payroll report.', 'danger');
        }
      }
    });
  }

  downloadReport(): void {
    if (!this.lastDownloadUrl) return;
    this.payrollService.downloadReport(this.lastDownloadUrl).subscribe({
      next: response => {
        const blob = response.body;
        if (!blob) {
          this.showToast('Download failed: empty response.', 'danger');
          return;
        }
        const disposition = response.headers.get('Content-Disposition');
        const match = disposition?.match(/filename="?(.+?)"?$/i);
        const fileName = match?.[1] || 'payroll-report.csv';
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.showToast('Could not download report.', 'danger');
      }
    });
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastController.create({ message, color, duration: 3000, position: 'bottom' });
    await toast.present();
  }
}
