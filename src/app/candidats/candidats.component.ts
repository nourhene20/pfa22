import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedDataService } from '../shared-data.service'; 

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
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './candidats.component.html',
  styleUrls: ['./candidats.component.scss']
})
export class CandidatsComponent implements OnInit {
  validationMessage: string = '';
  generatedLinks: string[] = [];
  candidats: Candidate[] = [];
  domaine: string = '';
  selectionValidee: boolean = false; // 🔥 nouvel état

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private sharedDataService: SharedDataService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.domaine = params['domaine'] || '';
      if (this.domaine) {
        this.loadCandidats(this.domaine);
      }
    });
  }

  loadCandidats(domaine: string): void {
    this.http.get<Candidate[]>(`http://localhost:3000/api/candidates/domaine/${encodeURIComponent(domaine)}`)
      .subscribe({
        next: (data) => this.candidats = data,
        error: (err) => console.error('Erreur lors du chargement des candidats :', err)
      });
  }

  generateLink(candidat: Candidate): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/entretien?entretienId=${encodeURIComponent(this.domaine)}&candidatId=${encodeURIComponent(candidat._id)}`;
  }

  onValiderSelection(): void {
    const selection = this.candidats.filter(c => c.selected);
    if (selection.length === 0) {
      alert('Aucun candidat sélectionné.');
      return;
    }
    
    // 🔥 Stocker dans SharedDataService
    this.sharedDataService.selectedEmails = selection.map(c => c.email);
    this.sharedDataService.generatedLinks = selection.map(c => this.generateLink(c));
    this.sharedDataService.selectedDomaine = this.domaine;
  
    // 🔥 Stocker aussi dans localStorage en vérifiant qu'on est dans le navigateur
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedEmails', JSON.stringify(this.sharedDataService.selectedEmails));
      localStorage.setItem('generatedLinks', JSON.stringify(this.sharedDataService.generatedLinks));
      localStorage.setItem('selectedDomaine', this.sharedDataService.selectedDomaine);
    }
  
    this.selectionValidee = true;
    this.validationMessage = '✅ Sélection validée avec succès !';
    setTimeout(() => {
      this.validationMessage = '';
    }, 3000);
  }

  onSuivant(): void {
    if (!this.selectionValidee) {
      alert('Veuillez d\'abord valider la sélection.');
      return;
    }
    this.router.navigate(['/reglage-validite']);
  }
}
