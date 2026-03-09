import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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
  confirmPassword = '';

  errorMessage = '';
  successMessage = '';


  showNewPassword = false;
  showConfirmPassword = false;

  constructor(private router: Router) { }

 
  toggleNewPassword() {
    this.showNewPassword = !this.showNewPassword;
  }

 
  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  resetPassword() {

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.userId || !this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'All fields are required';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.successMessage = 'Password reset successful';
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

}