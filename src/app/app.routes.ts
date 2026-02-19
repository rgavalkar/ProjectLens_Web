import { Routes } from '@angular/router';
import { ProjectListComponent } from './pages/project-list/project-list.component';
import { ProjectDetailsComponent } from './pages/project-details/project-details.component';
import { LoginComponent } from './pages/login/login.component';
import { UsersComponent } from './pages/users/users.component';

// export const routes: Routes = [
//   { path: '', component: ProjectListComponent },              // Project list page
//   { path: 'project/:id', component: ProjectDetailsComponent } // Project details page
// ];

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, 
  { path: 'dashboard', component: ProjectListComponent },
   { path: 'users', component: UsersComponent },  
  { path: 'project/:id', component: ProjectDetailsComponent },
];

