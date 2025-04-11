import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent {
  loginForm: FormGroup;
  errorMessage = '';

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    const { email, password } = this.loginForm.value;

    // Simple vérification statique (remplace par appel API dans un vrai projet)
    if (email === 'admin@example.com' && password === 'admin123') {
      console.log('Admin connecté');
      this.errorMessage = '';
      // Redirection ou affichage d'une page admin ici
    } else {
      this.errorMessage = 'Email ou mot de passe incorrect';
    }
  }
}