
import { Routes } from '@angular/router';
import { GestionEntretienComponent } from './gestion-entretien/gestion-entretien.component';
import { AjoutEntretienComponent } from './ajout-entretien/ajout-entretien.component';
import { CandidateComponent } from './candidate/candidate.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { CandidatsComponent } from './candidats/candidats.component';
import { InterviewComponent } from './interview/interview.component';
import { HomeComponent } from './home/home.component';
import { ReglageValiditeComponent } from './reglage-validite/reglage-validite.component';
import { ResumeComponent } from './resume/resume.component';
import { LienInvalideComponent } from './lien-invalide.component';
import { ResultsComponent } from './results/results.component';
import { NavbarComponent } from './navbar/navbar.component';
export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'ajout_entretien', component: AjoutEntretienComponent },
  { path: 'candidate', component: CandidateComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'login', component: AdminLoginComponent },
  {path:'nav',component:NavbarComponent},
  { path: 'candidats', component: CandidatsComponent },
  {path:'interview',component:InterviewComponent},
  { path: 'interview/:domaine', component: InterviewComponent },
  { path: 'entretien/:domaine', component: InterviewComponent },
  { path: 'home', component: HomeComponent },
  { path: 'reglage-validite', component: ReglageValiditeComponent },
  { path: 'resume', component: ResumeComponent },
  { path: 'invalide', component: LienInvalideComponent },
  {path:'results', component:ResultsComponent},
  { path: 'gestion-entretien', component: GestionEntretienComponent },
  
];
