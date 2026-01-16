import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';

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

        // ✅ adjust only if backend key is different
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
}
