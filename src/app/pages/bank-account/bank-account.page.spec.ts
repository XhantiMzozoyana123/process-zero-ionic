import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BankAccountPage } from './bank-account.page';

describe('BankAccountPage', () => {
  let component: BankAccountPage;
  let fixture: ComponentFixture<BankAccountPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BankAccountPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
