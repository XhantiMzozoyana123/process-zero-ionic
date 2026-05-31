import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-oauth-result',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-content>
      <div class="result-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Returning to Relay...</p>
      </div>
    </ion-content>
  `,
  styles: [`
    .result-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 1rem;
    }
  `],
})
export class OAuthResultComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const outcome = this.route.snapshot.data['outcome'];
    const email = this.route.snapshot.queryParamMap.get('email');
    const message = this.route.snapshot.queryParamMap.get('message');

    void this.router.navigate(['/account/relay-user'], {
      queryParams: {
        oauth: outcome,
        email,
        message,
      },
      replaceUrl: true,
    });
  }
}