import { Component } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CandidateComponent } from './candidate/candidate.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `<app-admin-login></app-admin-login>`,
  styleUrls: ['./app.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,     // ✅ obligatoire ici
    CandidateComponent,
    AdminLoginComponent,
  ]
})
export class AppComponent {
  title = 'pfa2025';
}
