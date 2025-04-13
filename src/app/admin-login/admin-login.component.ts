import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent {
  loginForm: FormGroup;
  errorMessage = '';
  successMessage = '';

  constructor(private fb: FormBuilder, private router: Router) {
    // Initialisation du formulaire avec validation
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    const { email, password } = this.loginForm.value;

    // ✅ Vérification statique (à remplacer par une requête API plus tard)
    if (email === 'admin@example.com' && password === 'admin123') {
      this.successMessage = 'Connexion réussie ! Redirection...';
      this.errorMessage = '';

      setTimeout(() => {
        this.router.navigate(['/admin']);
      }, 1000);
    } else {
      this.errorMessage = 'Identifiants incorrects';
      this.successMessage = '';
    }
  }
}
