import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth-service';
import { IntroService } from 'src/app/services/intro-service';
import { MessengerService } from 'src/app/services/messenger.service';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  standalone: false
})
export class AccountPage implements OnInit {
  isKpiModalOpen = false;
  isAdmin = false;
  unreadCount = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private introService: IntroService,
    private messengerService: MessengerService
  ) { }

  ngOnInit() {
    this.isAdmin = this.authService.isAdmin();
    this.messengerService.getConversations().subscribe(conversations => {
      this.unreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
    });

    if (!this.introService.hasSeenIntro()) {
      // Wait for the dashboard route to finish loading before starting tour
      this.router.events.pipe(
        filter(e => e instanceof NavigationEnd),
        take(1)
      ).subscribe(() => {
        setTimeout(() => this.introService.startTour(), 800);
      });
    }
  }

  startTour(): void {
    this.introService.resetIntro();
    this.introService.startTour();
  }

  openMessenger(): void {
    this.router.navigate(['/account/messenger']);
  }

  openKpiModal(): void {
    this.isKpiModalOpen = true;
  }

  closeKpiModal(): void {
    this.isKpiModalOpen = false;
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }

}
