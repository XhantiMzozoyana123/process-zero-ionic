import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth-service';
import { MessengerService } from 'src/app/services/messenger.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: false
})
export class AdminPage implements OnInit {
  unreadCount = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private messengerService: MessengerService
  ) {}

  ngOnInit() {
    this.messengerService.getConversations().subscribe(conversations => {
      this.unreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
    });
  }

  openMessenger(): void {
    this.router.navigate(['/admin/messenger']);
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}
