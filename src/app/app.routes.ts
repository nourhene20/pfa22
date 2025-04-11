import { Routes } from '@angular/router';
import { CandidateComponent } from './candidate/candidate.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';

export const routes: Routes = [
    {
path:'candidate',component:CandidateComponent
    },
    {
        path:'admin-login',component:AdminLoginComponent
            },
];
