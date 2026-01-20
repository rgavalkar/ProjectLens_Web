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

  constructor(private projectService: ProjectService) {}

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

  // ================= VIEW BUTTON (BLUE HEADER) =================
 // ================= VIEW BUTTON (FIXED) =================
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
}