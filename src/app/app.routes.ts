import { Routes } from '@angular/router';
import { GestionEntretienComponent } from './gestion-entretien/gestion-entretien.component';
import { AjoutEntretienComponent } from './ajout-entretien/ajout-entretien.component';
import { CandidateComponent } from './candidate/candidate.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { CandidatsComponent } from './candidats/candidats.component';
import { DateComponent } from './date/date.component';
import { InterviewComponent } from './interview/interview.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'gestion_entretien', component: GestionEntretienComponent },
  { path: 'ajout_entretien', component: AjoutEntretienComponent },
  { path: 'candidate', component: CandidateComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'login', component: AdminLoginComponent },
  { path: 'nav', component: NavBarComponent },
  { path: 'candidats', component: CandidatsComponent },
  {path:'date',component:DateComponent},
  {path:'interview',component:InterviewComponent},
  { path: 'interview/:domaine', component: InterviewComponent },
];
