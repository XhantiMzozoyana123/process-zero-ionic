import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';

interface DocStep {
  text: string;
}

interface DocSubsection {
  id: string;
  title: string;
  content: string;
  steps?: DocStep[];
}

interface DocSection {
  id: string;
  title: string;
  icon: string;
  content: string;
  subsections?: DocSubsection[];
}

@Component({
  selector: 'app-public-help',
  templateUrl: './public-help.page.html',
  styleUrls: ['./public-help.page.scss'],
  standalone: false
})
export class PublicHelpPage {
  @ViewChild(IonContent) ionContent!: IonContent;
  activeSection = 'getting-started';
  sidebarOpen = false;

  featureLinks = [
    { icon: 'globe-outline', title: 'Lead Lake', desc: 'Prospect intelligence hub', route: '/features/lead-lake' },
    { icon: 'people-outline', title: 'My Contacts', desc: 'Manage your pipeline', route: '/features/contacts' },
    { icon: 'calendar-outline', title: 'Meetings', desc: 'Schedule & track calls', route: '/features/meetings' },
    { icon: 'cube-outline', title: 'Products', desc: 'Digital product catalogue', route: '/features/products' },
    { icon: 'stats-chart-outline', title: 'KPI Form & Policies', desc: 'Performance tracking', route: '/features/kpi' },
  ];

