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
  isLoginPage: boolean = false;
  isExpanded = false;
  loggedInUsername: string = '';
  searchText: string = '';
  itemsPerPage: number = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];

  currentPage: number = 1;
  totalPages: number = 1;
  totalItems: number = 0;

  pageStart: number = 0;
  displayEnd: number = 0;

  showPagination: boolean = true;

  allProjects: any[] = [];
  filteredProjects: any[] = [];


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

    // Only fetch projects if not login page
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
    this.router.navigate(['/']);
  }

  openUsersSection(): void {
    this.router.navigate(['/users']);
  }

  // ================= SEARCH =================

  focusSearch(input: HTMLInputElement): void {
    input.focus();
  }

  onSearchChange(): void {
    const search = this.searchText.toLowerCase();

    this.filteredProjects = this.allProjects.filter(project =>
      project.poNumber?.toLowerCase().includes(search) ||
      project.bolNumber?.toLowerCase().includes(search) ||
      project.fileName?.toLowerCase().includes(search)
    );

    this.currentPage = 1;
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
          this.updatePagination();
        },
        error: (error) => {
          console.error('API Error:', error);
        }
      });
  }

  // ================= PAGINATION =================

  updatePagination(): void {

    this.totalItems = this.filteredProjects.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

    this.pageStart = (this.currentPage - 1) * this.itemsPerPage;
    this.displayEnd = Math.min(
      this.pageStart + this.itemsPerPage,
      this.totalItems
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
