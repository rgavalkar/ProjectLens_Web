// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-project-list',
//   imports: [],
//   templateUrl: './project-list.component.html',
//   styleUrl: './project-list.component.css'
// })
// export class ProjectListComponent {

// }


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
  isSidebarOpen: boolean = false; // Track sidebar visibility

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (response: any) => this.projects = response,
      error: (err) => console.error('API error', err)
    });
  }

  get filteredProjects(): any[] {
    if (!this.searchText) return this.projects;
    return this.projects.filter(project =>
      project.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}

