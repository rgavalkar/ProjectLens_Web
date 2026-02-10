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
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login() {

    if(!this.credentials.userId){
      alert('Enter User ID');
      return;
    }

    //  CALL BACKEND
    this.userService.getUserById(this.credentials.userId)
      .subscribe({

        next: (res:any) => {

          // if user exists -> allow login
          if(res){
            alert('Login Successful');

            this.router.navigate(['/dashboard']);
          }
          else{
            alert('User not found');
          }
        },

        error: () => {
          alert('Invalid User ID');
        }

      });

  }
}
