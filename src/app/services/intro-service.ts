import { Injectable } from '@angular/core';
import introJs from 'intro.js';

@Injectable({ providedIn: 'root' })
export class IntroService {
  private readonly STORAGE_KEY = 'pz_intro_completed';

  hasSeenIntro(): boolean {
    return localStorage.getItem(this.STORAGE_KEY) === 'true';
  }

  markIntroComplete(): void {
    localStorage.setItem(this.STORAGE_KEY, 'true');
  }

  resetIntro(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  startTour(): void {
    const intro = introJs();
    intro.setOptions({
      steps: [
        {
          title: 'Welcome to Process Zero!',
          intro: 'This quick tour will show you around the app. Let\'s get you up to speed in under a minute.'
        },
        {
          element: 'ion-menu-button[menu="account-menu"]',
          title: 'Navigation Menu',
          intro: 'Tap here to open the main navigation sidebar. You\'ll find all your key pages here — Lead Lake, Contacts, Meetings, Products, and more.',
          position: 'right'
        },
        {
          element: 'ion-menu-button[menu="settings-menu"]',
          title: 'Quick Actions',
          intro: 'This opens the quick-actions panel with Banking Details, Change Password, and Logout.',
          position: 'left'
        },
        {
          element: '.kpi-fab',
          title: 'KPI Tools',
          intro: 'Tap this floating button to open the KPI reporting form. Submit your key performance indicators for any product here.',
          position: 'left'
        },
        {
          element: '.hero-section',
          title: 'KPI Intelligence Dashboard',
          intro: 'This is your dashboard. It shows real-time KPI metrics for your selected product — revenue, conversion rates, business health, and more.'
        },
        {
          element: '.product-selector',
          title: 'Product Selector',
          intro: 'Use this dropdown to switch between products. All dashboard metrics update automatically when you select a different product.'
        },
        {
          title: 'You\'re All Set!',
          intro: 'That\'s the basics! Explore the sidebar menu to discover Lead Lake, Contacts, Meetings, and Settings. You can replay this tour anytime from Help & Guide.'
        }
      ],
      showProgress: true,
      showBullets: true,
      exitOnOverlayClick: false,
      doneLabel: 'Got it!',
      nextLabel: 'Next →',
      prevLabel: '← Back',
      showStepNumbers: false,
      overlayOpacity: 0.7,
      tooltipClass: 'pz-intro-tooltip'
    });

    intro.oncomplete(() => this.markIntroComplete());
    intro.onexit(() => this.markIntroComplete());
    intro.start();
  }

  startLeadLakeTour(): void {
    const intro = introJs();
    intro.setOptions({
      steps: [
        {
          title: 'Welcome to Lead Lake',
          intro: 'This is your lead intelligence hub. Browse thousands of prospects, filter by industry, and promote the best ones straight to your Contacts list.'
        },
        {
          element: '.themed-search',
          title: 'Search Leads',
          intro: 'Type a name, email, company, location, or industry keyword here to instantly filter the lead database. Results update as you type.',
          position: 'bottom'
        },
        {
          element: '.filter-section',
          title: 'Industry Filters',
          intro: 'Narrow results by industry. Tap a chip to filter — for example "Technology" or "Finance". Tap "Clear" to remove the filter.',
          position: 'bottom'
        },
        {
          element: '.table-header',
          title: 'Lead Table',
          intro: 'Each row shows a lead\'s name, email, company, role, and industry. Scroll down to browse through all the results.',
          position: 'bottom'
        },
        {
          element: '.promote-btn',
          title: 'Add to Contacts',
          intro: 'Found a promising lead? Tap this "Add" button to promote them directly into your personal Contacts. You can then schedule meetings and track deals with them.',
          position: 'left'
        },
        {
          element: '.pagination-section',
          title: 'Pagination',
          intro: 'Use these controls to navigate through pages of leads. You can also change how many rows are shown per page.',
          position: 'top'
        },
        {
          title: 'Start Prospecting!',
          intro: 'That\'s everything you need! Search for leads, filter by industry, and add the best prospects to your Contacts. Happy selling!'
        }
      ],
      showProgress: true,
      showBullets: true,
      exitOnOverlayClick: false,
      doneLabel: 'Got it!',
      nextLabel: 'Next →',
      prevLabel: '← Back',
      showStepNumbers: false,
      overlayOpacity: 0.7,
      tooltipClass: 'pz-intro-tooltip'
    });

    intro.start();
  }

  startContactsTour(): void {
    const intro = introJs();
    intro.setOptions({
      steps: [
        {
          title: 'My Contacts',
          intro: 'This is where you manage all your personal contacts — people you\'re actively selling to or following up with.'
        },
        {
          element: '.add-btn',
          title: 'Add a Contact',
          intro: 'Tap here to manually create a new contact. Fill in their name, email, phone, company, and industry. You can also add contacts from Lead Lake.',
          position: 'left'
        },
        {
          element: '.themed-search',
          title: 'Search Contacts',
          intro: 'Quickly find a contact by typing their name, email, company, or any other detail. Results filter in real time.',
          position: 'bottom'
        },
        {
          element: '.view-toggle',
          title: 'Switch View',
          intro: 'Toggle between a table view (list) and a card view (grid). Pick whichever layout works best for you.',
          position: 'left'
        },
        {
          element: '.contacts-table thead, .cards-grid',
          title: 'Your Contacts List',
          intro: 'Each entry shows the contact\'s name, email, phone, company, and their current status (Reached, Follow Up, Converted, or Active).',
          position: 'bottom'
        },
        {
          element: '.status-chip',
          title: 'Contact Status',
          intro: 'The coloured chip shows where this contact is in your pipeline. Statuses update when you edit the contact.',
          position: 'left'
        },
        {
          element: '.actions-col, .card-actions',
          title: 'Edit & Delete',
          intro: 'Use the pencil icon to edit a contact\'s details, or the trash icon to remove them. Click any row to open the edit form too.',
          position: 'left'
        },
        {
          element: '.pagination-controls',
          title: 'Pagination',
          intro: 'Navigate through pages of contacts when your list grows large.',
          position: 'top'
        },
        {
          title: 'You\'re Ready!',
          intro: 'Add contacts from Lead Lake or create them manually, then track their status through your sales pipeline. Good luck!'
        }
      ],
      showProgress: true,
      showBullets: true,
      exitOnOverlayClick: false,
      doneLabel: 'Got it!',
      nextLabel: 'Next →',
      prevLabel: '← Back',
      showStepNumbers: false,
      overlayOpacity: 0.7,
      tooltipClass: 'pz-intro-tooltip'
    });

    intro.start();
  }

  startMeetingsTour(): void {
    const intro = introJs();
    intro.setOptions({
      steps: [
        {
          title: 'Meetings',
          intro: 'This page lets you schedule, track, and manage all your sales meetings with contacts.'
        },
        {
          element: '.add-btn',
          title: 'Schedule a Meeting',
          intro: 'Tap here to create a new meeting. You\'ll pick a contact, select a product to discuss, choose a weekday date & time, and optionally add agenda notes.',
          position: 'left'
        },
        {
          element: '.themed-search',
          title: 'Search Meetings',
          intro: 'Type a contact name, product, or notes keyword to filter your meetings list instantly.',
          position: 'bottom'
        },
        {
          element: '.view-toggle',
          title: 'Table or Card View',
          intro: 'Switch between a compact table layout and a visual card layout — whichever you prefer.',
          position: 'left'
        },
        {
          element: '.status-chip',
          title: 'Meeting Status',
          intro: 'A green "Upcoming" chip means the meeting is in the future. A grey "Past" chip means it\'s already happened.',
          position: 'left'
        },
        {
          element: '.actions-col, .card-actions',
          title: 'Edit & Delete',
          intro: 'Use the pencil icon to reschedule or update meeting details, or the trash icon to cancel and remove a meeting.',
          position: 'left'
        },
        {
          element: '.pagination-controls',
          title: 'Pagination',
          intro: 'Navigate between pages when you have many meetings scheduled.',
          position: 'top'
        },
        {
          title: 'Go Close Deals!',
          intro: 'Schedule meetings with your contacts, discuss products, and track everything here. Each meeting brings you closer to a commission!'
        }
      ],
      showProgress: true,
      showBullets: true,
      exitOnOverlayClick: false,
      doneLabel: 'Got it!',
      nextLabel: 'Next →',
      prevLabel: '← Back',
      showStepNumbers: false,
      overlayOpacity: 0.7,
      tooltipClass: 'pz-intro-tooltip'
    });

    intro.start();
  }

  startProductsTour(): void {
    const intro = introJs();
    intro.setOptions({
      steps: [
        {
          title: 'Products Catalogue',
          intro: 'This page shows all the digital products available on the platform. Browse, learn about each product, and qualify yourself to start selling.'
        },
        {
          element: '.themed-search',
          title: 'Search Products',
          intro: 'Type a product name, description, or price to filter the catalogue instantly.',
          position: 'bottom'
        },
        {
          element: '.view-toggle',
          title: 'Switch View',
          intro: 'Toggle between a table layout for quick scanning or a card layout to see product images and full details.',
          position: 'left'
        },
        {
          element: '.products-table thead, .cards-grid',
          title: 'Product Listings',
          intro: 'Each product shows its name, price in ZAR, negotiable amounts, creation date, and your qualification status. Click any product to see full details.',
          position: 'bottom'
        },
        {
          element: '.price-cell, .product-price',
          title: 'Product Price',
          intro: 'This is the product price in South African Rand (ZAR). The negotiable column shows any flexible pricing options.',
          position: 'left'
        },
        {
          element: '.status-chip, .assess-btn',
          title: 'Qualification Status',
          intro: 'A green "Qualified" badge means you\'ve passed the assessment and can sell this product. If not, tap "Take Assessment" to qualify — you must pass before scheduling meetings for this product.',
          position: 'left'
        },
        {
          title: 'Start Selling!',
          intro: 'Browse the catalogue, qualify for products by taking assessments, then head to Meetings to schedule sales calls. You earn 20% recurring commission on every deal!'
        }
      ],
      showProgress: true,
      showBullets: true,
      exitOnOverlayClick: false,
      doneLabel: 'Got it!',
      nextLabel: 'Next →',
      prevLabel: '← Back',
      showStepNumbers: false,
      overlayOpacity: 0.7,
      tooltipClass: 'pz-intro-tooltip'
    });

    intro.start();
  }

  startKpiPoliciesTour(): void {
    const intro = introJs();
    intro.setOptions({
      steps: [
        {
          title: 'KPI Policies',
          intro: 'KPI policies are performance benchmarks set by administrators. They define the minimum targets you need to hit for each product — think of them as your sales playbook.'
        },
        {
          element: '.themed-search',
          title: 'Search Policies',
          intro: 'Filter policies by product name or status (active/inactive) using this search bar.',
          position: 'bottom'
        },
        {
          element: '.view-toggle',
          title: 'Table or Card View',
          intro: 'Switch between a detailed table view or a visual card layout.',
          position: 'left'
        },
        {
          element: '.policies-table thead, .cards-grid',
          title: 'Policy Details',
          intro: 'Each policy is tied to a product and shows the effective date range, minimum monthly revenue target, outreach attempts required, and calls to book.',
          position: 'bottom'
        },
        {
          element: '.revenue-cell, .metric-item',
          title: 'Revenue & Outreach Targets',
          intro: 'These are your minimum targets — the revenue in ZAR you need to generate, outreach attempts to make, and calls to book each period.',
          position: 'left'
        },
        {
          element: '.status-chip',
          title: 'Policy Status',
          intro: 'An "Active" policy is currently enforced. "Inactive" policies are either expired or paused. Only active policies affect your performance tracking.',
          position: 'left'
        },
        {
          title: 'Know Your Targets!',
          intro: 'Review policies regularly so you know exactly what\'s expected. Hit these benchmarks consistently and you\'ll maximise your commissions. Click any policy to see full details.'
        }
      ],
      showProgress: true,
      showBullets: true,
      exitOnOverlayClick: false,
      doneLabel: 'Got it!',
      nextLabel: 'Next →',
      prevLabel: '← Back',
      showStepNumbers: false,
      overlayOpacity: 0.7,
      tooltipClass: 'pz-intro-tooltip'
    });

    intro.start();
  }

  startBankAccountTour(): void {
    const intro = introJs();
    intro.setOptions({
      steps: [
        {
          title: 'Banking Details',
          intro: 'This page is where you set up your payout banking information. You need valid banking details on file to receive commission payments.'
        },
        {
          element: '.add-btn',
          title: 'Add or Edit',
          intro: 'Tap this button to add your banking details for the first time, or edit them if they\'re already saved.',
          position: 'left'
        },
        {
          element: '.item-card, .empty-state',
          title: 'Your Bank Account',
          intro: 'Once saved, your account holder name, masked account number, bank name, and bank code are displayed here. Your full account number is never shown for security.',
          position: 'bottom'
        },
        {
          element: '.card-meta',
          title: 'Account Details',
          intro: 'Your masked account number and bank code appear here. Only the last few digits of your account number are visible for security.',
          position: 'bottom'
        },
        {
          element: '.action-btn.edit, .add-empty-btn',
          title: 'Edit Details',
          intro: 'Need to update your bank? Tap Edit to open the form. You\'ll need to re-enter your full account number each time for security.',
          position: 'top'
        },
        {
          element: '.themed-fab',
          title: 'Quick Add',
          intro: 'You can also tap this floating button at the bottom-right to quickly open the bank account form.',
          position: 'left'
        },
        {
          title: 'You\'re Set!',
          intro: 'Make sure your banking details are correct so commission payouts reach you without issues. You can update them anytime from this page.'
        }
      ],
      showProgress: true,
      showBullets: true,
      exitOnOverlayClick: false,
      doneLabel: 'Got it!',
      nextLabel: 'Next →',
      prevLabel: '← Back',
      showStepNumbers: false,
      overlayOpacity: 0.7,
      tooltipClass: 'pz-intro-tooltip'
    });

    intro.start();
  }

  startDashboardTour(): void {
    const intro = introJs();
    intro.setOptions({
      steps: [
        {
          title: 'Your Dashboard',
          intro: 'Welcome to your KPI Intelligence Report — the command centre for tracking sales performance across all your products.'
        },
        {
          element: '.hero-copy',
          title: 'Report Overview',
          intro: 'This banner introduces the dashboard and reminds you that all metrics are pulled from your latest KPI submissions.',
          position: 'bottom'
        },
        {
          element: '.product-selector',
          title: 'Product Selector',
          intro: 'Choose which product to view. All the metrics, charts, and health scores below update instantly when you switch products.',
          position: 'left'
        },
        {
          element: '.hero-product-meta',
          title: 'Product Price',
          intro: 'Shows the selected product\'s price in ZAR at a glance.',
          position: 'left'
        },
        {
          element: '.hero-metrics-grid',
          title: 'Key Metrics',
          intro: 'Your top-line numbers at a glance — Revenue Generated, Call Attendance rate, Deal Close Rate, and Monthly Recurring Revenue.',
          position: 'bottom'
        },
        {
          element: '.panel-dark',
          title: 'Conversion Funnel',
          intro: 'Tracks your pipeline from outreach attempts through calls booked, calls attended, deals attempted, and deals closed. Spot where leads drop off.',
          position: 'bottom'
        },
        {
          element: '.panel-accent',
          title: 'Operational Snapshot',
          intro: 'Quick facts — Product ID, Team Close Rate, Leader Activity Level, and when the data was last updated.',
          position: 'left'
        },
        {
          element: '.revenue-chart',
          title: 'Revenue Lens',
          intro: 'A bar chart breaking down revenue across KPI dimensions — Revenue Generated, MRR, Long-Term Growth, and Deals Influenced value.',
          position: 'top'
        },
        {
          element: '.health-grid',
          title: 'Business Health',
          intro: 'Ring gauges for Client Retention, Team Performance, Brand Compliance, and Leadership Stability. Each shows a percentage score.',
          position: 'top'
        },
        {
          element: '.panel-soft',
          title: 'Operating Metrics',
          intro: 'A detailed table of supporting KPIs — outreach, follow-ups, pipeline value, customer satisfaction, and more.',
          position: 'top'
        },
        {
          title: 'You\'re Ready!',
          intro: 'Select a product, review your numbers, and use the KPI floating button to submit new reports. Pull down to refresh anytime!'
        }
      ],
      showProgress: true,
      showBullets: true,
      exitOnOverlayClick: false,
      doneLabel: 'Got it!',
      nextLabel: 'Next →',
      prevLabel: '← Back',
      showStepNumbers: false,
      overlayOpacity: 0.7,
      tooltipClass: 'pz-intro-tooltip'
    });

    intro.start();
  }
}
