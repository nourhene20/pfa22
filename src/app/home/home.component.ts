import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [CommonModule,FooterComponent, FormsModule, RouterModule,],
  styleUrls: ['./home.component.scss'] // <-- styleUrls avec un "s"
})
export class HomeComponent {
  constructor(private router: Router) {} // <-- il faut injecter Router dans le constructeur

  goToLogin(): void {
    this.router.navigate(['/login']); // <-- maintenant ça fonctionne
  }
}
