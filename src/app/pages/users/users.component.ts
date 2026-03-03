import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import * as CryptoJS from 'crypto-js';

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

  isEditMode: boolean = false;
  selectedUserID: string = '';
  currentUser: any = null;
  isAdminUser: boolean = false;
  // dataLoaded: boolean = false;

  // ================= PAGINATION =================
  currentPage: number = 1;
  itemsPerPage: number = 10;
  pageSizeOptions: number[] = [10, 20, 25, 50, 100, 200];

  get totalItems(): number {
    return this.filteredUsers.length;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  newUser: any = {
    userID: '',
    userName: '',
    userEmail: '',
    password: '',
    isAdmin: false
  };

  constructor(private userService: UserService) { }

  ngOnInit(): void {

    const storedUser = localStorage.getItem('currentUser');

    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
      this.isAdminUser = this.currentUser?.isAdmin === true;
    }

    this.loadUsers();
  }

  // ================= LOAD USERS =================
  loadUsers(): void {
    this.loading = true;

    this.userService.getUsers().subscribe({
      next: (response: any) => {

        const usersList = response?.data ? response.data : response;

        this.users = (usersList || []).filter((user: any) =>
          user.isDeleted !== true &&
          user.IsDeleted !== true &&
          user.deleted !== true
        );

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

  // ================= PAGINATED USERS =================
  get paginatedUsers(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, endIndex);
  }

  // ================= OPEN MODAL =================
  openModal(): void {
    this.showModal = true;
    this.isEditMode = false;
  }

  // ================= CLOSE MODAL =================
  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.selectedUserID = '';
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
    // 🔐 HASH PASSWORD HERE
    const hashedPassword = CryptoJS.SHA256(this.newUser.password).toString();

    const userPayload = {
      ...this.newUser,
      password: hashedPassword
    };

    this.userService.createUser(userPayload).subscribe({

      next: () => {
        alert('User created successfully');
        this.closeModal();
        this.loadUsers();
      },

      error: () => {
        alert('Failed to create user');
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // ================= EDIT USER =================
  editUser(user: any): void {

    this.isEditMode = true;
    this.selectedUserID = user.userID;

    this.newUser = {
      userID: user.userID,
      userName: user.userName,
      userEmail: user.userEmail,
      password: '',
      isAdmin: user.isAdmin
    };

    this.showModal = true;
  }

  // ================= VIEW USER (NON ADMIN) =================
  viewUser(user: any): void {

    this.isEditMode = true;

    this.newUser = {
      userID: user.userID,
      userName: user.userName,
      userEmail: user.userEmail,
      password: '',
      isAdmin: user.isAdmin
    };

    this.showModal = true;
  }
  // ================= UPDATE USER =================
  updateUser(): void {

    if (!this.newUser.userName || !this.newUser.userEmail) {
      alert('Username and Email are required');
      return;
    }

    const updatePayload = {
      userName: this.newUser.userName,
      userEmail: this.newUser.userEmail,
      isAdmin: this.newUser.isAdmin,
      password: this.newUser.password
        ? CryptoJS.SHA256(this.newUser.password).toString()
        : undefined
    };

    this.userService.updateUser(this.selectedUserID, updatePayload)
      .subscribe({

        next: () => {

          alert('User updated successfully');

          const index = this.users.findIndex(
            u => u.userID === this.selectedUserID
          );

          if (index !== -1) {
            this.users[index] = {
              ...this.users[index],
              ...updatePayload
            };
          }

          this.closeModal();
        },

        error: () => {
          alert('Failed to update user');
        }
      });
  }

  // ================= DELETE USER =================
  deleteUser(user: any): void {

    if (!confirm(`Delete user ${user.userName}?`)) return;

    this.userService.deleteUser(user.userID).subscribe({

      next: (response: any) => {

        const result = response?.data ? response.data : response;

        if (result?.isSuccess === true ||
          result?.extError === "UserID Already deleted") {

          alert("User deleted successfully");

          this.users = this.users.filter(
            u => u.userID !== user.userID
          );
        }
        else {
          alert(result?.extError || "Delete failed");
        }
      },

      error: () => {
        alert("Failed to delete user");
      }
    });
  }

  // ================= PAGINATION =================
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToFirst(): void {
    this.currentPage = 1;
  }

  goToLast(): void {
    this.currentPage = this.totalPages;
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
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