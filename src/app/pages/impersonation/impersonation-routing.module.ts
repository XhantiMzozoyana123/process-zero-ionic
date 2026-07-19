import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ImpersonationPage } from './impersonation.page';

const routes: Routes = [
  {
    path: '',
    component: ImpersonationPage,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadChildren: () => import('src/app/pages/dashboard/dashboard.module').then(m => m.DashboardPageModule)
      },
      {
        path: 'leadlake',
        loadChildren: () => import('src/app/pages/leadlake/leadlake.module').then(m => m.LeadlakePageModule)
      },
      {
        path: 'contacts',
        loadChildren: () => import('src/app/pages/contacts/contacts.module').then(m => m.ContactsPageModule)
      },
      {
        path: 'meetings',
        loadChildren: () => import('src/app/pages/meetings/meetings.module').then(m => m.MeetingsPageModule)
      },
      {
        path: 'products',
        loadChildren: () => import('src/app/pages/products/products.module').then(m => m.ProductsPageModule)
      },
      {
        path: 'videos',
        loadComponent: () => import('src/app/pages/videos/videos.page').then(m => m.VideosPage)
      },
      {
        path: 'kpi-policies',
        loadChildren: () => import('src/app/pages/kpi-policies/kpi-policies.module').then(m => m.KpiPoliciesPageModule)
      },
      {
        path: 'relay-user',
        loadChildren: () => import('src/app/pages/relay-user/relay-user.module').then(m => m.RelayUserPageModule)
      },
      {
        path: 'help',
        loadChildren: () => import('src/app/pages/help/help.module').then(m => m.HelpPageModule)
      },
      {
        path: 'settings',
        loadChildren: () => import('src/app/pages/settings/settings.module').then(m => m.SettingsPageModule)
      },
      {
        path: 'bank-account',
        loadChildren: () => import('src/app/pages/bank-account/bank-account.module').then(m => m.BankAccountPageModule)
      },
      {
        path: 'change-password',
        loadChildren: () => import('src/app/pages/change-password/change-password.module').then(m => m.ChangePasswordPageModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImpersonationRoutingModule {}
