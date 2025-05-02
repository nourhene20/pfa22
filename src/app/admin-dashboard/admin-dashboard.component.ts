
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule,NavbarComponent,FooterComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  selectedDomaine = '';
  domaines: string[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.http.get<string[]>('http://localhost:5000/entretien/domaines')
      .subscribe({
        next: (data) => this.domaines = data,
        error: (err) => console.error('Erreur chargement domaines entretien', err)
      });
  }

  goToCandidats(): void {
    if (this.selectedDomaine) {
      this.router.navigate(['/candidats'], { queryParams: { domaine: this.selectedDomaine } });
    }
  }
  navigateTo(path: string) {
    this.router.navigate([`/${path}`]);
  }
  logout(): void {
      localStorage.removeItem('token');        // au cas où tu stockes dans sessionStorage
      this.router.navigate(['/login']);
    }
  }
  
