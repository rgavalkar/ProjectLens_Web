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
      },
      error: () => {
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

  // ================= VIEW =================
  viewProject(project: any) {
    if (!project?.shareLink) {
      alert('View link not available from API');
      return;
    }
    window.open(project.shareLink, '_blank', 'noopener,noreferrer');
  }

  // ================= DOWNLOAD =================
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
        alert('Email sent successfully');
        this.closeSharePopup();
      },
      error: () => {
        alert('Failed to send email');
      }
    });
  }

  logout() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigateByUrl('/login');
  }

}