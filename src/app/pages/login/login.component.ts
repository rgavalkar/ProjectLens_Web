import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  showPassword = false;

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
  if (!this.credentials.userId || !this.credentials.password) {
    alert('Enter User ID and Password');
    return;
  }

  this.userService.login(this.credentials).subscribe({
    next: (res: any) => {
      console.log('Login Successful');
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 300);
    },
    error: () => {
      alert('Invalid User ID or Password');
    }
  });
}
}


