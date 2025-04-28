import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'] // <-- styleUrls avec un "s"
})
export class HomeComponent {
  constructor(private router: Router) {} // <-- il faut injecter Router dans le constructeur

  goToLogin(): void {
    this.router.navigate(['/login']); // <-- maintenant ça fonctionne
  }
}
