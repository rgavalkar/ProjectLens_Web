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

        // Adjust if backend key is different
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

  // ================= VIEW BUTTON =================
  viewProject(project: any) {
    const newTab = window.open('', '_blank');

    if (newTab) {
      newTab.document.write(`
        <html>
          <head>
            <title>${project.fileName}</title>
            <style>
              body { font-family: Arial; padding: 30px; background: #f4f9ff; }
              h1 { color: #1e3a8a; }
              img { max-width: 300px; margin-top: 20px; border-radius: 12px; }
              .card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 6px 16px rgba(0,0,0,0.1); }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>${project.fileName}</h1>
              <p><b>Created On:</b> ${new Date(project.createdOn).toLocaleString()}</p>
              <img src="assets/icons/image_icon.jpg" />
            </div>
          </body>
        </html>
      `);
    }
  }

  // ================= DOWNLOAD BUTTON =================
  downloadPDF(project: any) {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(project.fileName, 20, 20);

    doc.setFontSize(12);
    doc.text(`Created On: ${new Date(project.createdOn).toLocaleString()}`, 20, 35);

    doc.text("Project Image:", 20, 55);

    const img = new Image();
    img.src = 'assets/icons/image_icon.jpg';

    img.onload = () => {
      doc.addImage(img, 'JPEG', 20, 65, 60, 60);
      doc.save(`${project.fileName}.pdf`);
    };
  }

}
