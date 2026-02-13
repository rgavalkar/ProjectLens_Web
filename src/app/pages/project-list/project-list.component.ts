import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
 

import jsPDF from 'jspdf';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit {

  userSearchText: string = '';
  allUsers: any[] = [];
  filteredUsers: any[] = [];
  projects: any[] = [];
  searchText: string = '';
  isSidebarOpen: boolean = false;
  loading: boolean = false;

  // ================= SHARE POPUP VARIABLES =================
  showSharePopup: boolean = false;
  selectedProject: any = null;

  shareForm = {
    name: '',
    to: '',
    cc: ''
  };

  constructor(
    private projectService: ProjectService,
    private userService: UserService,
    private router: Router
  ) { }


  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    this.projectService.getProjects().subscribe({
      next: (response: any) => {
        console.log('API RESPONSE:', response);
        this.projects = response?.data || response || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('API error', err);
        this.loading = false;
      }
    });
  }

  get filteredProjects(): any[] {
    if (!this.searchText) return this.projects;
    return this.projects.filter(project =>
      project.fileName?.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  isExpanded = false;

  toggleSidebarExpand() {
    this.isExpanded = !this.isExpanded;
  }

  focusSearch(input: HTMLInputElement) {
    input.focus();
  }

  onSearch(): void { }

  getTimeAgo(dateString: string): string {
    if (!dateString) return '';
    const createdDate = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - createdDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  }

  // ================= VIEW BUTTON  =================
  viewProject(project: any) {
    if (!project?.shareLink) {
      alert('View link not available from API');
      return;
    }
    window.open(project.shareLink, '_blank', 'noopener,noreferrer');
  }

  // ================= DOWNLOAD BUTTON =================
  downloadPDF(project: any) {
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.rect(10, 10, 190, 277);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');

    doc.text(`Subject : ${project.subject || project.fileName}`, 20, 30);
    doc.text(`Date : ${project.createdOn ? new Date(project.createdOn).toLocaleDateString() : ''}`, 20, 45);
    doc.text(`Facility : ${project.facility || ''}`, 20, 60);
    doc.text(`Picture Count : ${project.pictureCount || project.images?.length || 1}`, 20, 75);
    doc.line(10, 90, 200, 90);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = project.imageUrl || project.images?.[0];

    img.onload = () => {
      doc.addImage(img, 'JPEG', 45, 105, 120, 130);
      doc.save(`${project.fileName}.pdf`);
    };

    img.onerror = () => {
      doc.save(`${project.fileName}.pdf`);
    };
  }

  // ================= SHARE POPUP FUNCTIONS =================
  openSharePopup(project: any) {
    this.selectedProject = project;
    this.showSharePopup = true;
    this.shareForm = { name: '', to: '', cc: '' };
  }

  closeSharePopup() {
    this.showSharePopup = false;
  }

  sendEmail() {
    if (!this.shareForm.name || !this.shareForm.to) {
      alert('Name and To email are required');
      return;
    }

    if (!this.selectedProject?.id) {
      alert('Project ID not found');
      return;
    }

    const payload = {
      guid: this.selectedProject.id,
      senderName: this.shareForm.name,
      recipients: {
        to: [this.shareForm.to],
        cc: this.shareForm.cc ? [this.shareForm.cc] : []
      }
    };

    console.log('EMAIL PAYLOAD:', payload);

    this.projectService.sendEmail(payload).subscribe({
      next: () => {
        alert('Email sent successfully');
        this.closeSharePopup();
      },
      error: (err) => {
        console.error('Email error:', err);
        if (err?.status === 200 || err?.status === 0) {
          alert('Email sent successfully');
          this.closeSharePopup();
        } else {
          alert('Failed to send email');
        }
      }
    });
  }

  // ================= PAGINATION =================
  itemsPerPage: number = 15;
  pageSizeOptions: number[] = [15, 30, 50, 100];
  currentPage: number = 1;

  get totalPages(): number {
    return Math.ceil(this.filteredProjects.length / this.itemsPerPage);
  }

  get pageStart(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get pageEnd(): number {
    const end = this.pageStart + this.itemsPerPage;
    return end > this.filteredProjects.length ? this.filteredProjects.length : end;
  }

  get paginatedProjects(): any[] {
    return this.filteredProjects.slice(this.pageStart, this.pageEnd);
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  goToFirst(): void {
    this.currentPage = 1;
  }

  goToLast(): void {
    this.currentPage = this.totalPages;
  }

  get displayEnd(): number {
    return Math.min(this.pageEnd, this.filteredProjects.length);
  }

  // ================= USERS =================
  showUsersPopup = false;
  showCreateUserPopup = false;
  selectedUser: any = null;

  users: any[] = [];

  newUser = {
    username: '',
    userId: '',
    email: '',
    password: '',
    isAdmin: false
  };

  // ================= EDIT MODE =================
  isEditMode: boolean = false;
  editingUserId: string | null = null;
  copyEmailChecked = false;

  openUsersPopup() {
    this.showUsersPopup = true;
    this.loadUsers();
    this.userSearchText = '';
  }

  closeUsersPopup() {
    this.showUsersPopup = false;
  }

  openCreateUserPopup() {
    this.isEditMode = false;
    this.editingUserId = null;

    this.newUser = {
      username: '',
      userId: '',
      email: '',
      password: '',
      isAdmin: false
    };

    // this.showUsersPopup = false;
    this.showCreateUserPopup = true;
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (res: any) => {
        console.log("USERS API =", res);
        this.users = res || [];
        this.allUsers = [...this.users];
        this.filteredUsers = [...this.users];
      },
      error: (err) => {
        console.error(err);
        alert('Failed to load users');
      }
    });
  }
  filterUsers() {
    const text = this.userSearchText.toLowerCase().trim();

    if (!text) {
      this.filteredUsers = [...this.allUsers];
      return;
    }

    this.filteredUsers = this.allUsers.filter(user =>
      user.userName?.toLowerCase().includes(text) ||
      user.userEmail?.toLowerCase().includes(text) ||
      user.userID?.toLowerCase().includes(text)
    );
  }

  closeCreateUserPopup() {
    this.showCreateUserPopup = false;
    this.showUsersPopup = true;
  }

  // ================= CREATE USER (API CALL INTEGRATED) =================
  createUser() {
    if (
      !this.newUser.username ||
      !this.newUser.userId ||
      !this.newUser.email ||
      (!this.isEditMode && !this.newUser.password)
    ) {
      alert('Username, User ID, Email and Password are required');
      return;
    }
    if (this.isEditMode) {
      const index = this.users.findIndex(
        u => u.userID === this.editingUserId
      );

      if (index !== -1) {
        this.users[index] = {
          ...this.users[index],
          userName: this.newUser.username,
          userID: this.newUser.userId,
          userEmail: this.newUser.email,
          isAdmin: this.newUser.isAdmin
        };
      }
      this.allUsers = [...this.users];
      this.filteredUsers = [...this.users];
      alert('User updated successfully');
      this.closeCreateUserPopup();
      this.isEditMode = false;
      this.editingUserId = null;
      return;
    }
    const payload = {
      userID: this.newUser.userId,
      userName: this.newUser.username,
      userEmail: this.newUser.email,
      password: this.newUser.password,
      isAdmin: this.newUser.isAdmin
    };

    this.userService.createUser(payload).subscribe({
      next: () => {
        alert('User created successfully');
        this.loadUsers();
        this.closeCreateUserPopup();
      },
      error: (err) => {
        console.error(err);
        alert('Failed to create user');
      }
    });
  }
  onCopyEmailToggle() {
    if (this.copyEmailChecked) {
      this.newUser.userId = this.newUser.email || '';
    } else {
      this.newUser.userId = '';
    }
  }

  onEmailChange() {
    if (this.copyEmailChecked) {
      this.newUser.userId = this.newUser.email || '';
    }
  }

  onCopyEmailChange(event: any) {
    if (event.target.checked) {
      this.newUser.userId = this.newUser.email;
    }
  }

  // ================= PASSWORD VISIBILITY =================
  showPassword: boolean = false;
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  // ================= COPY EMAIL =================
  copyEmail(email: string) {
    if (!email) {
      alert('Email is empty');
      return;
    }
    navigator.clipboard.writeText(email);
    alert('Email copied to clipboard');
  }
  // ================= EDIT USER =================
  editUser(user: any) {
    console.log('EDIT USER:', user);

    this.isEditMode = true;
    this.editingUserId = user.userID;

    this.newUser = {
      username: user.userName,
      userId: user.userID,
      email: user.userEmail,
      password: '',
      isAdmin: user.isAdmin || false
    };

    // this.showUsersPopup = false;
    this.showCreateUserPopup = true;
  }


  // ================= DELETE USER =================
  deleteUser(user: any) {
    const confirmDelete = confirm(
      `Are you sure you want to delete user "${user.userName}"?`
    );

    if (!confirmDelete) return;

    console.log('DELETE USER:', user);

    // API call 
    this.userService.deleteUser(user.userID).subscribe({
      next: () => {
        alert('User deleted successfully');
        this.loadUsers();
      },
      error: (err) => {
        console.error(err);
        alert('Failed to delete user');
      }
    });
  }

  logout() {
  localStorage.clear();
  sessionStorage.clear();
  // window.location.href = '/login';
  this.router.navigateByUrl('/login');
}
}



