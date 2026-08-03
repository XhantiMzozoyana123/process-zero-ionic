import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PayShapService } from 'src/app/services/payshap.service';
import { CreatePayShapOrderResponse, SubmitPaymentProofResponse } from 'src/app/models/dtos/pay-shap-dtos.model';

@Component({
  selector: 'app-payshap-payment-modal',
  templateUrl: './payshap-payment-modal.component.html',
  styleUrls: ['./payshap-payment-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class PayShapPaymentModalComponent implements OnInit, OnDestroy {
  @Input() payShapOrder!: CreatePayShapOrderResponse;
  @Input() packageId!: number;

  selectedScreenshot: string | null = null;
  screenshotPreview: string | null = null;
  bankTransactionReference: string = '';
  isSubmitting = false;
  submitSuccess: string | null = null;
  submitError: string | null = null;
  verificationMessage: string | null = null;
  isUnderReview = false;
  verificationFailed = false;

  // Step management
  currentStep = 1; // 1: Instructions, 2: Capture proof, 3: Verification

  // Camera properties
  showCamera = false;
  videoElement: any;
  canvasElement: any;
  stream: MediaStream | null = null;

  constructor(
    private modalController: ModalController,
    private payShapService: PayShapService
  ) {}

  ngOnInit() {
    if (!this.payShapOrder) {
      this.submitError = 'No payment order data received.';
      return;
    }
    this.currentStep = 1;
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  goToStep(step: number) {
    this.currentStep = step;
    if (step === 2 && !this.showCamera && !this.selectedScreenshot) {
      setTimeout(() => {
        this.openCamera();
      }, 500);
    }
  }

  nextStep() {
    if (this.currentStep < 3) {
      this.goToStep(this.currentStep + 1);
    }
  }

  async openCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });

      this.showCamera = true;
      this.submitError = null;

      setTimeout(() => {
        this.videoElement = document.getElementById('cameraVideo') as HTMLVideoElement;
        this.canvasElement = document.getElementById('cameraCanvas') as HTMLCanvasElement;
        if (this.videoElement && this.stream) {
          this.videoElement.srcObject = this.stream;
          this.videoElement.play();
        }
      }, 100);
    } catch (error) {
      console.error('Camera access error:', error);
      this.submitError = 'Unable to access camera. Please use file upload instead.';
      this.showCamera = false;
    }
  }

  capturePhoto() {
    if (!this.videoElement || !this.canvasElement) return;

    const context = this.canvasElement.getContext('2d');
    if (!context) return;

    this.canvasElement.width = this.videoElement.videoWidth;
    this.canvasElement.height = this.videoElement.videoHeight;

    context.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);

    this.selectedScreenshot = this.canvasElement.toDataURL('image/jpeg', 0.9);
    this.screenshotPreview = this.selectedScreenshot;

    this.stopCamera();
    this.submitError = null;

    // Move to step 3 and show processing state immediately
    this.currentStep = 3;
    this.isSubmitting = true;
    this.verificationMessage = 'Capturing and submitting payment proof...';

    // Auto-submit payment proof after a brief delay
    setTimeout(() => {
      this.submitPaymentProof();
    }, 300);
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.showCamera = false;
    this.videoElement = null;
    this.canvasElement = null;
  }

  clearScreenshot() {
    this.selectedScreenshot = null;
    this.screenshotPreview = null;
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.submitError = 'Please select an image file.';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.submitError = 'Image size must be less than 5MB.';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.selectedScreenshot = e.target.result;
      this.screenshotPreview = e.target.result;
      this.submitError = null;
    };
    reader.readAsDataURL(file);
  }

  submitPaymentProof() {
    if (!this.selectedScreenshot) {
      this.submitError = 'Please capture or upload a screenshot of your payment confirmation.';
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;
    this.verificationMessage = 'Submitting payment proof and running AI verification...';

    console.log('Submitting payment proof for order:', this.payShapOrder.orderId);

    this.payShapService.submitPaymentProof(
      this.payShapOrder.orderId,
      this.selectedScreenshot,
      this.bankTransactionReference || undefined
    ).subscribe({
      next: (res: SubmitPaymentProofResponse) => {
        console.log('Payment proof submitted:', res);
        this.isSubmitting = false;

        if (res.success) {
          if (res.verificationPassed) {
            // AI verification passed — credits have been added
            this.submitSuccess = res.message;
            this.verificationMessage = null;
            this.verificationFailed = false;
            this.isUnderReview = false;
            this.currentStep = 3;

            setTimeout(() => {
              this.modalController.dismiss({
                shouldRefresh: true,
                success: true,
                message: res.message,
                status: res.status
              });
            }, 4000);
          } else {
            // AI verification failed — image is invalid, do NOT add credits
            // The user should retry with a clearer screenshot
            this.verificationFailed = true;
            this.verificationMessage = res.message;
            this.submitSuccess = null;
            this.submitError = null;
            this.isUnderReview = false;
            this.currentStep = 3;
          }
        } else {
          this.submitError = res.message || 'Failed to submit payment proof.';
        }
      },
      error: (err) => {
        this.isSubmitting = false;

        // Extract actual error message from server response
        let errorMessage = 'Failed to submit payment proof. Please try again.';
        if (err?.error?.message) {
          errorMessage = err.error.message;
        } else if (err?.error?.detail) {
          errorMessage = err.error.detail;
        } else if (err?.message) {
          errorMessage = err.message;
        }

        this.submitError = errorMessage;
        this.verificationMessage = null;
        this.isUnderReview = false;
        this.verificationFailed = false;
        console.error('Payment proof submission error:', err);

        this.currentStep = 3;
        this.submitSuccess = null;
      }
    });
  }

  /**
   * Retry uploading a payment screenshot after AI verification determined
   * the previous image was invalid or incomplete.
   * Resets all state and returns the user to the capture/upload step.
   */
  retryVerification() {
    this.clearScreenshot();
    this.verificationFailed = false;
    this.submitSuccess = null;
    this.submitError = null;
    this.verificationMessage = null;
    this.isUnderReview = false;
    this.isSubmitting = false;
    this.currentStep = 2;
    // Auto-open camera after a brief delay so the user can quickly retake the photo
    setTimeout(() => {
      this.openCamera();
    }, 500);
  }

  close() {
    this.stopCamera();
    this.modalController.dismiss({
      shouldRefresh: false,
      success: false
    });
  }
}
