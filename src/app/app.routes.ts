// import { Routes } from '@angular/router';
// import { ProjectListComponent } from './pages/project-list/project-list.component';
// import { ProjectDetailsComponent } from './pages/project-details/project-details.component';
// import { LoginComponent } from './pages/login/login.component';
// import { UsersComponent } from './pages/users/users.component';

// export const routes: Routes = [
//   { path: '', component: ProjectListComponent },              // Project list page
//   { path: 'project/:id', component: ProjectDetailsComponent } // Project details page
// ];

// export const routes: Routes = [
//   { path: 'login', component: LoginComponent },
//   { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, 
//   { path: 'dashboard', component: ProjectListComponent },
//    { path: 'users', component: UsersComponent },  
//   { path: 'project/:id', component: ProjectDetailsComponent },
// ];

import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { ProjectListComponent } from './pages/project-list/project-list.component';
import { ProjectDetailsComponent } from './pages/project-details/project-details.component';
import { UsersComponent } from './pages/users/users.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [

  // 👇 FIRST route should be login
  { path: 'login', component: LoginComponent },

  // 👇 VERY IMPORTANT
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // 👇 Protected routes
  { path: 'dashboard', component: ProjectListComponent, canActivate: [AuthGuard] },
  { path: 'users', component: UsersComponent, canActivate: [AuthGuard] },
  { path: 'project/:id', component: ProjectDetailsComponent, canActivate: [AuthGuard] },
  

  // Optional fallback
  { path: '**', redirectTo: 'login' }

];