  sections: DocSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: 'rocket-outline',
      content: 'Process Zero is a performance-driven sales platform for commission-based representatives. You sell proven digital products from a curated catalogue and earn a 20% recurring commission on every deal you close. This guide walks you through every feature so you can start earning from day one.',
      subsections: [
        {
          id: 'first-steps',
          title: 'Your First Steps After Signing In',
          content: 'When you first sign in, you land on the Dashboard. Before diving into selling, complete these setup steps:',
          steps: [
            { text: 'Open the left sidebar menu and go to Settings > Banking Details. Enter your Account Holder Name, Account Number, Bank Name, and Bank Code. This ensures you can receive commission payouts.' },
            { text: 'Navigate to Products from the sidebar. Browse the catalogue \u2014 note each product\u0027s name, description, price in ZAR, negotiable amounts, and any external links.' },
            { text: 'Open Lead Lake from the sidebar. Use the search bar and industry filter chips to find prospects relevant to the products you want to sell.' },
            { text: 'Promote at least one lead to your Contacts by tapping the \u0022Add\u0022 button next to their name in the LeadLake table.' },
            { text: 'Go to Meetings and create your first meeting by selecting a contact, a product, a weekday date/time, and adding any agenda notes.' },
            { text: 'Tap the floating chart icon at the bottom-right of any page to open the KPI Form. Select a product and submit your first outreach metrics.' },
            { text: 'Return to the Dashboard, select the same product from the dropdown, and review your performance report.' }
          ]
        },
        {
          id: 'navigation',
          title: 'Navigating the App',
          content: 'Process Zero uses a dual-sidebar navigation layout accessible from any page within your account.',
          steps: [
            { text: 'Left Sidebar (tap the menu icon top-left) \u2014 your primary navigation. Contains: Dashboard, Lead Lake, My Contacts, Meetings, Products, KPI Policies, Help and Guide, and Settings.' },
            { text: 'Right Sidebar (tap the icon top-right) \u2014 quick actions. Contains: Banking Details, Change Password, Switch to Admin (if you have admin access), and Logout.' },
            { text: 'Floating Action Button (bottom-right corner) \u2014 the purple chart icon opens the KPI Form modal where you submit your sales performance metrics.' },
            { text: 'Pull-to-Refresh \u2014 on most pages, pull down from the top to reload the latest data from the server.' }
          ]
        }
      ]
    },
    {
      id: 'dashboard',
      title: 'Dashboard and KPI Reporting',
      icon: 'bar-chart-outline',
      content: 'The Dashboard is your real-time performance command centre. It displays a comprehensive KPI report for the product you select, broken down into visual sections.',
      subsections: [
        {
          id: 'dashboard-product',
          title: 'Selecting a Product',
          content: 'All KPIs in Process Zero are tracked per product. At the top of the Dashboard you will see a product selector dropdown. Tap it and choose the product you want to view metrics for. The entire report updates to show only the data for that product. If you sell multiple products, switch between them using this dropdown.'
        },
        {
          id: 'dashboard-metrics',
          title: 'Understanding the Report Sections',
          content: 'Once a product is selected, the Dashboard loads and displays these sections:',
          steps: [
            { text: 'Hero Metric Cards \u2014 four large cards at the top: Revenue Generated (with deal count), Call Attendance rate, Deal Close Rate, and Monthly Recurring Revenue with growth percentage.' },
            { text: 'Conversion Funnel \u2014 a visual pipeline: Outreach Attempts \u2192 Calls Booked \u2192 Calls Attended \u2192 Deals Influenced \u2192 Deals Closed. Each stage shows a count and a percentage-width bar.' },
            { text: 'Revenue Lens \u2014 vertical bar charts for Revenue Generated, Revenue Influenced, Team Revenue, MRR, and Average Deal Size. All values in ZAR.' },
            { text: 'Business Health \u2014 four coloured ring charts: Client Retention %, Team Performance Health %, Brand Compliance %, and Leadership Stability %.' },
            { text: 'Snapshot Panel \u2014 quick operational facts: Product ID, Team Close Rate, Leader Activity Level, and last-updated timestamp.' },
            { text: 'Operating Metrics \u2014 a detailed table of all supporting KPIs with metric names, descriptions, and values.' }
          ]
        },
        {
          id: 'kpi-form',
          title: 'Submitting KPI Data via the KPI Form',
          content: 'The KPI Form records your sales activity. Access it by tapping the floating chart button at the bottom-right of any page. Each field has its own Save button \u2014 you submit one metric at a time.',
          steps: [
            { text: 'Product Selector \u2014 choose which product\u0027s KPIs you are updating from the dropdown at the top.' },
            { text: 'Core Activity \u2014 enter Outreach Attempts, tap +1 to increment Calls Booked, enter Calls Attended, Deals Influenced, and Revenue Generated (ZAR).' },
            { text: 'Deal Performance \u2014 enter Deals Closed, Deals Attempted, Average Deal Size (ZAR), Revenue Influenced (ZAR), Client Retention (0\u20131), and toggle Activity Consistency.' },
            { text: 'Team Metrics \u2014 read-only calculated fields: Team Size, Team Revenue, Close Rate, Churn Rate, and Leader Activity Level.' },
            { text: 'Business Health \u2014 enter Brand Compliance (0\u20131), Strategic Initiatives Delivered, Brand Risk Management (0\u20131), and Innovation Contribution (0\u20131). MRR, Growth Rate, Retention, and Leadership Stability are calculated.' },
            { text: 'Tap Save or Sync next to any field to submit that individual metric. Then return to the Dashboard to see updated results.' }
          ]
        }
      ]
    },
    {
      id: 'leadlake',
      title: 'Lead Lake',
      icon: 'people-outline',
      content: 'Lead Lake is the lead intelligence database built into Process Zero. It provides a shared pool of potential prospects you can search, filter, and promote into your personal Contacts list.',
      subsections: [
        {
          id: 'leadlake-browsing',
          title: 'Browsing and Searching Leads',
          content: 'The Lead Lake page displays leads in a table with columns for Name, Email, Company, Role, Industry, Location, and an Action button.',
          steps: [
            { text: 'Search Bar \u2014 type any keyword into \u0022Search leads...\u0022 at the top. It filters across first name, last name, email, company, location, and industry in real time.' },
            { text: 'Industry Filter Chips \u2014 below the search bar, tap any industry chip: Technology, Finance, Healthcare, Education, Retail, Manufacturing, Entertainment, Hospitality, Transportation, Energy, or Other.' },
            { text: 'Combined Filtering \u2014 use the search bar and an industry chip together. For example, type \u0022Johannesburg\u0022 and select \u0022Finance\u0022.' },
            { text: 'Pagination \u2014 choose leads per page (10, 25, 50, or 100). Navigate with Previous/Next buttons. Shows \u0022Page X / Y\u0022 and \u0022Showing A\u2013B of C leads\u0022.' }
          ]
        },
        {
          id: 'leadlake-promote',
          title: 'Promoting a Lead to a Contact',
          content: 'When you find a prospect you want to work with, promote them into your personal Contacts list:',
          steps: [
            { text: 'Find the lead in the table and tap the \u0022Add\u0022 button in the Action column.' },
            { text: 'The system validates that the lead has a first name, last name, and email. If any are missing, you will see an error toast.' },
            { text: 'On success, a green toast confirms the promotion, e.g. \u0022Jane Smith added to Contacts.\u0022' },
            { text: 'The lead now appears in My Contacts. Navigate there to edit their details, add a phone number, set a status, and start scheduling meetings.' }
          ]
        }
      ]
    },
    {
      id: 'contacts',
      title: 'My Contacts',
      icon: 'person-outline',
      content: 'My Contacts is your personal CRM within Process Zero. Manage all your prospects and clients here \u2014 whether promoted from LeadLake or added manually.',
      subsections: [
        {
          id: 'contacts-add',
          title: 'Adding a New Contact',
          content: 'Tap \u0022Add Contact\u0022 in the header or the + floating action button. Fill in these fields:',
          steps: [
            { text: 'First Name (required) \u2014 the contact\u0027s given name.' },
            { text: 'Last Name (required) \u2014 the contact\u0027s surname.' },
            { text: 'Email (required) \u2014 must be a valid email format.' },
            { text: 'Phone (required) \u2014 their phone number.' },
            { text: 'Company (required) \u2014 the company they belong to.' },
            { text: 'Job (required) \u2014 their job title or role.' },
            { text: 'Location (required) \u2014 their city, region, or address.' },
            { text: 'Industry (required) \u2014 select from the dropdown: Technology, Finance, Healthcare, Education, Retail, Manufacturing, Entertainment, Hospitality, Transportation, Energy, or Other.' },
            { text: 'Tap \u0022Save Contact\u0022 when all fields are filled. The button stays disabled until the form is valid.' }
          ]
        },
        {
          id: 'contacts-manage',
          title: 'Editing, Deleting, and Searching Contacts',
          content: 'Manage your contacts with these actions:',
          steps: [
            { text: 'Edit \u2014 tap a contact row in table view (or their card) to open the form pre-filled with their data. Make changes and tap \u0022Update Contact\u0022.' },
            { text: 'Delete \u2014 tap the red trash icon. A confirmation prompt appears. Confirm to permanently remove the contact.' },
            { text: 'Search \u2014 use the search bar at the top to filter by name, email, phone, company, job, location, or status in real time.' },
            { text: 'View Toggle \u2014 switch between Table View and Card View using the toggle buttons next to the search bar.' },
            { text: 'Pagination \u2014 navigate pages using Previous/Next buttons at the bottom.' }
          ]
        },
        {
          id: 'contacts-status',
          title: 'Understanding Contact Statuses',
          content: 'Each contact has a coloured status chip that tracks pipeline position:',
          steps: [
            { text: 'Reached (green) \u2014 you have made initial contact.' },
            { text: 'Follow Up (amber) \u2014 this contact needs follow-up.' },
            { text: 'Converted (blue) \u2014 this contact has closed a deal and become a paying customer.' },
            { text: 'Active (grey) \u2014 a general active status for contacts not yet categorised.' }
          ]
        }
      ]
    },
    {
      id: 'meetings',
      title: 'Meetings',
      icon: 'calendar-outline',
      content: 'The Meetings page lets you schedule, track, and manage all your sales meetings. Every meeting is linked to a specific contact and product.',
      subsections: [
        {
          id: 'meetings-create',
          title: 'Creating a Meeting',
          content: 'Tap \u0022New Meeting\u0022 in the header or the + floating action button:',
          steps: [
            { text: 'Client (required) \u2014 select the contact from the dropdown.' },
            { text: 'Product (required) \u2014 only products you have passed the assessment for appear in this dropdown. If no products are listed, go to the Products page and take the required assessments first.' },
            { text: 'Date and Time (required) \u2014 pick a date and time. Weekdays only \u2014 weekends trigger the error \u0022Meetings cannot be scheduled on weekends.\u0022' },
            { text: 'Notes (optional) \u2014 a text area for agenda items or preparation notes.' },
            { text: 'Tap \u0022Save Meeting\u0022 to create it. A success toast confirms it was saved.' }
          ]
        },
        {
          id: 'meetings-manage',
          title: 'Editing, Deleting, and Browsing Meetings',
          content: 'Manage meetings with these actions:',
          steps: [
            { text: 'Edit \u2014 tap any meeting row or card to open the edit form. Change details and tap \u0022Update Meeting.\u0022' },
            { text: 'Delete \u2014 tap the red trash icon. Confirm in the alert to permanently remove it.' },
            { text: 'Status Indicators \u2014 \u0022Upcoming\u0022 (green) for future dates; \u0022Past\u0022 (grey) for dates that have passed.' },
            { text: 'Search \u2014 filter by contact name, product name, or notes.' },
            { text: 'View Toggle \u2014 switch between Table View and Card View.' }
          ]
        }
      ]
    },
    {
      id: 'assessments',
      title: 'Assessments',
      icon: 'school-outline',
      content: 'Assessments are knowledge checks you must pass before you can access certain areas of the platform or sell specific products. There are two types: the Global Assessment and Product Assessments.',
      subsections: [
        {
          id: 'assessment-global',
          title: 'Global Assessment',
          content: 'The Global Assessment is the gateway to the platform. You must pass it before accessing any features beyond the assessment page.',
          steps: [
            { text: 'When you first sign in, you are redirected to the Global Assessment if you have not already passed it.' },
            { text: 'Read the welcome screen carefully \u2014 it explains the assessment rules and the passing requirement.' },
            { text: 'Tap \u0022Begin Assessment\u0022 to start. You will see a step-by-step question flow with multiple-choice and open-ended questions.' },
            { text: 'Answer each question using the option buttons (MCQs) or the text area (open questions). Navigate with Previous/Next buttons.' },
            { text: 'The progress bar at the top shows how far through the assessment you are.' },
            { text: 'When all MCQs are answered, tap \u0022Submit\u0022. You will be asked to confirm before final submission.' },
            { text: 'Your result is shown immediately \u2014 score, percentage, and pass/fail status. If you pass, you gain access to the full platform.' },
            { text: 'If you fail, you can retake the assessment from the results screen.' }
          ]
        },
        {
          id: 'assessment-product',
          title: 'Product Assessments',
          content: 'Each product in the catalogue can have its own assessment. You must pass a product\'s assessment before you can sell it (book meetings for it).',
          steps: [
            { text: 'Navigate to the Products page from the sidebar.' },
            { text: 'Each product shows a \u0022Qualification\u0022 status \u2014 either a green \u0022Qualified\u0022 chip (you passed) or a \u0022Take Assessment\u0022 button.' },
            { text: 'Tap \u0022Take Assessment\u0022 on any product to begin its specific assessment.' },
            { text: 'The assessment flow is the same as the Global Assessment \u2014 welcome screen, step-by-step questions, and a result at the end.' },
            { text: 'If you pass, that product becomes \u0022Qualified\u0022 and appears in the product dropdown when booking meetings.' },
            { text: 'If you fail, you can retake it. You cannot book meetings for that product until you pass.' },
            { text: 'After passing, you are redirected back to the Products page where the product now shows \u0022Qualified.\u0022' }
          ]
        },
        {
          id: 'assessment-impact',
          title: 'How Assessments Affect Your Workflow',
          content: 'Assessments are connected to several parts of the platform:',
          steps: [
            { text: 'Platform Access \u2014 you must pass the Global Assessment to access the Dashboard, Contacts, Meetings, Products, and all other features.' },
            { text: 'Product Selling \u2014 you can only book meetings for products you are qualified on. The Meetings page product dropdown only shows qualified products.' },
            { text: 'Products Page \u2014 the Qualification column/badge on each product shows your current status at a glance.' },
            { text: 'No product limit \u2014 you can qualify for as many products as you like. Take assessments for all products you want to sell.' }
          ]
        }
      ]
    },
    {
      id: 'products',
      title: 'Products',
      icon: 'cube-outline',
      content: 'The Products page displays the digital product catalogue. Products are central to the entire Process Zero workflow \u2014 KPIs, meetings, invoices, and policies all connect to products. You must pass each product\'s assessment before you can sell it.',
      subsections: [
        {
          id: 'products-browse',
          title: 'Browsing and Searching Products',
          content: 'Products appear in a table or card grid (toggle between views). Each entry shows:',
          steps: [
            { text: 'Product Image \u2014 a thumbnail, or a placeholder cube icon if none uploaded.' },
            { text: 'Price \u2014 displayed in South African Rand (ZAR).' },
            { text: 'Name \u2014 the product\'s official name.' },
            { text: 'Description \u2014 a truncated preview. Tap the card to see the full text.' },
            { text: 'Qualification Status \u2014 a green \u0022Qualified\u0022 chip if you passed the product assessment, or a \u0022Take Assessment\u0022 button if you have not yet qualified.' },
            { text: 'Use the search bar to filter by name, description, URL, negotiable amounts, or price.' }
          ]
        },
        {
          id: 'products-detail',
          title: 'Viewing Product Details',
          content: 'Tap any product card to open a detail modal:',
          steps: [
            { text: 'Full-size product image at the top.' },
            { text: 'Product Name and Price in ZAR.' },
            { text: 'Full Description of what the product offers.' },
            { text: 'Negotiable Amounts \u2014 tiered pricing if available.' },
            { text: 'Product Link \u2014 clickable URL that opens in a new tab.' },
            { text: 'Metadata \u2014 created and last updated dates.' }
          ]
        }
      ]
    },
    {
      id: 'kpi-policies',
      title: 'KPI Policies',
      icon: 'shield-checkmark-outline',
      content: 'KPI Policies are performance benchmarks defined by administrators. They set minimum targets you must meet for each product over a specific time period.',
      subsections: [
        {
          id: 'policies-view',
          title: 'Viewing Your Policies',
          content: 'Navigate to KPI Policies from the sidebar. Each policy card shows:',
          steps: [
            { text: 'Product Name \u2014 which product the policy applies to.' },
            { text: 'Date Range \u2014 the effective from and to dates.' },
            { text: 'Status \u2014 Active (green) or Inactive (grey).' },
            { text: 'Min Revenue \u2014 minimum monthly revenue target in ZAR.' },
            { text: 'Min Outreach \u2014 minimum outreach attempts required.' },
            { text: 'Min Calls Booked \u2014 minimum calls you must book.' },
            { text: 'Tap any card for full details: Grace Period, Auto-freeze on Breach, and metadata.' }
          ]
        },
        {
          id: 'policies-impact',
          title: 'How Policies Affect You',
          content: 'Policies define the performance floor you need to maintain:',
          steps: [
            { text: 'Grace Period \u2014 the number of days you have to meet minimums before consequences apply.' },
            { text: 'Auto-freeze on Breach \u2014 if enabled, failing targets within the grace period can freeze your product access.' },
            { text: 'Compare your Dashboard metrics against policy thresholds regularly.' },
            { text: 'Policies are read-only for sales representatives \u2014 only administrators can create/edit/delete them.' }
          ]
        }
      ]
    },
    {
      id: 'banking',
      title: 'Banking Details and Payouts',
      icon: 'wallet-outline',
      content: 'To receive your commission payouts, you must configure your banking details in the app.',
      subsections: [
        {
          id: 'banking-setup',
          title: 'Setting Up Your Bank Account',
          content: 'Navigate to Settings > Banking Details or access from the right sidebar quick-actions:',
          steps: [
            { text: 'If no bank account exists, you will see \u0022No banking details yet\u0022 with an \u0022Add Banking Details\u0022 button.' },
            { text: 'Account Holder Name (required, max 200 chars) \u2014 full name exactly as on your bank account.' },
            { text: 'Account Number (required, 6\u201364 chars) \u2014 your complete bank account number.' },
            { text: 'Bank Name (optional, max 200 chars) \u2014 e.g. \u0022FNB\u0022, \u0022Standard Bank\u0022, \u0022Capitec\u0022.' },
            { text: 'Bank Code (optional, max 20 chars) \u2014 branch or SWIFT code.' },
            { text: 'Tap \u0022Save Bank Account\u0022 to save. Your account number is masked on screen for security.' }
          ]
        },
        {
          id: 'banking-edit',
          title: 'Editing Your Bank Account',
          content: 'To update your banking details, tap \u0022Edit\u0022 in the header or on the card. The form opens pre-filled with saved data. Note: you must re-enter your full account number when editing because it is stored encrypted.'
        },
        {
          id: 'banking-payouts',
          title: 'How Monthly Payouts Work',
          content: 'The commission payout cycle:',
          steps: [
            { text: 'Throughout the month, close deals and submit KPI data through the KPI Form.' },
            { text: 'At month end, an administrator runs the payroll generation tool to calculate commissions.' },
            { text: 'The system generates a CSV report with each rep\u0027s User ID, Username, Account Number, Bank Name, and Payout Amount.' },
            { text: 'Email notifications are sent \u2014 you receive an email with your individual payout amount.' },
            { text: 'The payout is processed to the bank account you configured. Ensure details are up to date before payroll.' }
          ]
        }
      ]
    },
    {
      id: 'settings',
      title: 'Account Settings and Security',
      icon: 'settings-outline',
      content: 'The Settings page is your account management hub. Access it from the sidebar menu or the right-side quick-actions panel.',
      subsections: [
        {
          id: 'settings-password',
          title: 'Changing Your Password',
          content: 'Navigate to Settings > Change Password:',
          steps: [
            { text: 'Current Password (required, min 6 chars) \u2014 your existing login password.' },
            { text: 'New Password (required, min 6 chars) \u2014 your desired new password.' },
            { text: 'Confirm New Password (required, min 6 chars) \u2014 if it does not match the error \u0022New passwords do not match\u0022 appears.' },
            { text: 'Tap \u0022Change Password\u0022 to submit. On success, you are redirected with a confirmation toast.' }
          ]
        },
        {
          id: 'settings-forgot',
          title: 'Resetting a Forgotten Password',
          content: 'If you cannot sign in:',
          steps: [
            { text: 'On the Login page, tap \u0022Forgot password?\u0022 below the sign-in form.' },
            { text: 'Enter your registered email and tap \u0022Send Reset Link.\u0022' },
            { text: 'Check your email for a reset link. Click it to open the Reset Password page.' },
            { text: 'Enter and confirm your new password, then submit.' }
          ]
        },
        {
          id: 'settings-2fa',
          title: 'Two-Factor Authentication (2FA)',
          content: 'When 2FA is enabled on your account:',
          steps: [
            { text: 'After entering email and password, you are redirected to the Verify 2FA page.' },
            { text: 'Enter the 6-digit verification code from your authenticator app into the input field.' },
            { text: 'Tap \u0022Verify\u0022 to complete sign-in.' },
            { text: 'Tap \u0022Back to Sign In\u0022 to return to the login page if needed.' }
          ]
        },
        {
          id: 'settings-ban',
          title: 'Account Bans',
          content: 'If an administrator bans your account, you are immediately logged out and see \u0022Your account has been banned. Contact an administrator.\u0022 All API access is blocked. Contact your administrator outside the app to request an unban. No data is lost during a ban.'
        },
        {
          id: 'settings-logout',
          title: 'Logging Out',
          content: 'Log out from Settings > Logout card or from the right sidebar > Logout. Both immediately clear your session token and redirect to the Login page.'
        }
      ]
    },
    {
      id: 'workflows',
      title: 'Workflows and Best Practices',
      icon: 'bulb-outline',
      content: 'Follow these proven workflows to maximise your sales activity and recurring commission income.',
      subsections: [
        {
          id: 'workflow-daily',
          title: 'Recommended Daily Routine',
          content: 'Follow this routine each day for consistent performance growth:',
          steps: [
            { text: 'Check your Dashboard \u2014 select your primary product and review revenue, outreach, and calls vs. KPI Policy targets.' },
            { text: 'Browse LeadLake \u2014 search for 5\u201310 new prospects using industry filters. Promote promising leads to Contacts.' },
            { text: 'Follow up on Contacts \u2014 filter by \u0022Follow Up\u0022 status. Reach out, then update to \u0022Reached\u0022 or \u0022Converted.\u0022' },
            { text: 'Review Upcoming Meetings \u2014 check the Meetings page. Prepare notes for today or tomorrow.' },
            { text: 'Submit your KPIs \u2014 open the KPI Form and log all outreach attempts, calls booked, revenue, and deal metrics.' },
            { text: 'Update Contact Statuses \u2014 mark contacts as \u0022Reached\u0022, \u0022Follow Up\u0022, or \u0022Converted\u0022 based on the day\u0027s interactions.' }
          ]
        },
        {
          id: 'workflow-conversion',
          title: 'Lead-to-Customer Conversion Workflow',
          content: 'The complete workflow for converting a lead into a paying customer:',
          steps: [
            { text: 'Find leads in LeadLake \u2014 search and filter for people matching your product\u0027s ideal customer.' },
            { text: 'Promote to Contacts \u2014 tap \u0022Add\u0022 to move a lead into your personal contact list.' },
            { text: 'Reach out \u2014 contact them via phone or email. Update status to \u0022Reached.\u0022' },
            { text: 'Schedule a Meeting \u2014 select the contact, choose the product, pick a weekday date/time, and add your agenda.' },
            { text: 'Conduct the meeting \u2014 present the product, handle objections, and close.' },
            { text: 'Close the deal \u2014 update the contact to \u0022Converted\u0022 and submit revenue through the KPI Form.' },
            { text: 'Earn recurring income \u2014 your 20% commission starts immediately and continues monthly.' }
          ]
        },
        {
          id: 'workflow-targets',
          title: 'Tracking Progress Against KPI Targets',
          content: 'Stay on top of your performance policies:',
          steps: [
            { text: 'Open KPI Policies from the sidebar and note your minimum Revenue, Outreach, and Calls targets.' },
            { text: 'Open the Dashboard, select the same product, and compare current metrics against thresholds.' },
            { text: 'If any metric is below minimum, prioritise that area \u2014 more prospecting, calls, or meetings.' },
            { text: 'Keep the Grace Period in mind \u2014 days before consequences apply.' },
            { text: 'If Auto-freeze on Breach is enabled, failing targets within the grace period may freeze product access.' }
          ]
        }
      ]
    }
  ];

  constructor(private router: Router) {}

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  scrollTo(sectionId: string): void {
    this.activeSection = sectionId;
    this.sidebarOpen = false;
    const el = document.getElementById(sectionId);
    if (el) {
      this.ionContent.scrollToPoint(0, el.offsetTop - 16, 300);
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  navigateTo(path: string): void {
    this.router.navigateByUrl(path);
  }
}
