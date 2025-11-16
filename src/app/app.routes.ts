import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { VoyageListComponent } from './components/voyage/voyage-list/voyage-list.component';
import { VoyageDetailComponent } from './components/voyage/voyage-detail/voyage-detail.component';
import { VoyageCreatePageComponent } from './components/voyage/voyage-create-page/voyage-create-page.component';
import { ExplorerComponent } from './components/explorer/explorer.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfilComponent } from './components/profil/profil.component';

export const routes: Routes = [
  { path: '', redirectTo: '/explorer', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'voyages', component: VoyageListComponent },
  { path: 'voyages/:id', component: VoyageDetailComponent },
  { path: 'ajouter-voyage', component: VoyageCreatePageComponent },
  { path: 'explorer', component: ExplorerComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'profil/:id', component: ProfilComponent },
  { path: '**', redirectTo: '/explorer' }
];
