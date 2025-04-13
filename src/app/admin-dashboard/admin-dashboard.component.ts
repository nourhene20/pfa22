import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule, NavbarComponent],
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
}
