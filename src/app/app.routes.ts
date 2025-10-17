import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { VoyageListComponent } from './components/voyage/voyage-list/voyage-list.component';
import { VoyageDetailComponent } from './components/voyage/voyage-detail/voyage-detail.component';
import { VoyageFormComponent } from './components/voyage/voyage-form/voyage-form.component';
import { ExplorerComponent } from './components/explorer/explorer.component';
import { ProfilComponent } from './components/profil/profil.component';

export const routes: Routes = [
  { path: '', redirectTo: '/explorer', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'voyages', component: VoyageListComponent },
  { path: 'voyages/:id', component: VoyageDetailComponent },
  { path: 'ajouter-voyage', component: VoyageFormComponent },
  { path: 'explorer', component: ExplorerComponent },
  { path: 'profil/:id', component: ProfilComponent },
  { path: '**', redirectTo: '/explorer' }
];
