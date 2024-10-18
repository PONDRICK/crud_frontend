import { Routes } from '@angular/router';
import { UsersDashboardComponent } from './components/users-dashboard/users-dashboard.component';
import { UserListComponent } from './components/user-list/user-list.component';
export const routes: Routes = [
  { path: '', component: UsersDashboardComponent },
  { path: 'dashboard', component: UserListComponent },
];
