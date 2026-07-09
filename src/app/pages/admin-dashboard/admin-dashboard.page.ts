import { Component, OnInit } from '@angular/core';
import { AdminUserService } from 'src/app/services/admin-user-service';
import { AdminInvoiceService } from 'src/app/services/admin-invoice-service';
import { AdminClientService } from 'src/app/services/admin-client-service';
import { MeetingService } from 'src/app/services/meeting-service';
import { LeadlakeService } from 'src/app/services/leadlake-service';
import { RelayService } from 'src/app/services/relay-service';
import { AdminPayrollService } from 'src/app/services/admin-payroll-service';
import { LeadLake, LeadLakeIndustry } from 'src/app/models/entities/leadlake.model';
import { Invoice } from 'src/app/models/entities/invoice.model';
import { MeetingDto } from 'src/app/models/dtos/meeting-dto.model';
import { Contact } from 'src/app/models/entities/contact.model';
import { ApplicationUser } from 'src/app/models/entities/application-user.model';
import { OverallStatisticsDto } from 'src/app/models/dtos/relay-dto.model';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  standalone: false
})
export class AdminDashboardPage implements OnInit {
  loading: boolean = true;

  // Users
  totalUsers: number = 0;
  activeUsers: number = 0;
  bannedUsers: number = 0;

  // Clients
  totalClients: number = 0;

  // Meetings
  totalMeetings: number = 0;
  meetingTypeBreakdown: { label: string; value: number }[] = [];

  // Invoices
  totalInvoices: number = 0;
  totalRevenue: number = 0;
  paidInvoices: number = 0;
  unpaidInvoices: number = 0;
  invoiceMonthSeries: { month: string; total: number; paid: number; unpaid: number }[] = [];

  // LeadLake
  totalLeads: number = 0;
  leadIndustryBreakdown: { label: string; value: number }[] = [];
  leadIntentBreakdown: { label: string; value: number }[] = [];

  // Relay
  totalRelayCampaigns: number = 0;
  activeRelayCampaigns: number = 0;
  totalEmailsSent: number = 0;
  totalEmailsOpened: number = 0;
  totalEmailsClicked: number = 0;
  totalEmailsReplied: number = 0;
  relayOpenRate: number = 0;
  relayClickRate: number = 0;
  relayReplyRate: number = 0;
  totalRelayAccounts: number = 0;
  healthyRelayAccounts: number = 0;

  // Payroll
  payrollReportCount: number = 0;
  payrollGeneratedAt?: string;

  constructor(
    private userService: AdminUserService,
    private invoiceService: AdminInvoiceService,
    private clientService: AdminClientService,
    private meetingService: MeetingService,
    private leadlakeService: LeadlakeService,
    private relayService: RelayService,
    private payrollService: AdminPayrollService
  ) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loading = true;

    this.userService.getAll().subscribe({
      next: (users: ApplicationUser[]) => {
        this.totalUsers = users.length;
        this.activeUsers = users.filter(u => !u.isBanned).length;
        this.bannedUsers = users.filter(u => u.isBanned).length;
      },
      error: (err) => console.error('Error loading users:', err)
    });

    this.clientService.getAll().subscribe({
      next: (result) => {
        this.totalClients = result.items?.length || 0;
      },
      error: (err) => console.error('Error loading clients:', err)
    });

    this.meetingService.getAllMeetings().subscribe({
      next: (result) => {
        const meetings: MeetingDto[] = result.items || [];
        this.totalMeetings = meetings.length;
        const typeMap = new Map<string, number>();
        meetings.forEach(m => {
          const kind = 'Meeting';
          typeMap.set(kind, (typeMap.get(kind) || 0) + 1);
        });
        this.meetingTypeBreakdown = Array.from(typeMap.entries()).map(([label, value]) => ({ label, value }));
      },
      error: (err) => console.error('Error loading meetings:', err)
    });

