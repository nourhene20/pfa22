import { Routes } from '@angular/router';
import path from 'node:path';
import { GestionEntretienComponent } from './gestion-entretien/gestion-entretien.component';
import { AjoutEntretienComponent } from './ajout-entretien/ajout-entretien.component';




export const routes: Routes = [
   {path:'gestion_entretien', component:GestionEntretienComponent},
    {path:'ajout_entretien', component:AjoutEntretienComponent},
    {path:"edit/:id",component:AjoutEntretienComponent}
   ];
