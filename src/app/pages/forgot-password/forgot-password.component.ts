import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {

  userId = '';
  newPassword = '';

  errorMessage = '';
  successMessage = '';

  resetPassword() {

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.userId || !this.newPassword) {
      this.errorMessage = 'User ID and New Password are required';
      return;
    }

    // UI success only (no API yet)
    this.successMessage = 'Password reset successful';
  }
}