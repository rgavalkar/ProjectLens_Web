import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  showPassword = false;
  errorMessage: string = '';

  credentials = {
    userId: '',
    password: ''
  };

  constructor(
    private router: Router,
    private userService: UserService
  ) { }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  goToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  login() {

    this.errorMessage = '';

    if (!this.credentials.userId || !this.credentials.password) {
      this.errorMessage = 'User ID and Password are required';
      return;
    }

    // 🔐 HASH PASSWORD BEFORE LOGIN
    const hashedPassword = CryptoJS.SHA256(this.credentials.password).toString();

    const loginPayload = {
      userID: this.credentials.userId,
      password: hashedPassword,
      appKey: '47d23b50-b690-4f74-a3fc-d587339f7d60'
    };

    this.userService.login(loginPayload).subscribe({
      next: (res: any) => {

        console.log('Login Successful:', res);

        localStorage.setItem('isLoggedIn', 'true');

        this.userService.getUsers().subscribe({
          next: (users: any[]) => {

            const matchedUser = users.find(
              (u: any) =>
                u.userID.toLowerCase() === this.credentials.userId.toLowerCase()
            );

            if (matchedUser) {

              localStorage.setItem(
                'currentUser',
                JSON.stringify(matchedUser)
              );

              localStorage.setItem(
                'username',
                matchedUser.userName
              );
            }

            this.router.navigate(['/dashboard']);
          }
        });
      },

      error: () => {
        this.errorMessage = 'Invalid User ID or Password';
      }
    });
  }
}