    this.invoiceService.getAll().subscribe({
      next: (invoices: Invoice[]) => {
        this.totalInvoices = invoices.length;
        this.paidInvoices = invoices.filter(inv => inv.isPaid).length;
        this.unpaidInvoices = invoices.filter(inv => !inv.isPaid).length;
        this.totalRevenue = invoices.filter(inv => inv.isPaid).reduce((sum, inv) => sum + inv.amount, 0);

        const monthMap = new Map<string, { total: number; paid: number; unpaid: number }>();
        invoices.forEach(inv => {
          const key = inv.issuedAt ? inv.issuedAt.substring(0, 7) : 'Unknown';
          const current = monthMap.get(key) || { total: 0, paid: 0, unpaid: 0 };
          current.total += 1;
          if (inv.isPaid) current.paid += 1; else current.unpaid += 1;
          monthMap.set(key, current);
        });
        this.invoiceMonthSeries = Array.from(monthMap.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .slice(-6)
          .map(([month, values]) => ({ month, ...values }));
      },
      error: (err) => console.error('Error loading invoices:', err)
    });

    this.leadlakeService.getAll().subscribe({
      next: (leads: LeadLake[]) => {
        this.totalLeads = leads.length;
        const industryMap = new Map<string, number>();
        const intentMap = new Map<string, number>();
        leads.forEach(lead => {
          const industry = typeof lead.industry === 'string' ? lead.industry : LeadLakeIndustry[lead.industry] || 'Unknown';
          const intent = typeof lead.intent === 'string' ? lead.intent : 'Unknown';
          industryMap.set(industry, (industryMap.get(industry) || 0) + 1);
          if (intent) intentMap.set(intent, (intentMap.get(intent) || 0) + 1);
        });
        this.leadIndustryBreakdown = this.topEntries(industryMap, 6);
        this.leadIntentBreakdown = this.topEntries(intentMap, 6);
      },
      error: (err) => console.error('Error loading leads:', err)
    });

    this.relayService.getOverallStatistics().subscribe({
      next: (stats: OverallStatisticsDto) => {
        this.totalRelayCampaigns = stats.totalCampaigns || 0;
        this.activeRelayCampaigns = stats.activeCampaigns || 0;
        this.totalEmailsSent = stats.totalEmailsSent || 0;
        this.totalEmailsOpened = stats.totalOpened || 0;
        this.totalEmailsClicked = stats.totalClicked || 0;
        this.totalEmailsReplied = stats.totalReplied || 0;
        this.relayOpenRate = stats.overallOpenRate || 0;
        this.relayClickRate = stats.overallClickRate || 0;
        this.relayReplyRate = stats.overallReplyRate || 0;
      },
      error: (err) => console.error('Error loading relay stats:', err)
    });

    this.relayService.getRelayAccounts().subscribe({
      next: (accounts) => {
        this.totalRelayAccounts = accounts.length;
        const healthValues = accounts.map(a => String(a.healthStatus));
        this.healthyRelayAccounts = accounts.filter(a => {
          const hs = String(a.healthStatus);
          return hs === '1' || hs.toLowerCase() === 'healthy';
        }).length;
      },
      error: (err) => console.error('Error loading relay accounts:', err)
    });

    this.payrollService.generateMonthlyReport().subscribe({
      next: (res: any) => {
        this.payrollReportCount = typeof res?.generatedCount === 'number' ? res.generatedCount : (typeof res?.count === 'number' ? res.count : 0);
        this.payrollGeneratedAt = typeof res?.generatedAt === 'string' ? res.generatedAt : undefined;
      },
      error: (err) => console.error('Error generating payroll summary:', err)
    });

    setTimeout(() => {
      this.loading = false;
    }, 500);
  }

  private topEntries(map: Map<string, number>, limit: number): { label: string; value: number }[] {
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([label, value]) => ({ label, value }));
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
  }

  get usersPercent(): number { return this.totalUsers ? 100 : 0; }
  get clientsPercent(): number { return this.totalClients ? 100 : 0; }
  get meetingsPercent(): number { return this.totalMeetings ? 100 : 0; }
  get invoicesPercent(): number { return this.totalInvoices ? 100 : 0; }
  get leadsPercent(): number { return this.totalLeads ? 100 : 0; }

  get donutBackground(): string {
    if (this.totalInvoices <= 0) {
      return 'conic-gradient(#607078 0% 100%)';
    }
    const paid = this.paidInvoices;
    const unpaid = this.unpaidInvoices;
    const paidPercent = (paid / (paid + unpaid)) * 100;
    return 'conic-gradient(#27ae60 0% ' + paidPercent.toFixed(2) + '%, #c44536 ' + paidPercent.toFixed(2) + '% 100%)';
  }

  getLeadPercent(value: number, data: { label: string; value: number }[]): number {
    const max = data.length ? Math.max(...data.map(d => d.value)) : 1;
    return Number(((value / max) * 100).toFixed(2));
  }

  getMonthPercent(value: number, data: { month: string; total: number; paid: number; unpaid: number }[]): number {
    const max = data.length ? Math.max(...data.map(d => Math.max(d.paid, d.unpaid))) : 1;
    return Number(((value / max) * 100).toFixed(2));
  }

  getEmailPercent(value: number): number {
    const max = Math.max(this.totalEmailsSent, 1);
    return Number(((value / max) * 100).toFixed(2));
  }

  getCampaignPercent(active: number): number {
    const max = Math.max(this.totalRelayCampaigns, 1);
    return Number(((active / max) * 100).toFixed(2));
  }

  getAccountHealthPercent(): number {
    const max = Math.max(this.totalRelayAccounts, 1);
    return Number(((this.healthyRelayAccounts / max) * 100).toFixed(2));
  }

  getGaugeBackground(value: number): string {
    const pct = Math.min(100, Math.max(0, value));
    return 'conic-gradient(#27ae60 0% ' + pct.toFixed(2) + '%, #e9ecef ' + pct.toFixed(2) + '% 100%)';
  }
}
