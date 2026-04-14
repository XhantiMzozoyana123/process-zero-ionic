// src/app/bank-account/bank-account.page.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BankAccountService } from 'src/app/services/bankaccount-service';
import { BankAccount } from 'src/app/models/entities/bank-account.model';
import { ToastController } from '@ionic/angular';
import { IntroService } from 'src/app/services/intro-service';

@Component({
  selector: 'app-bank-account',
  standalone: false,
  templateUrl: './bank-account.page.html',
  styleUrls: ['./bank-account.page.scss'],
})
export class BankAccountPage implements OnInit {
  accountForm!: FormGroup;
  myAccount?: BankAccount;
  loading = false;
  submitting = false;
  isFormModalOpen = false;
  message = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private bankAccountService: BankAccountService,
    private toastCtrl: ToastController,
    private introService: IntroService
  ) {}

  ngOnInit() {
    this.accountForm = this.fb.group({
      accountHolderName: ['', [Validators.required, Validators.maxLength(200)]],
      accountNumber: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(64)]],
      bankName: ['', Validators.maxLength(200)],
      bankCode: ['', Validators.maxLength(20)],
    });

    this.loadMyAccount();
  }

  startTour(): void {
    this.introService.startBankAccountTour();
  }

  isInvalid(controlName: string): boolean {
    const control = this.accountForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  async loadMyAccount() {
    this.loading = true;
    this.errorMessage = '';

    this.bankAccountService.getMyAccount().subscribe({
      next: (account) => {
        this.myAccount = account;
        this.accountForm.patchValue({
          accountHolderName: account.accountHolderName,
          accountNumber: '',
          bankName: account.bankName,
          bankCode: account.bankCode,
        });
        this.loading = false;
      },
      error: async (err) => {
        this.loading = false;
        console.error(err);
        if (err.status !== 404) {
          this.errorMessage = 'Error loading bank account details.';
          const toast = await this.toastCtrl.create({
            message: 'Error loading account',
            duration: 2000,
            color: 'danger',
          });
          toast.present();
        }
      },
    });
  }


  openFormModal() {
    this.message = '';
    this.errorMessage = '';

    this.accountForm.reset({
      accountHolderName: this.myAccount?.accountHolderName ?? '',
      accountNumber: '',
      bankName: this.myAccount?.bankName ?? '',
      bankCode: this.myAccount?.bankCode ?? '',
    });

    this.isFormModalOpen = true;
  }

  closeFormModal() {
    this.isFormModalOpen = false;
  }

  async submit() {
    this.message = '';
    this.errorMessage = '';

    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      this.errorMessage = 'Please complete required fields.';
      return;
    }

    this.submitting = true;

    const formValue = this.accountForm.getRawValue();
    const account: BankAccount = {
      accountHolderName: formValue.accountHolderName.trim(),
      accountNumber: formValue.accountNumber.trim(),
      bankName: formValue.bankName?.trim() || undefined,
      bankCode: formValue.bankCode?.trim() || undefined,
    };

    if (this.myAccount) {
      this.bankAccountService.update(account).subscribe(async () => {
        this.submitting = false;
        this.message = 'Bank account updated.';
        this.closeFormModal();
        const toast = await this.toastCtrl.create({
          message: 'Bank account updated!',
          duration: 2000,
          color: 'success',
        });
        toast.present();
        this.loadMyAccount();
      }, async () => {
        this.submitting = false;
        this.errorMessage = 'Could not update bank account.';
        const toast = await this.toastCtrl.create({
          message: 'Failed to update account',
          duration: 2000,
          color: 'danger',
        });
        toast.present();
      });
    } else {
      this.bankAccountService.create(account).subscribe(async (res) => {
        this.submitting = false;
        this.message = 'Bank account created.';
        this.closeFormModal();
        const toast = await this.toastCtrl.create({
          message: 'Bank account created!',
          duration: 2000,
          color: 'success',
        });
        toast.present();
        this.loadMyAccount();
      }, async () => {
        this.submitting = false;
        this.errorMessage = 'Could not create bank account.';
        const toast = await this.toastCtrl.create({
          message: 'Failed to create account',
          duration: 2000,
          color: 'danger',
        });
        toast.present();
      });
    }
  }
}