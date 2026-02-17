import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { UserService } from '../../services/user.service';

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
    this.userService.getUsers().subscribe((users: any[]) => {
      const matchedUser = users.find(
        u => u.userID === this.credentials.userId
      );

      if (matchedUser) {
        localStorage.setItem('username', matchedUser.userName);
      } else {
        localStorage.setItem('username', this.credentials.userId);
      }

      this.router.navigate(['/dashboard']);
    });

  },
      error: () => {
        this.errorMessage = 'Invalid User ID or Password';
      }
    });
  }
}
