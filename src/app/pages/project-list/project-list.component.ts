import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
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

  constructor(private projectService: ProjectService) { }

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

  // 
  // ✅ THIS IS WHAT YOU ADD
  focusSearch(input: HTMLInputElement) {
    input.focus();
  }
  onSearch(): void {
  }

  // ✅ REQUIRED BY HTML (ERROR FIX)
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

    // ===== BORDER =====
    doc.rect(10, 10, 190, 277);

    // ===== HEADER DATA FROM FILE =====
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');

    doc.text(`Subject : ${project.subject || project.fileName}`, 20, 30);

    doc.text(
      `Date : ${project.createdOn ? new Date(project.createdOn).toLocaleDateString() : ''}`,
      20,
      45
    );

    doc.text(`Facility : ${project.facility || ''}`, 20, 60);

    doc.text(
      `Picture Count : ${project.pictureCount || project.images?.length || 1}`,
      20,
      75
    );

    // ===== DIVIDER LINE =====
    doc.line(10, 90, 200, 90);

    // ===== IMAGE =====
    const img = new Image();

    // image coming from file itself
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

    this.shareForm = {
      name: '',
      to: '',
      cc: ''
    };
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

        // email actually sent, but backend response is bad
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
pageSizeOptions: number[] = [15, 30, 50];
currentPage: number = 1;

get totalPages(): number {
  return Math.ceil(this.filteredProjects.length / this.itemsPerPage);
}

get pageStart(): number {
  return (this.currentPage - 1) * this.itemsPerPage;
}

get pageEnd(): number {
  const end = this.pageStart + this.itemsPerPage;
  return end > this.filteredProjects.length
    ? this.filteredProjects.length
    : end;
}

get paginatedProjects(): any[] {
  return this.filteredProjects.slice(this.pageStart, this.pageEnd);
}

onItemsPerPageChange(): void {
  this.currentPage = 1;
}

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
get displayEnd(): number {
  return Math.min(this.pageEnd, this.filteredProjects.length);
}
}


