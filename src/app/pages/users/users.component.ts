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

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // ================= LOAD USERS =================
  loadUsers(): void {
    this.loading = true;

    this.userService.getUsers().subscribe({
      next: (response: any) => {

        // If API returns array directly
        this.users = response?.data || response || [];

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
      user.username?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.userID?.toLowerCase().includes(search)
    );
  }

  // ================= DELETE USER =================
  deleteUser(user: any): void {

    if (!confirm(`Delete user ${user.username}?`)) return;

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
}