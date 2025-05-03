import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {
  results: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('http://localhost:3000/api/results').subscribe({
      next: data => this.results = data,
      error: err => console.error('❌ Erreur chargement résultats', err)
    });
  }
  deleteResult(r: any): void {
    if (confirm(`Supprimer l'entretien de ${r.nom} ${r.prenom} ?`)) {
      this.http.delete(`http://localhost:3000/api/results/${r.email}`).subscribe({
        next: () => {
          this.results = this.results.filter(res => res.email !== r.email);
          console.log('✅ Supprimé avec succès');
        },
        error: err => console.error('❌ Erreur suppression', err)
      });
    }
  }
  
  
}
