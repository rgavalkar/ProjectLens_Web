import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
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

  projects: any[] = [];
  loggedInUsername: string = '';
  searchText: string = '';
  loading: boolean = false;

  toastMessage: string = '';
  showToast: boolean = false;

  // ================= PAGINATION =================
  currentPage: number = 1;
  itemsPerPage: number = 10;
  pageSizeOptions: number[] = [10, 20, 50, 100, 200];

  // ================= SHARE POPUP =================
  showSharePopup: boolean = false;
  selectedProject: any = null;

  shareForm = {
    name: '',
    to: '',
    cc: ''
  };

  constructor(
    private projectService: ProjectService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadProjects();
    this.loggedInUsername = localStorage.getItem('username') || 'User';
  }

  loadProjects(): void {
    this.loading = true;
    this.projectService.getProjects().subscribe({
      next: (response: any) => {
        this.projects = response?.data || response || [];
        this.loading = false;
        this.currentPage = 1; 
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // ================= FILTER =================
  get filteredProjects(): any[] {

    const search = this.searchText?.toLowerCase().trim();

    if (!search) return this.projects;

    return this.projects.filter(project =>
      (project.poNumber || '').toLowerCase().includes(search) ||
      (project.bolNumber || '').toLowerCase().includes(search) ||
      (project.fileName || '').toLowerCase().includes(search)
    );
  }

  // ================= PAGINATION =================
  get totalItems(): number {
    return this.filteredProjects.length;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get paginatedProjects(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredProjects.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToFirst() {
    this.currentPage = 1;
  }

  goToLast() {
    this.currentPage = this.totalPages;
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
  }

  // ================= VIEW =================
  viewProject(project: any) {
    if (!project?.shareLink) {
      alert('View link not available from API');
      return;
    }
    window.open(project.shareLink, '_blank', 'noopener,noreferrer');
  }

  // ================= download =================
  downloadProject(project: any) {

    if (!project?.blobUrl) {
      alert('Download link not available from API');
      return;
    }
    window.open(project.blobUrl, '_blank', 'noopener,noreferrer');
  }

  // ================= SHARE =================
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

    this.projectService.sendEmail(payload).subscribe({
      next: () => {
        this.closeSharePopup();
        this.showToastMessage('Email sent successfully');
      },
      error: () => {
        this.showToastMessage('Failed to send email');
      }
    });
  }

  logout() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigateByUrl('/login');
  }

  showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
}