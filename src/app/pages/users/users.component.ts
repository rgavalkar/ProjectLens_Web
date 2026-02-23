import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  users: any[] = [];
  searchText: string = '';
  loading: boolean = false;

  showModal: boolean = false;
  copyEmail: boolean = false;
  showPassword: boolean = false;

  // MUST MATCH API STRUCTURE
  newUser: any = {
    userID: '',
    userName: '',
    userEmail: '',
    password: '',
    isAdmin: false
  };

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  // ================= LOAD USERS =================
  loadUsers(): void {
    this.loading = true;

    this.userService.getUsers().subscribe({
      next: (response: any) => {
        this.users = response || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading = false;
      }
    });
  }

  // ================= SEARCH FILTER =================
  get filteredUsers(): any[] {

    if (!this.searchText) return this.users;

    const search = this.searchText.toLowerCase();

    return this.users.filter(user =>
      user.userName?.toLowerCase().includes(search) ||
      user.userEmail?.toLowerCase().includes(search) ||
      user.userID?.toLowerCase().includes(search)
    );
  }

  // ================= OPEN MODAL =================
  openModal(): void {
    this.showModal = true;
  }

  // ================= CLOSE MODAL =================
  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  // ================= COPY EMAIL =================
  onCopyEmailChange(): void {
    if (this.copyEmail) {
      this.newUser.userID = this.newUser.userEmail;
    }
  }

  onEmailChange(): void {
    if (this.copyEmail) {
      this.newUser.userID = this.newUser.userEmail;
    }
  }

  // ================= CREATE USER =================
  createUser(): void {

    if (!this.newUser.userName ||
      !this.newUser.userEmail ||
      !this.newUser.userID ||
      !this.newUser.password) {

      alert('Please fill all required fields');
      return;
    }
    const userExists = this.users.some(
      user => user.userID.toLowerCase() === this.newUser.userID.toLowerCase()
    );

    if (userExists) {
      alert('User already exists');
      return;
    }

    this.userService.createUser(this.newUser).subscribe({

      next: (response: any) => {
        if (response && response.message === 'User already exists') {
          alert('User already exists');
          return;
        }

        alert('User created successfully');
        this.closeModal();
        this.loadUsers();
      },

      error: (error) => {
        console.error('Create failed:', error);
        if (error.status === 409) {
          alert('User already exists');
        }
        else {
          alert('Failed to create user');
        }
      }
    });
  }
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // ================= DELETE USER =================
  deleteUser(user: any): void {

    if (!confirm(`Delete user ${user.userName}?`)) return;

    this.userService.deleteUser(user.userID).subscribe({
      next: () => {
        alert('User deleted successfully');
        this.loadUsers();
      },
      error: (error) => {
        console.error('Delete failed:', error);
        alert('Failed to delete user');
      }
    });
  }

  // ================= RESET FORM =================
  resetForm(): void {
    this.newUser = {
      userID: '',
      userName: '',
      userEmail: '',
      password: '',
      isAdmin: false
    };

    this.copyEmail = false;
  }
}