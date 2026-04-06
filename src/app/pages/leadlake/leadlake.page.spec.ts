import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LeadlakePage } from './leadlake.page';

describe('LeadlakePage', () => {
  let component: LeadlakePage;
  let fixture: ComponentFixture<LeadlakePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LeadlakePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
