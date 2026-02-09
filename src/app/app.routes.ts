import { Routes } from '@angular/router';
import { ProjectListComponent } from './pages/project-list/project-list.component';
import { ProjectDetailsComponent } from './pages/project-details/project-details.component';
import { LoginComponent } from './pages/login/login.component';



export const routes: Routes = [
  { path: '', component: ProjectListComponent },              // Project list page
  { path: 'project/:id', component: ProjectDetailsComponent } // Project details page
];


// export const routes: Routes = [
//   { path: '', component: LoginComponent },
//   { path: 'dashboard', component: ProjectListComponent },
//   { path: 'project/:id', component: ProjectDetailsComponent }
// ];
