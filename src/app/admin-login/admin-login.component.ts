import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  standalone:true,
  styleUrls: ['./admin-login.component.scss'],
  imports:[ ReactiveFormsModule,RouterModule,CommonModule]
})
export class AdminLoginComponent {
  loginForm: FormGroup;
  errorMessage = '';
  successMessage = '';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    const { email, password } = this.loginForm.value;

    this.http.post<any>('http://localhost:5001/api/login', { email, password }).subscribe({
      next: res => {
        this.successMessage = res.message;
        this.errorMessage = '';
        localStorage.setItem('token', res.token); // enregistrer le token
        setTimeout(() => this.router.navigate(['/admin']), 1000);
      },
      error: err => {
        this.errorMessage = err.error.message || 'Erreur de connexion';
        this.successMessage = '';
      }
    });
  }
}
