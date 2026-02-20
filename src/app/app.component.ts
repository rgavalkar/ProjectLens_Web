import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,
    HttpClientModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  isLoginPage = false;
  isExpanded = false;
  loggedInUsername = '';
  searchText = '';

  // ================= PAGINATION =================
  itemsPerPage = 10;
  pageSizeOptions = [5, 10, 20, 50];

  currentPage = 1;
  totalPages = 1;
  totalItems = 0;

  pageStart = 0;
  displayEnd = 0;

  showPagination = true;

  // ================= DATA =================
  allProjects: any[] = [];
  filteredProjects: any[] = [];
  paginatedProjects: any[] = [];

  private apiUrl = 'https://your-api-url.com/api/projects';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isLoginPage = event.urlAfterRedirects.includes('login');
      });
  }

  ngOnInit(): void {
    this.loadLoggedInUser();

    if (!this.router.url.includes('login')) {
      this.fetchProjects();
    }
  }

  // ================= SIDEBAR =================
  toggleSidebarExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  // ================= USER =================
  loadLoggedInUser(): void {
    const user = localStorage.getItem('username');
    this.loggedInUsername = user ? user : 'Admin';
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  goToDashboard(): void {
  this.router.navigate(['/dashboard']);
}

  openUsersSection(): void {
    this.router.navigate(['/users']);
  }

  // ================= SEARCH =================
  focusSearch(input: HTMLInputElement): void {
    input.focus();
  }

 onSearchChange(): void {

  const search = (this.searchText || '').toLowerCase().trim();

  // If projects not loaded yet, stop
  if (!this.allProjects || this.allProjects.length === 0) {
    return;
  }

  if (!search) {
    this.filteredProjects = [...this.allProjects];
  } else {
    this.filteredProjects = this.allProjects.filter(project =>
      (project.poNumber || '').toLowerCase().includes(search) ||
      (project.bolNumber || '').toLowerCase().includes(search) ||
      (project.fileName || '').toLowerCase().includes(search)
    );
  }

  // Reset to first page
  this.currentPage = 1;

  // Update pagination after filtering
  this.updatePagination();
}
  // ================= API =================
  fetchProjects(): void {

    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.get<any[]>(this.apiUrl, { headers })
      .subscribe({
        next: (response) => {
          this.allProjects = response || [];
          this.filteredProjects = [...this.allProjects];
          this.currentPage = 1;
          this.updatePagination();
          this.onSearchChange();  
        },
        error: (error) => {
          console.error('API Error:', error);
        }
      });
  }

  // ================= PAGINATION LOGIC =================
  updatePagination(): void {

    this.totalItems = this.filteredProjects.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

    if (this.totalPages === 0) {
      this.totalPages = 1;
    }

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    this.pageStart = (this.currentPage - 1) * this.itemsPerPage;
    this.displayEnd = Math.min(
      this.pageStart + this.itemsPerPage,
      this.totalItems
    );

    this.paginatedProjects = this.filteredProjects.slice(
      this.pageStart,
      this.displayEnd
    );
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
    this.updatePagination();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  goToFirst(): void {
    this.currentPage = 1;
    this.updatePagination();
  }

  goToLast(): void {
    this.currentPage = this.totalPages;
    this.updatePagination();
  }

}