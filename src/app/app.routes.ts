import { Routes } from '@angular/router';
import path from 'node:path';
import { GestionEntretienComponent } from './gestion-entretien/gestion-entretien.component';
import { AjoutEntretienComponent } from './ajout-entretien/ajout-entretien.component';
import { CandidateComponent } from './candidate/candidate.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';




export const routes: Routes = [
   {path:'gestion_entretien', component:GestionEntretienComponent},
    {path:'ajout_entretien', component:AjoutEntretienComponent},
    {path:"candidate",component:CandidateComponent},
    {path:"admin",component:AdminLoginComponent},
    {path:"nav",component:NavBarComponent},
    {
      path: '',
      redirectTo: 'nav',
      pathMatch: 'full'
    },
   ];
