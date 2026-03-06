import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { ProjectListComponent } from './pages/project-list/project-list.component';
import { ProjectDetailsComponent } from './pages/project-details/project-details.component';
import { UsersComponent } from './pages/users/users.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [

  // 👇 Login page
  { path: 'login', component: LoginComponent },

  // 👇 Forgot password page 
  { path: 'forgot-password', component: ForgotPasswordComponent },

  // 👇 Default route
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // 👇 Protected routes
  { path: 'dashboard', component: ProjectListComponent, canActivate: [AuthGuard] },
  { path: 'users', component: UsersComponent, canActivate: [AuthGuard] },
  { path: 'project/:id', component: ProjectDetailsComponent, canActivate: [AuthGuard] },

  // 👇 Fallback
  { path: '**', redirectTo: 'login' }

];