import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountPage } from './account.page';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { AssessmentGuard } from 'src/app/guards/assessment.guard';

const routes: Routes = [
  {
    path: '',
    component: AccountPage,
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'leadlake',
        loadChildren: () => import('./../../pages/leadlake/leadlake.module')
          .then(m => m.LeadlakePageModule),
          canActivate: [AuthGuard, AssessmentGuard]

      },
      {
        path: 'contacts',
        loadChildren: () => import('./../../pages/contacts/contacts.module')
          .then(m => m.ContactsPageModule),
          canActivate: [AuthGuard, AssessmentGuard]
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./../../pages/dashboard/dashboard.module')
        .then( m => m.DashboardPageModule),
          canActivate: [AuthGuard, AssessmentGuard]
      },
      {
        path: 'settings',
        loadChildren: () => import('./../../pages/settings/settings.module')
        .then( m => m.SettingsPageModule),
          canActivate: [AuthGuard, AssessmentGuard]
      },
      {
        path: 'change-password',
        loadChildren: () => import('./../../pages/change-password/change-password.module')
        .then( m => m.ChangePasswordPageModule),
        canActivate: [AuthGuard, AssessmentGuard]
      },
      {
        path: 'meetings',
        loadChildren: () => import('./../../pages/meetings/meetings.module')
        .then( m => m.MeetingsPageModule),
          canActivate: [AuthGuard, AssessmentGuard]

      }, 
      {
        path: 'bank-account',
        loadChildren: () => import('./../../pages/bank-account/bank-account.module')
        .then( m => m.BankAccountPageModule),
        canActivate: [AuthGuard, AssessmentGuard]
      },
      {
        path: 'products',
        loadChildren: () => import('./../../pages/products/products.module')
        .then( m => m.ProductsPageModule),
        canActivate: [AuthGuard, AssessmentGuard]
      },
      {
        path: 'videos',
        loadComponent: () => import('./../../pages/videos/videos.page')
          .then(m => m.VideosPage),
        canActivate: [AuthGuard]
      },
      {
        path: 'kpi-policies',
        loadChildren: () => import('./../../pages/kpi-policies/kpi-policies.module')
        .then( m => m.KpiPoliciesPageModule),
        canActivate: [AuthGuard, AssessmentGuard]
      },
      {
        path: 'help',
        loadChildren: () => import('./../../pages/help/help.module')
        .then( m => m.HelpPageModule),
        canActivate: [AuthGuard, AssessmentGuard]
      },
      {
        path: 'relay-user',
        loadComponent: () => import('./../../pages/relay-user/relay-user.page')
          .then(m => m.RelayUserPage),
        canActivate: [AuthGuard]
      },
      {
        path: 'assessments',
        loadChildren: () => import('./../../pages/assessment/assessment.module')
        .then( m => m.AssessmentPageModule),
        canActivate: [AuthGuard]
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
export class AccountPageRoutingModule {}
