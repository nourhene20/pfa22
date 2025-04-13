import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Candidate {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  domaine: string;
  selected?: boolean;
}

@Component({
  selector: 'app-candidats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './candidats.component.html',
  styleUrls: ['./candidats.component.scss']
})
export class CandidatsComponent implements OnInit {
  generatedLinks: string[] = [];
  candidats: Candidate[] = [];
  domaine = '';

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.domaine = params['domaine'];
      if (this.domaine) {
        this.loadCandidats(this.domaine);
      }
    });
  }

  loadCandidats(domaine: string): void {
    this.http.get<Candidate[]>(`http://localhost:3000/api/candidates/domaine/${domaine}`)
      .subscribe({
        next: (data) => this.candidats = data,
        error: (err) => console.error('Erreur chargement candidats', err)
      });
  }

  getInitials(nom: string, prenom: string): string {
    return (nom?.[0] || '').toUpperCase() + (prenom?.[0] || '').toUpperCase();
  }
  generateLink(nom: string, prenom: string): string {
    const candidatId = this.getInitials(nom, prenom);
    const baseUrl = window.location.origin;
return `${baseUrl}/entretien?entretienId=${encodeURIComponent(this.domaine)}&candidatId=${candidatId}`;
  }
  
  onSubmitSelection(): void {
    const selection = this.candidats.filter(c => c.selected);
    if (selection.length === 0) {
      alert('Aucun candidat sélectionné.');
      return;
    }
    console.log('Candidats sélectionnés :', selection);
    this.generatedLinks = selection.map(c =>
      this.generateLink(c.nom, c.prenom)
    );
  }
}