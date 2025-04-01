import { Routes } from '@angular/router';
import path from 'node:path';
import { AdminComponent } from './admin/admin.component';
import { ClientComponent } from './client/client.component';

export const routes: Routes = [
    { path: 'admin', component: AdminComponent },
    {path:'client' ,component:ClientComponent},
];
