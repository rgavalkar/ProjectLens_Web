import { Routes } from '@angular/router';
import { ProjectListComponent } from './pages/project-list/project-list.component';
import { ProjectDetailsComponent } from './project-details/project-details.component';

export const routes: Routes = [
  { path: '', component: ProjectListComponent },            // Project list page
  { path: 'project/:id', component: ProjectDetailsComponent } // Project details page
];
