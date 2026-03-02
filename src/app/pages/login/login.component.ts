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
 
  login() {
 
    this.errorMessage = '';
 
    if (!this.credentials.userId && !this.credentials.password) {
      this.errorMessage = 'User ID and Password are required';
      return;
    }
 
    if (!this.credentials.userId) {
      this.errorMessage = 'User ID is required';
      return;
    }
 
    if (!this.credentials.password) {
      this.errorMessage = 'Password is required';
      return;
    }
 
    this.userService.login(this.credentials).subscribe({
      next: (res: any) => {
 
  console.log('Login Successful:', res);
 
  localStorage.setItem('isLoggedIn', 'true');
 
  // 🔥 Call GetUsers to fetch role
  this.userService.getUsers().subscribe({
    next: (users: any[]) => {
 
      const matchedUser = users.find(
        (u: any) =>
          u.userID.toLowerCase() === this.credentials.userId.toLowerCase()
      );
 
      if (matchedUser) {
 
        // ✅ Store full user object
        localStorage.setItem(
          'currentUser',
          JSON.stringify(matchedUser)
        );
 
        localStorage.setItem(
          'username',
          matchedUser.userName
        );
 
      } else {
 
        // Fallback safety
        localStorage.setItem(
          'currentUser',
          JSON.stringify({
            userID: this.credentials.userId,
            userName: this.credentials.userId,
            isAdmin: false
          })
        );
      }
 
      this.router.navigate(['/dashboard']);
    },
    error: () => {
      this.errorMessage = 'Unable to fetch user details';
    }
  });
},
      error: () => {
        this.errorMessage = 'Invalid User ID or Password';
      }
    });
  }
}