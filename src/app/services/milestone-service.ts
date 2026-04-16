import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Milestone } from '../models/milestone.model';
import { AssessmentService } from './assessment-service';
import { ContactService } from './contact-service';
import { MeetingService } from './meeting-service';

const STORAGE_KEY = 'milestones_progress';

@Injectable({
  providedIn: 'root'
})
export class MilestoneService {

  constructor(
    private assessmentService: AssessmentService,
    private contactService: ContactService,
    private meetingService: MeetingService
  ) {}

  /** Returns cached milestones instantly if available, then always fetches fresh from APIs. */
  getCached(): Milestone[] | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /** Fetches milestone state from the live APIs and saves to localStorage. */
  getMilestones(): Observable<Milestone[]> {
    return forkJoin({
      assessmentPassed: this.assessmentService.getMyGlobalResult().pipe(
        map(r => r.passed),
        catchError(() => of(false))
      ),
      contacts: this.contactService.getMine().pipe(
        catchError(() => of([]))
      ),
      meetings: this.meetingService.getUserMeetings().pipe(
        catchError(() => of([]))
      )
    }).pipe(
      map(({ assessmentPassed, contacts, meetings }) => {
        const hasContacts = contacts.length > 0;
        const hasMeetings = meetings.length > 0;

        return this.buildMilestones(assessmentPassed, hasContacts, hasMeetings);
      }),
      tap(milestones => this.saveToStorage(milestones))
    );
  }

  /** Mark a single milestone as complete locally (optimistic update). */
  markComplete(milestoneId: string): void {
    const cached = this.getCached();
    if (!cached) return;
    const m = cached.find(x => x.id === milestoneId);
    if (m) {
      m.completed = true;
      this.saveToStorage(cached);
    }
  }

  clearCache(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  private buildMilestones(assessmentPassed: boolean, hasContacts: boolean, hasMeetings: boolean): Milestone[] {
    return [
      {
        id: 'assessment',
        step: 1,
        title: 'Pass the Product Assessment',
        description: 'Take and pass the assessment to prove your product knowledge and unlock the platform.',
        icon: 'school-outline',
        route: '/account/assessments',
        completed: assessmentPassed,
        loading: false
      },
      {
        id: 'product-assessment',
        step: 2,
        title: 'Take a Product Assessment',
        description: 'Complete a product assessment to qualify for selling that product to your contacts.',
        icon: 'clipboard-outline',
        route: '/account/products',
        completed: assessmentPassed,
        loading: false
      },
      {
        id: 'browse-leads',
        step: 3,
        title: 'Browse the Lead Lake',
        description: 'Explore the Lead Lake to discover prospects you can reach out to.',
        icon: 'globe-outline',
        route: '/account/leadlake',
        completed: assessmentPassed && hasContacts,
        loading: false
      },
      {
        id: 'add-contact',
        step: 4,
        title: 'Add a Lead to My Contacts',
        description: 'Promote a lead from the Lead Lake into your personal contact list.',
        icon: 'person-add-outline',
        route: '/account/contacts',
        completed: hasContacts,
        loading: false
      },
      {
        id: 'book-meeting',
        step: 5,
        title: 'Book a Meeting',
        description: 'Schedule a meeting with one of your contacts when they agree to talk.',
        icon: 'calendar-outline',
        route: '/account/meetings',
        completed: hasMeetings,
        loading: false
      }
    ];
  }

  private saveToStorage(milestones: Milestone[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(milestones));
    } catch { }
  }
}
