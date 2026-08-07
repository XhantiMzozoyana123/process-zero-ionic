import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminPage } from './admin.page';
import { AdminGuard } from 'src/app/guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminPage,
    canActivateChild: [AdminGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('../admin-dashboard/admin-dashboard.module')
          .then(m => m.AdminDashboardPageModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'blaster',
        loadChildren: () => import('../blaster/blaster.module')
          .then(m => m.BlasterPageModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'products',
        loadChildren: () => import('../admin-products/admin-products.module')
          .then(m => m.AdminProductsPageModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'videos',
        loadChildren: () => import('../admin-videos/admin-videos.module')
          .then(m => m.AdminVideosPageModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'kpi-policies',
        loadChildren: () => import('../admin-kpi-policies/admin-kpi-policies.module')
          .then(m => m.AdminKpiPoliciesPageModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'invoices',
        loadChildren: () => import('../admin-invoices/admin-invoices.module')
          .then(m => m.AdminInvoicesPageModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'clients',
        loadChildren: () => import('../admin-clients/admin-clients.module')
          .then(m => m.AdminClientsPageModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'meetings',
        loadChildren: () => import('../admin-meetings/admin-meetings.module')
          .then(m => m.AdminMeetingsPageModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'opportunities',
        loadChildren: () => import('../admin-opportunities/admin-opportunities.module')
          .then(m => m.AdminOpportunitiesPageModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'payroll',
        loadChildren: () => import('../admin-payroll/admin-payroll.module')
          .then(m => m.AdminPayrollPageModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'users',
        loadChildren: () => import('../admin-users/admin-users.module')
          .then(m => m.AdminUsersPageModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'leadlake',
        loadChildren: () => import('../admin-leadlake/admin-leadlake.module')
          .then(m => m.AdminLeadlakePageModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'extract',
        loadComponent: () => import('../admin-extract/admin-extract.page')
          .then(m => m.AdminExtractPage),
        canActivate: [AdminGuard]
      },
      {
        path: 'assessments',
        loadChildren: () => import('../admin-assessments/admin-assessments.module')
          .then(m => m.AdminAssessmentsPageModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'inboxes',
        loadChildren: () => import('../admin-inboxes/admin-inboxes.module')
          .then(m => m.AdminInboxesPageModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'relay-inbox',
        loadComponent: () => import('../admin-relay-inbox/admin-relay-inbox.page')
          .then(m => m.AdminRelayInboxPage),
        canActivate: [AdminGuard]
      },
      {
        path: 'relay-automation',
        loadComponent: () => import('../admin-relay-automation/admin-relay-automation.page')
          .then(m => m.AdminRelayAutomationPage),
        canActivate: [AdminGuard]
      },
      {
        path: 'blaster',
        loadChildren: () => import('../blaster/blaster.module')
          .then(m => m.BlasterPageModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'message-blaster',
        redirectTo: 'blaster',
        pathMatch: 'full'
      },
      {
        path: 'email-blaster',
        redirectTo: 'blaster',
        pathMatch: 'full'
      },
      {
        path: 'admin-scheduler',
        loadChildren: () => import('../scheduler/scheduler.module')
          .then(m => m.SchedulerPageModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'survey',
        loadChildren: () => import('../admin-survey/admin-survey.module')
          .then(m => m.AdminSurveyPageModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'credits',
        loadChildren: () => import('../admin-credits/admin-credits.module')
          .then(m => m.AdminCreditsPageModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'consumption',
        loadChildren: () => import('../admin-consumption/admin-consumption.module')
          .then(m => m.AdminConsumptionPageModule),
        canActivate: [AdminGuard]
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminPageRoutingModule {}
